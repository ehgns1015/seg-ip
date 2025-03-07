import { NextResponse } from "next/server";
import { units } from "@/app/lib/mongo";

// Enforces dynamic rendering for this API route
export const dynamic = "force-dynamic";

/**
 * Handles the GET request to retrieve all units from the database.
 *
 * This function fetches all unit records from the database, sorts them by IP address in ascending order,
 * and returns the results in JSON format. If an error occurs, it returns an error message with a 500 status code.
 *
 * @returns {NextResponse} JSON response containing unit data or an error message.
 */
export async function GET() {
  try {
    const data = await units.find({}).sort({ ip: 1 }).toArray();
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

/**
 * Handles the POST request to create a new unit in the database.
 *
 * This function creates a new unit record. It first validates if the required `name` field is provided and checks if
 * the `name` or `ip` already exists in the database. If either exists, it returns an appropriate error message.
 * After successful validation, the new unit is inserted into the database.
 *
 * @param {Request} req - The HTTP request object containing the unit data in JSON format.
 * @returns {NextResponse} JSON response containing the newly created unit or an error message.
 */
export async function POST(req: Request) {
  try {
    const { name, ip, ...rest } = await req.json(); // Extracts 'name', 'ip', and the rest of the data
    // Validate if 'name' is provided
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if a unit with the same name already exists
    const existingName = await units.findOne({ name });

    if (existingName) {
      return NextResponse.json(
        { error: "Name already exists" },
        { status: 400 }
      );
    }

    // If an IP is provided, check if the IP is already taken
    if (ip) {
      const existingIP = await units.findOne({ ip });

      if (existingIP) {
        return NextResponse.json(
          { error: "IP already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare the new unit object with the provided data
    const newUnit = { name: name, ip: ip || "", ...rest };

    // Insert the new unit into the database
    await units.insertOne(newUnit);

    return NextResponse.json(newUnit, { status: 201 }); // Return the newly created unit with status 201
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
