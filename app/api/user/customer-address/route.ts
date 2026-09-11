import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import  db  from "@/lib/db";

interface JwtPayload {
  id: number;
}

interface CustomerAddress {
  id: number;
  customer_id: number;
  label: string | null;
  name: string;
  phone: string | null;
  address: string;
  division: string | null;
  district: string;
  upazila: string | null;
  zip: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CreatedAddress {
  id: number;
}


export async function POST(req: NextRequest) {
  try {
    // ==============================
    // Get token
    // ==============================

    const token = req.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ==============================
    // Verify token
    // ==============================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const customerId = decoded.id;

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    // ==============================
    // Request body
    // ==============================

    const body = await req.json();

    const {
      label,
      name,
      phone,
      address,
      division,
      district,
      upazila,
      zip,
      is_default = false,
    } = body;

    // ==============================
    // Validation
    // ==============================

    if (!name || !address || !district) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, address and district are required",
        },
        { status: 400 }
      );
    }

    // ==============================
    // Check customer's addresses
    // ==============================

    const existingResult = await db.query<{ id: number }>(
      `
        SELECT id
        FROM customer_addresses
        WHERE customer_id = $1
        LIMIT 1
      `,
      [customerId]
    );

    const existingAddresses = existingResult.rows;

    // First address automatically becomes default
    const isFirstAddress = existingAddresses.length === 0;
    const makeDefault = isFirstAddress || Boolean(is_default);

    // ==============================
    // If default, remove old default
    // ==============================

    if (makeDefault) {
      await db.query(
        `
          UPDATE customer_addresses
          SET is_default = false
          WHERE customer_id = $1
        `,
        [customerId]
      );
    }

    // ==============================
    // Insert address
    // ==============================

    const result = await db.query<CreatedAddress>(
      `
        INSERT INTO customer_addresses
        (
          customer_id,
          label,
          name,
          address,
          phone,
          division,
          district,
          upazila,
          zip,
          is_default
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
      [
        customerId,
        label ?? null,
        name,
        address,
        phone ?? null,
        division ?? null,
        district,
        upazila ?? null,
        zip || null,
        makeDefault,
      ]
    );

    const addressId = result.rows[0].id;

    // ==============================
    // Response
    // ==============================

    return NextResponse.json(
      {
        success: true,
        message: "Address added successfully",
        data: {
          id: addressId,
          customer_id: customerId,
          label,
          name,
          address,
          phone,
          upazila,
          division,
          district,
          zip: zip || null,
          is_default: makeDefault,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add address error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add address",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // ==============================
    // Get token
    // ==============================

    const token = req.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ==============================
    // Verify token
    // ==============================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const customerId = decoded.id;

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    // ==============================
    // Get customer addresses
    // ==============================

    const result = await db.query<CustomerAddress>(
      `
        SELECT
          id,
          customer_id,
          label,
          name,
          phone,
          address,
          division,
          district,
          upazila,
          zip,
          is_default,
          created_at,
          updated_at
        FROM customer_addresses
        WHERE customer_id = $1
        ORDER BY is_default DESC, created_at DESC
      `,
      [customerId]
    );

    const addresses = result.rows;

    // ==============================
    // Response
    // ==============================

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Get address error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch addresses",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
    try {
        // ==============================
        // Get token
        // ==============================

        const token = req.cookies.get("user_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        // ==============================
        // Verify token
        // ==============================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        const customerId = decoded.id;

        if (!customerId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid token",
                },
                { status: 401 }
            );
        }

        // ==============================
        // Request body
        // ==============================

        const body = await req.json();

        const {
            id,
            label,
            name,
            phone,
            address,
            division,
            district,
            upazila,
            zip,
            is_default = false,
        } = body;

        // ==============================
        // Validation
        // ==============================

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Address ID is required",
                },
                { status: 400 }
            );
        }

        if (
            !name ||
            !phone ||
            !address ||
            !division ||
            !district ||
            !upazila
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Name, phone, address, division, district and upazila are required",
                },
                { status: 400 }
            );
        }

        // ==============================
        // Check address belongs to customer
        // ==============================

        const existingResult = await db.query<{ id: number }>(
            `
            SELECT id
            FROM customer_addresses
            WHERE id = $1
              AND customer_id = $2
            LIMIT 1
            `,
            [id, customerId]
        );

        const existing = existingResult.rows;

        if (existing.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Address not found",
                },
                { status: 404 }
            );
        }

        // ==============================
        // If default address
        // Remove default from other addresses
        // ==============================

        if (is_default) {
            await db.query(
                `
                UPDATE customer_addresses
                SET is_default = false
                WHERE customer_id = $1
                  AND id != $2
                `,
                [customerId, id]
            );
        }

        // ==============================
        // Update address
        // ==============================

        await db.query(
            `
            UPDATE customer_addresses
            SET
                label = $1,
                name = $2,
                phone = $3,
                address = $4,
                division = $5,
                district = $6,
                upazila = $7,
                zip = $8,
                is_default = $9
            WHERE id = $10
              AND customer_id = $11
            `,
            [
                label ?? null,
                name,
                phone,
                address,
                division,
                district,
                upazila,
                zip || null,
                Boolean(is_default),
                id,
                customerId,
            ]
        );

        // ==============================
        // Get updated address
        // ==============================

        const updatedResult = await db.query<CustomerAddress>(
            `
            SELECT
                id,
                customer_id,
                label,
                name,
                phone,
                address,
                division,
                district,
                upazila,
                zip,
                is_default,
                created_at,
                updated_at
            FROM customer_addresses
            WHERE id = $1
              AND customer_id = $2
            LIMIT 1
            `,
            [id, customerId]
        );

        const updated = updatedResult.rows;

        return NextResponse.json({
            success: true,
            message: "Address updated successfully",
            data: updated[0],
        });
    } catch (error) {
        console.error("Update address error:", error);

        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update address",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // ==============================
        // Get token
        // ==============================

        const token = req.cookies.get("user_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        // ==============================
        // Verify token
        // ==============================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        const customerId = decoded.id;

        if (!customerId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid token",
                },
                { status: 401 }
            );
        }

        // ==============================
        // Request body
        // ==============================

        const body = await req.json();

        const { id } = body;

        // ==============================
        // Validation
        // ==============================

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Address ID is required",
                },
                { status: 400 }
            );
        }

        // ==============================
        // Find address
        // ==============================

        const addressResult = await db.query<{
            id: number;
            is_default: boolean;
        }>(
            `
            SELECT id, is_default
            FROM customer_addresses
            WHERE id = $1
              AND customer_id = $2
            LIMIT 1
            `,
            [id, customerId]
        );

        const addresses = addressResult.rows;

        if (addresses.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Address not found",
                },
                { status: 404 }
            );
        }

        const address = addresses[0];

        // ==============================
        // Prevent deleting default address
        // ==============================

        if (address.is_default) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You cannot delete the default address. Please set another address as default first.",
                },
                { status: 400 }
            );
        }

        // ==============================
        // Delete address
        // ==============================

        await db.query(
            `
            DELETE FROM customer_addresses
            WHERE id = $1
              AND customer_id = $2
            `,
            [id, customerId]
        );

        // ==============================
        // Response
        // ==============================

        return NextResponse.json(
            {
                success: true,
                message: "Address deleted successfully",
                data: {
                    id,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete address error:", error);

        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete address",
            },
            { status: 500 }
        );
    }
}