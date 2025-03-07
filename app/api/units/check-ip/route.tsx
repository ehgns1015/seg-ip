import { NextResponse } from "next/server";
import { units } from "@/app/lib/mongo"; // DB connection code

/**
 * POST request to check if an IP address already exists in the database.
 *
 * This function checks if the provided IP address already exists in the units collection.
 * If the IP is found, it returns a 400 error with a message indicating that the IP is already taken.
 * If the IP is available, it returns a success message with a 201 status code.
 *
 * @param {Request} req - The HTTP request object, which contains the IP address in the body.
 * @returns {NextResponse} JSON response containing either an error message or a success message.
 */
export async function POST(req: Request) {
  const { ip } = await req.json(); // Extract the IP address from the request body
  try {
    // Check if the IP already exists in the units collection
    const unit = await units.findOne({ ip });

    if (unit) {
      // If the IP is already in use, return a 400 error
      return NextResponse.json(
        { message: "IP Address Already Exists." },
        { status: 400 }
      );
    }

    // If the IP is available, return a success message with a 201 status
    return NextResponse.json({ message: "Available." }, { status: 201 });
  } catch (error) {
    // Handle server error by returning a 500 status
    console.log(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
