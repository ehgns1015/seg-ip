import { NextResponse } from "next/server";
import { db } from "@/app/lib/mongo";

const inventory = db.collection("inventory");
// Enforces dynamic rendering for this API route
export const dynamic = "force-dynamic";

/**
 * Formats a date as mm/dd/yyyy tt:mm
 */
function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

/**
 * Handles the GET request to retrieve inventory items from the database.
 * Can filter by location if a location query parameter is provided.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    // Create query object based on whether location is provided
    const query = location ? { location } : {};

    // Get inventory items, sorting by item name
    const data = await inventory.find(query).sort({ item: 1 }).toArray();

    // Format dates for client display
    const formattedData = data.map((item) => ({
      ...item,
      updatedFormatted: formatDate(new Date(item.updated)),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory items" },
      { status: 500 }
    );
  }
}

/**
 * Handles the POST request to create a new inventory item in the database.
 * Validates input data and checks for duplicate items within the same location.
 */
export async function POST(req: Request) {
  try {
    const { item, quantity, EOS, location, note } = await req.json();

    // Validate required fields
    if (!item) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    // Trim whitespace from string fields
    const trimmedItem = item.trim();
    const trimmedNote = note ? note.trim() : "";

    // Check if item already exists in the specified location
    const existingItem = await inventory.findOne({
      item: trimmedItem,
      location,
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists in this location" },
        { status: 400 }
      );
    }

    // Set the current timestamp
    const now = new Date();

    // Create new inventory item object
    const newItem = {
      item: trimmedItem,
      quantity: Number(quantity) || 0,
      EOS: Boolean(EOS),
      updated: now,
      location,
      note: trimmedNote,
    };

    // Insert into database
    await inventory.insertOne(newItem);

    // Return the newly created item with formatted date
    return NextResponse.json(
      { ...newItem, updatedFormatted: formatDate(now) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
