import { NextResponse } from "next/server";
import { db } from "@/app/lib/mongo";

const cablestockCollection = db.collection("cablestock");

/**
 * Handles GET requests to retrieve cable stock data for a specific month.
 *
 * @param {Request} req - The HTTP request object
 * @param {Object} params - URL parameters containing the month
 * @param {string} params.month - Month in MM/YYYY format
 * @returns {NextResponse} JSON response containing cable stock data for the specified month
 * @throws Will handle database errors and return appropriate error response
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  try {
    const { month } = await params;

    // Retrieve month data
    const data = await cablestockCollection.findOne({ month });

    if (!data) {
      return NextResponse.json(
        { error: "No data found for this month" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Monthly cable stock retrieval error:", error);
    return NextResponse.json(
      { error: "Error retrieving monthly data" },
      { status: 500 }
    );
  }
}
