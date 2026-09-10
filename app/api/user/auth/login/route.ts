import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  password: string | null;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
}

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();

    // =====================================================
    // 1. Login is required
    // =====================================================
    if (!login) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/phone is required.",
        },
        { status: 400 }
      );
    }

    const loginValue = String(login).trim();

    // =====================================================
    // 2. Find customer by email OR phone
    // =====================================================
    const [rows] = await db.query<User[]>(
      `
        SELECT
          id,
          name,
          email,
          phone,
          password,
          status
        FROM customers
        WHERE email = ? OR phone = ?
        LIMIT 1
      `,
      [loginValue, loginValue]
    );

    // =====================================================
    // 3. CUSTOMER DOES NOT EXIST
    // =====================================================
    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          customerNotFound: true,
          message: "Customer not found.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 4. CUSTOMER EXISTS
    // =====================================================
    const user = rows[0];

    // =====================================================
    // 5. Check account status
    // =====================================================
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is not active.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 6. Customer exists but has NO password
    // =====================================================
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          passwordRequired: true,
          message: "Please set your password.",
          userId: user.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        },
        { status: 200 }
      );
    }

    // =====================================================
    // 7. Customer has password → password is required
    // =====================================================
    if (!password) {
      return NextResponse.json(
        {
          success: false,
          passwordRequired: true,
          message: "Password is required.",
          userId: user.id,
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 8. Verify password
    // =====================================================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          password: false,
          message: "Wrong password.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 9. Create JWT
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
    // 10. Successful login
    // =====================================================
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      passwordRequired: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Customer login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 }
    );
  }
}