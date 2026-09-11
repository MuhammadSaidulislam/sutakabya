import { NextRequest, NextResponse } from "next/server";
import  db  from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface RouteContext {
  params: Promise<{
    customerId: string;
  }>;
}



// GET: Get coupons assigned to customer
export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { customerId } = await params;
    const customerIdNumber = Number(customerId);

    if (
      !Number.isInteger(customerIdNumber) ||
      customerIdNumber <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      SELECT 
        c.id,
        c.code,
        c.discount_percentage,
        c.used,
        c.status,
        c.created_at,
        c.updated_at
      FROM coupon_customers cc
      INNER JOIN coupons c
        ON c.id = cc.coupon_id
      WHERE cc.customer_id = $1
      ORDER BY cc.created_at DESC
      `,
      [customerIdNumber]
    );

    const rows = result.rows;

    return NextResponse.json({
      success: true,
      coupons: rows,
      coupon_ids: rows.map((coupon) =>
        Number(coupon.id)
      ),
    });
  } catch (error) {
    console.error(
      "GET customer coupons error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch customer coupons",
      },
      { status: 500 }
    );
  }
}

// POST: Assign coupon to customer
export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { customerId } = await params;
    const customerIdNumber = Number(customerId);

    if (
      !Number.isInteger(customerIdNumber) ||
      customerIdNumber <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const couponId = Number(body.coupon_id);

    if (
      !Number.isInteger(couponId) ||
      couponId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid coupon ID" },
        { status: 400 }
      );
    }

    // Check customer exists
    const customerResult =
      await db.query(
        `
        SELECT id
        FROM customers
        WHERE id = $1
        LIMIT 1
        `,
        [customerIdNumber]
      );

    const customerRows =
      customerResult.rows;

    if (customerRows.length === 0) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // Check coupon exists
    const couponResult =
      await db.query(
        `
        SELECT id
        FROM coupons
        WHERE id = $1
        LIMIT 1
        `,
        [couponId]
      );

    const couponRows =
      couponResult.rows;

    if (couponRows.length === 0) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if already assigned
    const existingResult =
      await db.query(
        `
        SELECT id
        FROM coupon_customers
        WHERE coupon_id = $1
          AND customer_id = $2
        LIMIT 1
        `,
        [
          couponId,
          customerIdNumber,
        ]
      );

    const existingRows =
      existingResult.rows;

    if (existingRows.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Coupon already assigned to this customer",
        },
        { status: 200 }
      );
    }

    // Assign coupon
    await db.query(
      `
      INSERT INTO coupon_customers (
        coupon_id,
        customer_id
      )
      VALUES ($1, $2)
      `,
      [
        couponId,
        customerIdNumber,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Coupon assigned successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST customer coupon error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to assign coupon",
      },
      { status: 500 }
    );
  }
}

 // DELETE: Remove coupon from customer
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { customerId } = await params;
    const customerIdNumber = Number(customerId);

    if (
      !Number.isInteger(customerIdNumber) ||
      customerIdNumber <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const couponId = Number(body.coupon_id);

    if (
      !Number.isInteger(couponId) ||
      couponId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid coupon ID" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      DELETE FROM coupon_customers
      WHERE coupon_id = $1
        AND customer_id = $2
      `,
      [
        couponId,
        customerIdNumber,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon is not assigned to this customer",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon removed successfully",
    });
  } catch (error) {
    console.error(
      "DELETE customer coupon error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to remove coupon",
      },
      { status: 500 }
    );
  }
}