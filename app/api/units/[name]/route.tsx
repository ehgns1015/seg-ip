import { NextResponse } from "next/server";
import { db } from "@/app/lib/mongo";
import { ObjectId } from "mongodb";

// Get the units collection
const units = db.collection("units");

/**
 * Helper function to handle server errors consistently
 *
 * @param {unknown} errorObj - The error that occurred
 * @param {string} message - Custom error message
 * @returns {NextResponse} A standardized error response
 */
function handleServerError(errorObj: unknown, message: string): NextResponse {
  console.error(`${message}:`, errorObj);
  return NextResponse.json({ error: "Server Error" }, { status: 500 });
}

/**
 * GET request to retrieve a unit by its name.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const unit = await units.findOne({ name });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (errorObj) {
    return handleServerError(errorObj, "Error retrieving unit");
  }
}

/**
 * PUT request to update a unit's details by its ID.
 */
export async function PUT(req: Request) {
  try {
    const { name, ip, _id, sharedComputer, primaryUser, ...rest } =
      await req.json();

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Convert _id to ObjectId for MongoDB
    const objectId = new ObjectId(_id);

    const existingUnit = await units.findOne({ _id: objectId });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Remove trailing spaces from name if provided
    const trimmedName = name ? name.replace(/\s+$/, "") : existingUnit.name;

    // Check for invalid characters in name
    const problematicCharsRegex = /[/?&=#:%+'"\\;<>]/;
    if (problematicCharsRegex.test(trimmedName)) {
      return NextResponse.json(
        {
          error:
            "Name contains characters that are not allowed (/ ? & = # : % + ' \" \\ ; < >)",
        },
        { status: 400 }
      );
    }

    // Check for name duplication when name is changing
    if (trimmedName && trimmedName !== existingUnit.name) {
      const duplicateName = await units.findOne({
        name: trimmedName,
        _id: { $ne: objectId },
      });

      if (duplicateName) {
        return NextResponse.json(
          { error: "Name already exists" },
          { status: 400 }
        );
      }
    }

    // Handle IP validation and shared computer scenario
    let finalIp = ip;
    const finalSharedComputer =
      sharedComputer !== undefined
        ? sharedComputer
        : existingUnit.sharedComputer;

    if (finalSharedComputer === true && primaryUser) {
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
    } else if (!finalSharedComputer) {
      // When switching from shared to non-shared OR when changing IP for a non-shared computer
      const isChangingFromSharedToNonShared =
        existingUnit.sharedComputer === true && finalSharedComputer === false;
      const isChangingIP = ip && ip !== existingUnit.ip;

      // Check IP conflicts when either changing from shared to non-shared or changing IP
      if (isChangingFromSharedToNonShared || isChangingIP) {
        const ipToCheck = finalIp || ip || existingUnit.ip;

        // Skip validation if no IP is provided and unit is changing from shared to non-shared
        if (!ipToCheck && isChangingFromSharedToNonShared) {
          return NextResponse.json(
            {
              error:
                "IP is required when changing from shared to non-shared computer",
            },
            { status: 400 }
          );
        }

        const duplicateIP = await units.findOne({
          ip: ipToCheck,
          _id: { $ne: objectId },
          sharedComputer: { $ne: true }, // Exclude shared computers
        });

        if (duplicateIP) {
          return NextResponse.json(
            { error: "IP already exists" },
            { status: 400 }
          );
        }
      }
    }

    // Always set primaryUser to null when sharedComputer is false
    let finalPrimaryUser = null;
    if (finalSharedComputer === true) {
      finalPrimaryUser = primaryUser || existingUnit.primaryUser;
    }

    // Process rest properties to remove trailing spaces from string values
    const sanitizedRest = { ...rest };
    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === "string") {
        sanitizedRest[key] = value.replace(/\s+$/, "");
      }
    });

    // Prepare the updated unit data
    const updatedUnit = {
      name: trimmedName,
      ip: finalIp || existingUnit.ip,
      sharedComputer: finalSharedComputer,
      primaryUser: finalPrimaryUser,
      ...sanitizedRest,
    };

    // Update the unit in the database
    await units.updateOne({ _id: objectId }, { $set: updatedUnit });

    return NextResponse.json(updatedUnit, { status: 200 });
  } catch (errorObj) {
    return handleServerError(errorObj, "Failed to update unit");
  }
}

/**
 * DELETE request to delete a unit by its name.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const result = await units.deleteOne({ name: (await params).name });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Unit deleted successfully" });
  } catch (errorObj) {
    return handleServerError(errorObj, "Failed to delete unit");
  }
}
