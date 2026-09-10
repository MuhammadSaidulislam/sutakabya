import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "@/lib/db";

interface ShippingRate extends RowDataPacket {
  id: number;
  name: string;
  rate: number;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

// ============================================================
// GET ALL SHIPPING RATES
// GET /api/admin/shipping-rates
// ============================================================

export async function GET() {
  try {
    const [rows] = await db.query<ShippingRate[]>(
      `
      SELECT
        id,
        name,
        rate,
        status,
        created_at,
        updated_at
      FROM shipping_rates
      ORDER BY id DESC
      `
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get shipping rates error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch shipping rates",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// CREATE SHIPPING RATE
// POST /api/admin/shipping-rates
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      rate,
      status = "ACTIVE",
    } = body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping rate name is required",
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
          message: "Valid shipping rate is required",
        },
        { status: 400 }
      );
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
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

    const [existing] = await db.query<ShippingRate[]>(
      `
      SELECT id
      FROM shipping_rates
      WHERE name = ?
      LIMIT 1
      `,
      [name.trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping rate with this name already exists",
        },
        { status: 409 }
      );
    }

    // -----------------------------
    // Insert
    // -----------------------------

    const [result] = await db.query<ResultSetHeader>(
      `
      INSERT INTO shipping_rates
        (name, rate, status)
      VALUES
        (?, ?, ?)
      `,
      [
        name.trim(),
        Number(rate),
        status,
      ]
    );

    // -----------------------------
    // Get created record
    // -----------------------------

    const [rows] = await db.query<ShippingRate[]>(
      `
      SELECT
        id,
        name,
        rate,
        status,
        created_at,
        updated_at
      FROM shipping_rates
      WHERE id = ?
      `,
      [result.insertId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Shipping rate created successfully",
        data: rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create shipping rate error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create shipping rate",
      },
      { status: 500 }
    );
  }
}