import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { requireAdmin } from "@/lib/admin-auth";

// ------------------------------------------------------------------
// Create Coupon
// ------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();

    const {
      code,
      discount_percentage,
      status = "ACTIVE",
    } = body;

    // --------------------------------------------------------------
    // Validation
    // --------------------------------------------------------------

    if (!code || discount_percentage == null) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code and discount percentage are required.",
        },
        { status: 400 }
      );
    }

    const discountPercentage = Number(discount_percentage);

    if (
      !Number.isFinite(discountPercentage) ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount percentage must be between 1 and 100.",
        },
        { status: 400 }
      );
    }

    // Only allow these statuses
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon status.",
        },
        { status: 400 }
      );
    }

    const couponCode = String(code).trim().toUpperCase();

    // --------------------------------------------------------------
    // Check duplicate coupon
    // --------------------------------------------------------------

    const [exists] = await db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM coupons
      WHERE code = ?
      LIMIT 1
      `,
      [couponCode]
    );

    if (exists.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------------------
    // Create Coupon
    // --------------------------------------------------------------

    const [result] = await db.query<ResultSetHeader>(
      `
      INSERT INTO coupons
      (
        code,
        discount_percentage,
        used,
        status
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        couponCode,
        discountPercentage,
        0,
        status,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully.",
        data: {
          id: result.insertId,
          code: couponCode,
          discount_percentage: discountPercentage,
          used: 0,
          status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create coupon error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------
// Get All Coupons
// ------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 10), 1),
      100
    );

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    // --------------------------------------------------------------
    // Where conditions
    // --------------------------------------------------------------

    let where = "WHERE 1=1";

    const params: (string | number)[] = [];

    if (search.trim()) {
      where += " AND code LIKE ?";
      params.push(`%${search.trim()}%`);
    }

    if (
      status &&
      status !== "All"
    ) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid status filter.",
          },
          { status: 400 }
        );
      }

      where += " AND status = ?";
      params.push(status);
    }

    // --------------------------------------------------------------
    // Total count
    // --------------------------------------------------------------

    const [countRows] = await db.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM coupons
      ${where}
      `,
      params
    );

    const total = Number(countRows[0]?.total || 0);

    // --------------------------------------------------------------
    // Get coupons
    // --------------------------------------------------------------

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT
        id,
        code,
        discount_percentage,
        used,
        status,
        created_at,
        updated_at
      FROM coupons
      ${where}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch coupons error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupons.",
      },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------
// Update Coupon
// ------------------------------------------------------------------

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();

    const {
      id,
      code,
      discount_percentage,
      status,
    } = body;

    // --------------------------------------------------------------
    // Validation
    // --------------------------------------------------------------

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon ID is required.",
        },
        { status: 400 }
      );
    }

    if (!code || discount_percentage == null) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code and discount percentage are required.",
        },
        { status: 400 }
      );
    }

    const discountPercentage = Number(discount_percentage);

    if (
      !Number.isFinite(discountPercentage) ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount percentage must be between 1 and 100.",
        },
        { status: 400 }
      );
    }

    if (
      status &&
      !["ACTIVE", "INACTIVE"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon status.",
        },
        { status: 400 }
      );
    }

    const couponCode = String(code).trim().toUpperCase();

    // --------------------------------------------------------------
    // Check coupon exists
    // --------------------------------------------------------------

    const [existing] = await db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM coupons
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!existing.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------------------
    // Check duplicate code
    // --------------------------------------------------------------

    const [duplicate] = await db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM coupons
      WHERE code = ?
      AND id != ?
      LIMIT 1
      `,
      [couponCode, id]
    );

    if (duplicate.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------------------
    // Update Coupon
    // --------------------------------------------------------------

    const [result] = await db.query<ResultSetHeader>(
      `
      UPDATE coupons
      SET
        code = ?,
        discount_percentage = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        couponCode,
        discountPercentage,
        status || "ACTIVE",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon was not updated.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully.",
    });
  } catch (error) {
    console.error("Update coupon error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update coupon.",
      },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------
// Delete Coupon
// ------------------------------------------------------------------

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);

    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon ID is required.",
        },
        { status: 400 }
      );
    }

    const [result] = await db.query<ResultSetHeader>(
      `
      DELETE FROM coupons
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete coupon.",
      },
      { status: 500 }
    );
  }
}