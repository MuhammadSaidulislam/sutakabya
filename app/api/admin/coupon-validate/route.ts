import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "@/lib/db";

interface CouponRow extends RowDataPacket {
  id: number;
  code: string;
  discount_percentage: string | number;
  status: "ACTIVE" | "INACTIVE";
}

export async function POST(req: NextRequest) {
  try {
    // -----------------------------------------------
    // Get user token
    // -----------------------------------------------

    const token = req.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to use this coupon.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------------
    // Verify token
    // -----------------------------------------------

    let customerId: number;

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;

      if (!decoded.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid authentication token.",
          },
          { status: 401 }
        );
      }

      customerId = Number(decoded.id);

      if (!Number.isInteger(customerId) || customerId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid customer.",
          },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------------
    // Get coupon code
    // -----------------------------------------------

    const body = await req.json();

    const code = String(body.code || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // Check coupon for this customer
    // -----------------------------------------------

    const [rows] = await db.query<CouponRow[]>(
      `
      SELECT
        c.id,
        c.code,
        c.discount_percentage,
        c.status
      FROM coupons c
      INNER JOIN coupon_customers cc
        ON cc.coupon_id = c.id
      WHERE c.code = ?
        AND cc.customer_id = ?
        AND c.status = 'ACTIVE'
      LIMIT 1
      `,
      [code, customerId]
    );

    // -----------------------------------------------
    // Coupon not assigned / invalid
    // -----------------------------------------------

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This coupon is not available for your account.",
        },
        { status: 404 }
      );
    }

    const coupon = rows[0];

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully.",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_percentage: Number(
          coupon.discount_percentage
        ),
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to validate coupon.",
      },
      { status: 500 }
    );
  }
}