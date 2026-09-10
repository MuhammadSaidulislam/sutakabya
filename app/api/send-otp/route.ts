import { NextResponse } from "next/server";
import crypto from "crypto";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

const OTP_SECRET = process.env.OTP_SIGNING_SECRET!;
const OTP_TTL_SECONDS = 60;

export async function POST(req: Request) {
  try {
    const {
      email,
      phone,
      purpose = "registration",
    } = await req.json();

    // =====================================================
    // 1. Validate email / phone
    // =====================================================

    if (!email && !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or mobile number is required.",
        },
        { status: 400 }
      );
    }

    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number.",
        },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email address.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. Find customer for password reset
    // =====================================================

    let userId: number | null = null;
    let userPhone: string | null = phone ?? null;
    let userEmail: string | null = email ?? null;

    if (purpose === "password_reset") {
      let users: RowDataPacket[];

      if (phone) {
        [users] = await db.query<RowDataPacket[]>(
          `
          SELECT id, name, email, phone
          FROM customers
          WHERE phone = ?
          LIMIT 1
          `,
          [phone]
        );
      } else {
        [users] = await db.query<RowDataPacket[]>(
          `
          SELECT id, name, email, phone
          FROM customers
          WHERE email = ?
          LIMIT 1
          `,
          [email]
        );
      }

      if (users.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No account found with this email or mobile number.",
          },
          { status: 404 }
        );
      }

      const user = users[0];

      userId = user.id;
      userPhone = user.phone;
      userEmail = user.email;
    }

    // =====================================================
    // 3. Generate OTP
    // =====================================================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt =
      Date.now() + OTP_TTL_SECONDS * 1000;

    // =====================================================
    // 4. Create signed OTP payload
    // =====================================================

    const payload = {
      userId,
      phone: userPhone,
      email: userEmail,
      otpHash,
      expiresAt,
      purpose,
    };

    const payloadB64 = Buffer
      .from(JSON.stringify(payload))
      .toString("base64url");

    const signature = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(payloadB64)
      .digest("hex");

    const token = `${payloadB64}.${signature}`;

    // =====================================================
    // 5. Send OTP
    // =====================================================

    // Your current SMS API requires a phone number.
    if (!userPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A mobile number is required to send the verification code.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.sms.net.bd/sendsms",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.SMS_BD_API_KEY,
          msg: `Your OTP code is: ${otp}`,
          to: userPhone,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send SMS.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 6. Success
    // =====================================================

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      token,
    });

  } catch (error) {
    console.error("Send OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP.",
      },
      { status: 500 }
    );
  }
}