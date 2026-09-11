import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { createToken } from "@/lib/auth";

interface Admin {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const result = await db.query<Admin>(
      `
      SELECT
        id,
        name,
        email,
        password,
        role,
        status
      FROM admins
      WHERE email = $1
        AND status = 'ACTIVE'
      LIMIT 1
      `,
      [email]
    );

   

    const rows = result.rows;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const admin = rows[0];
 
    const matched = await bcrypt.compare(
      password,
      admin.password
    );

    if (!matched) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Admin Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}