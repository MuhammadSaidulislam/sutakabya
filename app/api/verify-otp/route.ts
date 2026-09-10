import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const OTP_SECRET = process.env.OTP_SIGNING_SECRET!;

export async function POST(req: Request) {
  try {
    const { otp, token } = await req.json();

    // =====================================================
    // 1. Validate input
    // =====================================================

    if (!otp || !token) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing OTP or token.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. Split token
    // =====================================================

    const [payloadB64, signature] = token.split(".");

    if (!payloadB64 || !signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 3. Verify HMAC signature
    // =====================================================

    const expectedSignature = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(payloadB64)
      .digest("hex");

    const sigValid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

    if (!sigValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or tampered token.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 4. Decode payload
    // =====================================================

    let payload: {
      userId: number | null;
      phone: string | null;
      email: string | null;
      otpHash: string;
      expiresAt: number;
      purpose: string;
    };

    try {
      payload = JSON.parse(
        Buffer.from(payloadB64, "base64url").toString()
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token payload.",
        },
        { status: 400 }
      );
    }

    const {
      userId,
      phone,
      email,
      otpHash,
      expiresAt,
      purpose,
    } = payload;

    // =====================================================
    // 5. Check expiration
    // =====================================================

    if (!expiresAt || Date.now() > expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 6. Validate OTP format
    // =====================================================

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 7. Hash submitted OTP
    // =====================================================

    const submittedHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // =====================================================
    // 8. Compare hashes
    // =====================================================

    const otpValid =
      submittedHash.length === otpHash.length &&
      crypto.timingSafeEqual(
        Buffer.from(submittedHash),
        Buffer.from(otpHash)
      );

    if (!otpValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect OTP.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 9. OTP successfully verified
    // =====================================================

    // Registration
    if (purpose === "registration") {
      const verifiedToken = crypto
        .createHmac("sha256", OTP_SECRET)
        .update(
          `${phone ?? email}:verified:${Date.now()}`
        )
        .digest("hex");

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully.",
        verifiedToken,
        resetToken: null,
      });
    }

    // =====================================================
    // 10. Password reset
    // =====================================================

    if (purpose === "password_reset") {
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid password reset session.",
          },
          { status: 400 }
        );
      }

      const resetToken = jwt.sign(
        {
          id: userId,
          purpose: "password_reset",
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "10m",
        }
      );

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully.",
        resetToken,
      });
    }

    // =====================================================
    // 11. Unknown purpose
    // =====================================================

    return NextResponse.json(
      {
        success: false,
        message: "Invalid OTP purpose.",
      },
      { status: 400 }
    );

  } catch (error) {
    console.error("Verify OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Verification failed.",
      },
      { status: 500 }
    );
  }
}