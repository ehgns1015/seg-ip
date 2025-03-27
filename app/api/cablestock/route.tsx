import { NextResponse } from "next/server";
import { db } from "@/app/lib/mongo";

const cablestockCollection = db.collection("cablestock");

/**
 * Handles GET requests to retrieve all cable stock data.
 * Returns data from the last year, sorted by month.
 *
 * @returns {NextResponse} JSON response containing cable stock data
 * @throws Will handle database errors and return appropriate error response
 */
export async function GET() {
  try {
    // Only retrieve data from the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const data = await cablestockCollection.find({
      uploadDate: { $gte: oneYearAgo }
    }).sort({ month: 1 }).toArray();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cable stock retrieval error:", error);
    return NextResponse.json({ error: "Error retrieving data" }, { status: 500 });
  }
}