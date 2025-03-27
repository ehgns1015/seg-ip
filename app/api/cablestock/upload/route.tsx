// app/api/cablestock/upload/route.tsx
import { NextResponse } from "next/server";
import { db } from "@/app/lib/mongo";
import * as XLSX from "xlsx";
import { CableStockItem } from "@/app/types/cablestock";

const cablestockCollection = db.collection("cablestock");

/**
 * Handles POST requests to upload cable stock Excel files.
 * Enhanced with improved error handling and debugging.
 *
 * @param {Request} req - The HTTP request object containing the file in FormData
 * @returns {NextResponse} JSON response indicating success or failure
 */
export async function POST(req: Request) {
  try {
    // Extract file from request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Parse date from filename with more flexible pattern
    const fileNameMatch = file.name.match(
      /CABLE STOCK(?:\(|)(\d{2})\.(\d{2})\.(\d{4})(?:\)|)\.xlsx/i
    );
    if (!fileNameMatch) {
      return NextResponse.json(
        {
          error:
            "Invalid filename format. Expected: CABLE STOCK MM.DD.YYYY.xlsx",
          details: { filename: file.name },
        },
        { status: 400 }
      );
    }

    const [_, month, day, year] = fileNameMatch;
    const monthKey = `${month}/${year}`;

    // Process the file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

    // Log sheet names for debugging
    const sheetNames = workbook.SheetNames;
    console.log("Available sheets:", sheetNames);

    if (sheetNames.length === 0) {
      return NextResponse.json(
        { error: "Excel file has no sheets" },
        { status: 400 }
      );
    }

    const worksheet = workbook.Sheets[sheetNames[0]];

    // Log worksheet reference for debugging
    console.log("Worksheet reference:", worksheet["!ref"]);

    // Get all cell addresses for inspection
    const cellAddresses = Object.keys(worksheet).filter(
      (key) => !key.startsWith("!")
    );
    console.log("First 10 cell addresses:", cellAddresses.slice(0, 10));

    // Find header row - check multiple rows (more flexible)
    let headerRow = -1;
    for (let r = 0; r <= 5; r++) {
      // Check first 6 rows
      const categoryCellValue =
        worksheet[XLSX.utils.encode_cell({ r: r, c: 0 })]?.v;
      const typeCellValue =
        worksheet[XLSX.utils.encode_cell({ r: r, c: 1 })]?.v;

      if (categoryCellValue === "구분" && typeCellValue === "종류") {
        headerRow = r;
        break;
      }
    }

    if (headerRow === -1) {
      // Try to show what's in the first few cells to help diagnose
      const firstCells: Record<string, unknown> = {};
      for (let r = 0; r <= 5; r++) {
        for (let c = 0; c <= 5; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          if (worksheet[cellRef]) {
            firstCells[cellRef] = worksheet[cellRef].v;
          }
        }
      }

      return NextResponse.json(
        {
          error: "Could not find header row with '구분' and '종류'",
          details: { firstCells },
        },
        { status: 400 }
      );
    }

    console.log("Found header row at index:", headerRow);

    // Now use the found header row to get column indices
    const getCellValue = (row: number, col: number): unknown => {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      return cell ? cell.v : null;
    };

    // Check header values
    const categoryHeader = getCellValue(headerRow, 0); // A{headerRow+1}
    const typeHeader = getCellValue(headerRow, 1); // B{headerRow+1}
    const linnoHeader = getCellValue(headerRow, 2); // C{headerRow+1}
    const quantityHeader = getCellValue(headerRow, 3); // D{headerRow+1}

    console.log("Headers found:", {
      categoryHeader,
      typeHeader,
      linnoHeader,
      quantityHeader,
    });

    // More flexible header validation (partial match)
    const isValidCategoryHeader =
      typeof categoryHeader === "string" && categoryHeader.includes("구분");
    const isValidTypeHeader =
      typeof typeHeader === "string" && typeHeader.includes("종류");
    const isValidLinnoHeader =
      typeof linnoHeader === "string" &&
      (linnoHeader.includes("LINNO") || linnoHeader.includes("라인"));
    const isValidQuantityHeader =
      typeof quantityHeader === "string" &&
      (quantityHeader.includes("수량") || quantityHeader.includes("개수"));

    if (
      !isValidCategoryHeader ||
      !isValidTypeHeader ||
      !isValidLinnoHeader ||
      !isValidQuantityHeader
    ) {
      return NextResponse.json(
        {
          error: "Header validation failed",
          details: {
            categoryHeader,
            typeHeader,
            linnoHeader,
            quantityHeader,
            expected: {
              categoryHeader: "구분",
              typeHeader: "종류",
              linnoHeader: "LINNO 수량",
              quantityHeader: "수량",
            },
          },
        },
        { status: 400 }
      );
    }

    // Get the cell range of the worksheet
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:Z100");
    const items: CableStockItem[] = [];

    // Get merged cells info
    const mergedCells = worksheet["!merges"] || [];
    console.log("Merged cells:", mergedCells);

    // Track the current category as we process rows
    let currentCategory = "";

    // Start processing from the row after header
    for (let row = headerRow + 1; row <= range.e.r; row++) {
      // Check if current row is in a merged cell in column A
      const isMergedCategoryCell = mergedCells.some(
        (merge) =>
          merge.s.c === 0 &&
          merge.e.c === 0 && // Column A
          row >= merge.s.r &&
          row <= merge.e.r // Within row range
      );

      // Only update category from cells that are the start of a merged region or normal cells
      const categoryCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Column A
      if (
        categoryCell &&
        categoryCell.v &&
        (!isMergedCategoryCell ||
          mergedCells.some((merge) => merge.s.c === 0 && merge.s.r === row))
      ) {
        currentCategory = String(categoryCell.v).trim();
        console.log(`Row ${row + 1}: Found new category: ${currentCategory}`);
      }

      // Get type from column B
      const typeCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })]; // Column B

      // Skip rows without data in column B (type)
      if (!typeCell || !typeCell.v) {
        console.log(`Row ${row + 1}: Skipping - no type value`);
        continue;
      }

      // Get LINNO from column C
      const linnoCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 2 })]; // Column C

      // Get quantity from column D
      const quantityCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 3 })]; // Column D

      console.log(
        `Row ${row + 1}: Processing - Category: ${currentCategory}, Type: ${
          typeCell.v
        }, LINNO: ${linnoCell?.v}, Quantity: ${quantityCell?.v}`
      );

      // Process row if it has the essentials
      if (currentCategory && typeCell.v) {
        const type = String(typeCell.v).trim();
        const linno = linnoCell ? String(linnoCell.v).trim() : "";

        // Parse quantity as number, fallback to 0 if invalid
        let quantity = 0;
        if (
          quantityCell &&
          quantityCell.v !== undefined &&
          quantityCell.v !== null
        ) {
          quantity = parseInt(String(quantityCell.v), 10);
          if (isNaN(quantity)) quantity = 0;
        }

        items.push({
          type: `${currentCategory}-${type}`.trim(),
          linno: linno,
          quantity: quantity,
        });

        console.log(
          `Row ${
            row + 1
          }: Added item - ${currentCategory}-${type}, LINNO: ${linno}, Quantity: ${quantity}`
        );
      }
    }

    console.log(`Processed ${items.length} items`);

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: "No valid items found in file",
          details: { headerRow, range: worksheet["!ref"] },
        },
        { status: 400 }
      );
    }

    // Save to DB (overwrite if same month/year exists)
    await cablestockCollection.updateOne(
      { month: monthKey },
      {
        $set: {
          items,
          uploadDate: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      month: monthKey,
      itemCount: items.length,
    });
  } catch (error: unknown) {
    console.error("Cable stock upload error:", error);

    // Properly type check before accessing error properties
    const errorDetails: Record<string, unknown> = {
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };

    // Only add stack trace in development environment and if it's an Error object
    if (process.env.NODE_ENV === "development" && error instanceof Error) {
      errorDetails.stack = error.stack;
      errorDetails.name = error.name;
    }

    return NextResponse.json(
      {
        error: "Error processing file",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
