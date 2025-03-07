import { NextResponse } from "next/server";
import { units } from "@/app/lib/mongo";
import { ObjectId } from "mongodb";

/**
 * GET request to retrieve a unit by its name.
 *
 * This function retrieves the unit details from the database using the provided name parameter.
 * If no name is provided or the unit is not found, it returns an error message.
 *
 * @param {Request} req - The incoming request object.
 * @param {Object} params - The parameters containing the unit name.
 * @param {string} params.name - The name of the unit to retrieve.
 * @returns {NextResponse} JSON response containing either the unit data or an error message.
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
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

/**
 * PUT request to update a unit's details by its ID.
 *
 * This function updates an existing unit in the database using the provided unit details and ID.
 * If the unit is not found or an ID is not provided, it returns an error message.
 *
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} JSON response containing either the updated unit data or an error message.
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

    // Check for name duplication when name is changing
    if (name && name !== existingUnit.name) {
      const duplicateName = await units.findOne({
        name: name,
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
    } else if (!sharedComputer && ip && ip !== existingUnit.ip) {
      // Regular IP validation for non-shared computers when IP is changing
      const duplicateIP = await units.findOne({
        ip: ip,
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

    // Prepare the updated unit data, using existing values if not provided
    const updatedUnit = {
      name: name || existingUnit.name,
      ip: finalIp || existingUnit.ip,
      sharedComputer:
        sharedComputer !== undefined
          ? sharedComputer
          : existingUnit.sharedComputer,
      primaryUser: sharedComputer
        ? primaryUser || existingUnit.primaryUser
        : null,
      ...rest,
    };

    // Update the unit in the database
    await units.updateOne({ _id: objectId }, { $set: updatedUnit });

    return NextResponse.json(updatedUnit, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

/**
 * DELETE request to delete a unit by its name.
 *
 * This function deletes a unit from the database using the provided name parameter.
 * If the unit is not found, it returns an error message.
 *
 * @param {Request} req - The incoming request object.
 * @param {Object} params - The parameters containing the unit name.
 * @param {string} params.name - The name of the unit to delete.
 * @returns {NextResponse} JSON response confirming the deletion or an error message.
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
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
