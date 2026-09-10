import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

interface JwtPayload {
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

        const [existingAddresses] = await db.query<RowDataPacket[]>(
            `
        SELECT id
        FROM customer_addresses
        WHERE customer_id = ?
        LIMIT 1
      `,
            [customerId]
        );

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
          SET is_default = 0
          WHERE customer_id = ?
        `,
                [customerId]
            );
        }

        // ==============================
        // Insert address
        // ==============================

        const [result] = await db.query<ResultSetHeader>(
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                customerId,
                label,
                name,
                address,
                phone,
                division,
                district,
                upazila,
                zip || null,
                makeDefault ? 1 : 0,
            ]
        );

        // ==============================
        // Response
        // ==============================

        return NextResponse.json(
            {
                success: true,
                message: "Address added successfully",
                data: {
                    id: result.insertId,
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

        const [addresses] = await db.query<RowDataPacket[]>(
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
            WHERE customer_id = ?
            ORDER BY is_default DESC, created_at DESC
            `,
            [customerId]
        );

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

        const [existing] = await db.query<RowDataPacket[]>(
            `
            SELECT id
            FROM customer_addresses
            WHERE id = ?
            AND customer_id = ?
            LIMIT 1
            `,
            [id, customerId]
        );

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
                SET is_default = 0
                WHERE customer_id = ?
                AND id != ?
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
                label = ?,
                name = ?,
                phone = ?,
                address = ?,
                division = ?,
                district = ?,
                upazila = ?,
                zip = ?,
                is_default = ?
            WHERE id = ?
            AND customer_id = ?
            `,
            [
                label,
                name,
                phone,
                address,
                division,
                district,
                upazila,
                zip || null,
                is_default ? 1 : 0,
                id,
                customerId,
            ]
        );

        // ==============================
        // Get updated address
        // ==============================

        const [updated] = await db.query<RowDataPacket[]>(
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
            WHERE id = ?
            AND customer_id = ?
            LIMIT 1
            `,
            [id, customerId]
        );

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

        const [addresses] = await db.query<RowDataPacket[]>(
            `
            SELECT id, is_default
            FROM customer_addresses
            WHERE id = ?
            AND customer_id = ?
            LIMIT 1
            `,
            [id, customerId]
        );

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

        if (Number(address.is_default) === 1) {
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
            WHERE id = ?
            AND customer_id = ?
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