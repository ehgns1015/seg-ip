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
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

/**
 * Handles the POST request to create a new unit in the database.
 *
 * This function validates the input, checks for duplicate names and IPs,
 * and handles the shared computer scenario before creating a new unit.
 *
 * @param {Request} req - The HTTP request object containing the unit data in JSON format.
 * @returns {NextResponse} JSON response containing the newly created unit or an error message.
 */
export async function POST(req: Request) {
  try {
    const { name, ip, sharedComputer, primaryUser, ...rest } = await req.json();

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

    // Handle shared computer scenario
    let finalIp = ip;
    if (sharedComputer && primaryUser) {
      // Find the primary user to get their IP
      const primaryUserUnit = await units.findOne({ name: primaryUser });
      if (!primaryUserUnit) {
        return NextResponse.json(
          { error: "Primary user not found" },
          { status: 400 }
        );
      }

      // Use the primary user's IP
      finalIp = primaryUserUnit.ip;
    } else if (!sharedComputer && ip) {
      // Regular IP validation for non-shared computers
      const existingIP = await units.findOne({
        ip,
        sharedComputer: { $ne: true }, // Exclude shared computers
      });

      if (existingIP) {
        return NextResponse.json(
          { error: "IP already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare the new unit object with the provided data
    const newUnit = {
      name,
      ip: finalIp || "",
      sharedComputer: sharedComputer || false,
      primaryUser: sharedComputer ? primaryUser : null,
      ...rest,
    };

    // Insert the new unit into the database
    await units.insertOne(newUnit);

    return NextResponse.json(newUnit, { status: 201 }); // Return the newly created unit with status 201
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
