import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

interface ResetTokenPayload {
  id: number;
  purpose: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      phone,
      password,
      resetToken,
    }: {
      email?: string | null;
      phone?: string | null;
      password?: string;
      resetToken?: string;
    } = body;

    // =====================================================
    // 1. Validate input
    // =====================================================

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "New password is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or mobile number is required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. Verify reset token
    // =====================================================

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password reset session is missing. Please verify the OTP again.",
        },
        { status: 401 }
      );
    }

    let decoded: ResetTokenPayload;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET!
      ) as ResetTokenPayload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your password reset session has expired. Please request a new OTP.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 3. Make sure token is specifically for password reset
    // =====================================================

    if (decoded.purpose !== "password_reset") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password reset session.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 4. Find customer
    // =====================================================

    const [users] = await db.query<RowDataPacket[]>(
      `
      SELECT id, name, email, phone
      FROM customers
      WHERE id = ?
      LIMIT 1
      `,
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found.",
        },
        { status: 404 }
      );
    }

    const user = users[0];

    // =====================================================
    // 5. Optional: make sure email/phone matches token user
    // =====================================================

    if (
      email &&
      user.email &&
      email.toLowerCase() !== user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password reset request.",
        },
        { status: 403 }
      );
    }

    if (phone && user.phone && phone !== user.phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password reset request.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 6. Hash new password
    // =====================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =====================================================
    // 7. Update password
    // =====================================================

    await db.query(
      `
      UPDATE customers
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, user.id]
    );

    // =====================================================
    // 8. Create normal login JWT
    // =====================================================

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // =====================================================
    // 9. Create response
    // =====================================================

    const response = NextResponse.json({
      success: true,
      message:
        "Password updated successfully. You are now logged in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    // =====================================================
    // 10. Automatically login user
    // =====================================================

    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}