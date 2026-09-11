import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import  db  from "@/lib/db";

interface ShippingRate extends RowDataPacket {
  id: number;
  name: string;
  rate: number;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

// ============================================================
// GET SINGLE SHIPPING RATE
// GET /api/admin/shipping-rates/:id
// ============================================================

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const shippingRateId = Number(id);

    if (
      !Number.isInteger(shippingRateId) ||
      shippingRateId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid shipping rate ID",
        },
        { status: 400 }
      );
    }

    const result = await db.query<ShippingRate>(
      `
      SELECT
        id,
        name,
        rate,
        status,
        created_at,
        updated_at
      FROM shipping_rates
      WHERE id = $1
      LIMIT 1
      `,
      [shippingRateId]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping rate not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(
      "Get shipping rate error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch shipping rate",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// UPDATE SHIPPING RATE
// PUT /api/admin/shipping-rates/:id
// ============================================================

export async function PUT(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const shippingRateId = Number(id);

    if (
      !Number.isInteger(shippingRateId) ||
      shippingRateId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid shipping rate ID",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      name,
      rate,
      status,
    } = body;

    // -----------------------------
    // Check existing record
    // -----------------------------

    const existingResult =
      await db.query<ShippingRate>(
        `
        SELECT
          id,
          name,
          rate,
          status
        FROM shipping_rates
        WHERE id = $1
        LIMIT 1
        `,
        [shippingRateId]
      );

    const existingRows = existingResult.rows;

    if (existingRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping rate not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Validation
    // -----------------------------

    if (
      !name ||
      typeof name !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipping rate name is required",
        },
        { status: 400 }
      );
    }

    if (
      rate === undefined ||
      rate === null ||
      rate === "" ||
      Number.isNaN(Number(rate))
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid shipping rate is required",
        },
        { status: 400 }
      );
    }

    if (
      !["ACTIVE", "INACTIVE"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Check duplicate name
    // -----------------------------

    const duplicateResult =
      await db.query<ShippingRate>(
        `
        SELECT id
        FROM shipping_rates
        WHERE name = $1
          AND id != $2
        LIMIT 1
        `,
        [
          name.trim(),
          shippingRateId,
        ]
      );

    const duplicateRows =
      duplicateResult.rows;

    if (duplicateRows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another shipping rate with this name already exists",
        },
        { status: 409 }
      );
    }

    // -----------------------------
    // Update
    // -----------------------------

    await db.query(
      `
      UPDATE shipping_rates
      SET
        name = $1,
        rate = $2,
        status = $3
      WHERE id = $4
      `,
      [
        name.trim(),
        Number(rate),
        status,
        shippingRateId,
      ]
    );

    // -----------------------------
    // Get updated record
    // -----------------------------

    const updatedResult =
      await db.query<ShippingRate>(
        `
        SELECT
          id,
          name,
          rate,
          status,
          created_at,
          updated_at
        FROM shipping_rates
        WHERE id = $1
        `,
        [shippingRateId]
      );

    const updatedRows =
      updatedResult.rows;

    return NextResponse.json({
      success: true,
      message:
        "Shipping rate updated successfully",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error(
      "Update shipping rate error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update shipping rate",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE SHIPPING RATE
// DELETE /api/admin/shipping-rates/:id
// ============================================================

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const shippingRateId = Number(id);

    if (
      !Number.isInteger(shippingRateId) ||
      shippingRateId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid shipping rate ID",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Check existing record
    // -----------------------------

    const existingResult =
      await db.query<ShippingRate>(
        `
        SELECT id
        FROM shipping_rates
        WHERE id = $1
        LIMIT 1
        `,
        [shippingRateId]
      );

    const existingRows = existingResult.rows;

    if (existingRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping rate not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Delete
    // -----------------------------

    await db.query(
      `
      DELETE FROM shipping_rates
      WHERE id = $1
      `,
      [shippingRateId]
    );

    return NextResponse.json({
      success: true,
      message: "Shipping rate deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete shipping rate error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete shipping rate",
      },
      { status: 500 }
    );
  }
}