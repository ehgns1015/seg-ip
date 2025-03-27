import { NextResponse } from "next/server";
import { db } from "@/app/lib/mongo";
import { ConsumptionItem } from "@/app/types/cablestock";

const cablestockCollection = db.collection("cablestock");

/**
 * Handles GET requests to compare cable stock data between two months.
 * Calculates consumption quantities and rates.
 *
 * @param {Request} req - The HTTP request object with query parameters
 * @returns {NextResponse} JSON response containing consumption data
 * @throws Will handle database errors and return appropriate error response
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromMonth = searchParams.get("from");
    const toMonth = searchParams.get("to");

    if (!fromMonth || !toMonth) {
      return NextResponse.json(
        { error: "Comparison months not specified" },
        { status: 400 }
      );
    }

    // Retrieve data for both months
    const fromData = await cablestockCollection.findOne({ month: fromMonth });
    const toData = await cablestockCollection.findOne({ month: toMonth });

    if (!fromData || !toData) {
      return NextResponse.json(
        { error: "Data not found for comparison months" },
        { status: 404 }
      );
    }

    // Calculate consumption
    const consumptionData: ConsumptionItem[] = fromData.items.map(
      (fromItem: any) => {
        const toItem = toData.items.find(
          (item: any) => item.type === fromItem.type
        );

        return {
          type: fromItem.type,
          linno: fromItem.linno,
          fromQuantity: fromItem.quantity,
          toQuantity: toItem ? toItem.quantity : 0,
          consumption: fromItem.quantity - (toItem ? toItem.quantity : 0),
          consumptionRate: toItem
            ? (
                ((fromItem.quantity - toItem.quantity) / fromItem.quantity) *
                100
              ).toFixed(2) + "%"
            : "100%",
        };
      }
    );

    return NextResponse.json({
      fromMonth,
      toMonth,
      items: consumptionData,
    });
  } catch (error) {
    console.error("Cable stock comparison error:", error);
    return NextResponse.json(
      { error: "Error comparing data" },
      { status: 500 }
    );
  }
}
