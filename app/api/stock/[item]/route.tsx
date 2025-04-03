import { NextResponse } from "next/server";
import { db } from "@/app/lib/mongo";

// Get the inventory collection
const inventory = db.collection("inventory");

/**
 * Helper function to handle server errors consistently
 */
function handleServerError(errorObj: unknown, message: string): NextResponse {
  console.error(`${message}:`, errorObj);
  return NextResponse.json({ error: "Server Error" }, { status: 500 });
}

/**
 * GET request to retrieve an inventory item by its name.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ item: string }> }
) {
  try {
    const { item } = await params;

    if (!item) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    // URL might have encoded characters, so decode it
    const decodedItem = decodeURIComponent(item);

    const inventoryItem = await inventory.findOne({ item: decodedItem });

    if (!inventoryItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(inventoryItem);
  } catch (errorObj) {
    return handleServerError(errorObj, "Error retrieving inventory item");
  }
}

/**
 * PUT request to update an inventory item by its name.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ item: string }> }
) {
  try {
    const { item } = await params;
    const { quantity, EOS, location, note } = await req.json();

    if (!item) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    // URL might have encoded characters, so decode it
    const decodedItem = decodeURIComponent(item);

    // Find the existing item
    const existingItem = await inventory.findOne({ item: decodedItem });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Set the current timestamp
    const now = new Date();

    // Remove trailing spaces only if note is provided
    const trimmedNote =
      note !== undefined ? note.replace(/\s+$/, "") : existingItem.note || "";

    // Prepare the updated item data
    const updatedItem = {
      quantity: Number(quantity),
      EOS: Boolean(EOS),
      location,
      note: trimmedNote,
      updated: now,
    };

    // Update the item in the database
    await inventory.updateOne({ item: decodedItem }, { $set: updatedItem });

    // Return the updated item
    return NextResponse.json({
      ...existingItem,
      ...updatedItem,
      updatedFormatted: new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    });
  } catch (errorObj) {
    return handleServerError(errorObj, "Failed to update inventory item");
  }
}

/**
 * DELETE request to remove an inventory item by its name.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ item: string }> }
) {
  try {
    const { item } = await params;

    if (!item) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    // URL might have encoded characters, so decode it
    const decodedItem = decodeURIComponent(item);

    const result = await inventory.deleteOne({ item: decodedItem });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (errorObj) {
    return handleServerError(errorObj, "Failed to delete inventory item");
  }
}
