import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

interface CategoryRow extends RowDataPacket {
  id: number;
}
interface Category extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
}
interface SubCategoryRow extends RowDataPacket {
  id: number;
  category_id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: Date;
  updated_at: Date;
}
export interface SubCategoryInput {
  id?: number;
  name: string;
}

// create category
export async function POST(req: NextRequest) {
  const connection = await db.getConnection();

  try {
    await requireAdmin();

    const body = await req.json();

    const {  name,  description, subCategories = []} = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Check duplicate category
    const [exists] = await connection.execute<CategoryRow[]>(
      "SELECT id FROM categories WHERE name = ? LIMIT 1",
      [name]
    );

    if (exists.length > 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Category already exists.",
        },
        { status: 409 }
      );
    }

    // Insert category
    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO categories
      (
        name,
        description,
        created_at,
        updated_at
      )
      VALUES (?, ?, NOW(), NOW())
      `,
      [
        name,
        description || null,
      ]
    );

    const categoryId = result.insertId;

    // Insert sub categories
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      const values = subCategories
        .filter((item) => item.name?.trim())
        .map((item) => [
          categoryId,
          item.name.trim(),
          "ACTIVE",
        ]);

      if (values.length > 0) {
        await connection.query(
          `
          INSERT INTO sub_categories
          (
            category_id,
            name,
            status,
            created_at,
            updated_at
          )
          VALUES ?
          `,
          [
            values.map((v) => [
              v[0],
              v[1],
              v[2],
              new Date(),
              new Date(),
            ]),
          ]
        );
      }
    }

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        id: categoryId,
      },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// categories list


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const search = searchParams.get("search")?.trim() || "";

    const offset = (page - 1) * limit;

    const whereClause = search ? "WHERE name LIKE ?" : "";
    const whereParams = search ? [`%${search}%`] : [];

    // Run Count and Categories queries concurrently

    const [countPromise, categoriesPromise] = await Promise.all([
      db.query<CategoryRow[]>(
        `SELECT COUNT(*) AS total FROM categories ${whereClause}`,
        whereParams
      ),
      db.query<Category[]>(
        `SELECT * FROM categories ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...whereParams, limit, offset]
      ),
    ]);

    const countResult = countPromise[0];
    const categories = categoriesPromise[0];
    const total = countResult[0]?.total || 0;

  
    if (categories.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
      });
    }

    // Fetch Subcategories for returned category IDs
    const categoryIds = categories.map((item) => item.id);
    const placeholders = categoryIds.map(() => "?").join(",");

    const [subCategories] = await db.query<SubCategoryRow[]>(
      `SELECT id, category_id, name, slug, status, created_at, updated_at
       FROM sub_categories
       WHERE category_id IN (${placeholders})
       ORDER BY id ASC`,
      categoryIds
    );

    // Group Subcategories
    const subCategoryMap = new Map<number, SubCategoryRow[]>();
    for (const sub of subCategories) {
      if (!sub.category_id) continue;
      if (!subCategoryMap.has(sub.category_id)) {
        subCategoryMap.set(sub.category_id, []);
      }
      subCategoryMap.get(sub.category_id)!.push(sub);
    }

    const data = categories.map((category) => ({
      ...category,
      subCategories: subCategoryMap.get(category.id) || [],
    }));


    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Update category
export async function PUT(req: NextRequest) {
  const connection = await db.getConnection();

  try {
    await requireAdmin();

    const {
      id,
      name,
      description,
      subCategories = [],
    }: {
      id: number;
      name: string;
      description?: string;
      subCategories: SubCategoryInput[];
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    if (!name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Check category
    const [rows] = await connection.execute<CategoryRow[]>(
      `
      SELECT id
      FROM categories
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const category = rows[0];

    // Duplicate name
    const [exists] = await connection.execute<CategoryRow[]>(
      `
      SELECT id
      FROM categories
      WHERE name = ?
      AND id <> ?
      LIMIT 1
      `,
      [name.trim(), id]
    );

    if (exists.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Category already exists.",
        },
        { status: 409 }
      );
    }


    // Update category
    await connection.execute<ResultSetHeader>(
      `
      UPDATE categories
      SET
        name = ?,
        description = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        name.trim(),
        description || null,
        id,
      ]
    );

    // =====================================
    // Existing sub categories
    // =====================================

    const [existingSubs] = await connection.execute<SubCategoryRow[]>(
      `
      SELECT *
      FROM sub_categories
      WHERE category_id = ?
      `,
      [id]
    );

    const existingMap = new Map<number, SubCategoryRow>();

    existingSubs.forEach((item) => {
      existingMap.set(item.id, item);
    });

    const requestIds = new Set<number>();

    // =====================================
    // Update / Insert
    // =====================================

    for (const item of subCategories) {
      const subName = item.name.trim();

      if (!subName) continue;

      if (item.id) {
        requestIds.add(item.id);

        await connection.execute<ResultSetHeader>(
          `
          UPDATE sub_categories
          SET
            name = ?,
            updated_at = NOW()
          WHERE id = ?
          AND category_id = ?
          `,
          [
            subName,
            item.id,
            id,
          ]
        );
      } else {
        await connection.execute<ResultSetHeader>(
          `
          INSERT INTO sub_categories
          (
            category_id,
            name,
            status,
            created_at,
            updated_at
          )
          VALUES
          (
            ?,
            ?,
            'ACTIVE',
            NOW(),
            NOW()
          )
          `,
          [
            id,
            subName,
          ]
        );
      }
    }

    // =====================================
    // Delete removed
    // =====================================

    for (const existing of existingSubs) {
      if (!requestIds.has(existing.id)) {
        await connection.execute<ResultSetHeader>(
          `
          DELETE
          FROM sub_categories
          WHERE id = ?
          `,
          [existing.id]
        );
      }
    }

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Delete category
export async function DELETE(req: NextRequest) {
  const connection = await db.getConnection();

  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Check category exists
    const [rows] = await connection.execute<CategoryRow[]>(
      `
      SELECT id
      FROM categories
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const category = rows[0];

    // Check if any product uses this category
    const [products] = await connection.execute<RowDataPacket[]>(
      `
      SELECT id
      FROM products
      WHERE category_id = ?
      LIMIT 1
      `,
      [id]
    );

    if (products.length > 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This category cannot be deleted because it is assigned to one or more products.",
        },
        { status: 409 }
      );
    }

    // Delete subcategories first
    await connection.execute<ResultSetHeader>(
      `
      DELETE FROM sub_categories
      WHERE category_id = ?
      `,
      [id]
    );

    // Delete category
    await connection.execute<ResultSetHeader>(
      `
      DELETE FROM categories
      WHERE id = ?
      `,
      [id]
    );

    await connection.commit();


    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();


    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}