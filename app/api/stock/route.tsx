import { NextRequest } from "next/server";
import { db } from "@/app/lib/mongo";
import { createApiResponse, handleApiError } from "@/app/lib/api-utils";

// Get inventory collection
const inventory = db.collection("inventory");

// Force dynamic rendering
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
 * Handles GET request to retrieve inventory items
 * Can filter by location if location query parameter is provided
 */
export async function GET(request: NextRequest) {
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

    return createApiResponse(formattedData);
  } catch (error) {
    return handleApiError(error, "Failed to fetch inventory items");
  }
}

/**
 * Handles POST request to create a new inventory item
 * Validates input data and checks for duplicate items within the same location
 */
export async function POST(req: NextRequest) {
  try {
    const { item, quantity, EOS, location, note } = await req.json();

    // Validate required fields
    if (!item) {
      return createApiResponse(undefined, "Item name is required", 400);
    }

    if (!location) {
      return createApiResponse(undefined, "Location is required", 400);
    }

    // Remove trailing spaces from string fields - keep other spaces intact
    const trimmedItem = item.replace(/\s+$/, "");
    const trimmedNote = note ? note.replace(/\s+$/, "") : "";

    // Check if item already exists in the specified location
    const existingItem = await inventory.findOne({
      item: trimmedItem,
      location,
    });

    if (existingItem) {
      return createApiResponse(
        undefined,
        "Item already exists in this location",
        400
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
    return createApiResponse(
      { ...newItem, updatedFormatted: formatDate(now) },
      undefined,
      201
    );
  } catch (error) {
    return handleApiError(error, "Failed to create inventory item");
  }
}
