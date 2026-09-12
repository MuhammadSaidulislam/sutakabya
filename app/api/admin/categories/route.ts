import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";

interface CategoryRow extends RowDataPacket {
  id: number;
}
interface ProductRow extends RowDataPacket {
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

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// create category

export async function POST(req: NextRequest) {
  const client = await db.connect(); try {
    await requireAdmin(); const body = await req.json();
    const { name, description, subCategories = [], } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ success: false, message: "Category name is required.", }, { status: 400 });
    }
    const categoryName = name.trim();
    const categorySlug = createSlug(categoryName);
    if (!categorySlug) {
      return NextResponse.json({ success: false, message: "Invalid category name.", }, { status: 400 });
    }
    await client.query("BEGIN"); // Check duplicate category by name or slug 
    const existsResult = await client.query<CategoryRow>(` SELECT id FROM categories WHERE name = $1 OR slug = $2 LIMIT 1 `, [categoryName, categorySlug]);
    if (existsResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: "Category already exists.", }, { status: 409 });
    } // Insert category 
    const result = await client.query<CategoryRow>(` INSERT INTO categories ( name, slug, description, created_at, updated_at ) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id `, [categoryName, categorySlug, description || null,]);
    const categoryId = result.rows[0].id; // Insert sub categories
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      const validSubCategories = subCategories.filter((item: { name?: string }) => typeof item.name === "string" && item.name.trim()).map((item: { name?: string }) => { const subCategoryName = item.name?.trim() ?? ""; return { name: subCategoryName, slug: createSlug(subCategoryName), }; }).filter((item) => item.slug); if (validSubCategories.length > 0) {
        const values: (number | string | Date)[] = [];
        const placeholders = validSubCategories.map((item, index) => {
          const base = index * 6; values.push(categoryId, item.name, item.slug, "ACTIVE", new Date(), new Date());
          return `( $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6} )`;
        });
        await client.query(` INSERT INTO sub_categories ( category_id, name, slug, status, created_at, updated_at ) VALUES ${placeholders.join(", ")} `, values);
      }
    } await client.query("COMMIT"); return NextResponse.json({ success: true, message: "Category created successfully.", id: categoryId, name: categoryName, slug: categorySlug, }, { status: 201 });
  } catch (error) { await client.query("ROLLBACK"); console.error(error); return NextResponse.json({ success: false, message: "Internal Server Error", }, { status: 500 }); }
  finally { client.release(); }
}

// categories list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.max(
      1,
      Number(searchParams.get("limit")) || 10
    );

    const search =
      searchParams.get("search")?.trim() || "";

    const offset = (page - 1) * limit;

    // =========================================================
    // Search condition
    // =========================================================
    const whereClause = search
      ? "WHERE name ILIKE $1"
      : "";

    const whereParams = search
      ? [`%${search}%`]
      : [];

    // =========================================================
    // Run Count and Categories queries concurrently
    // =========================================================
    const [countResult, categoriesResult] =
      await Promise.all([
        db.query<CategoryRow>(
          `
            SELECT COUNT(*) AS total
            FROM categories
            ${whereClause}
          `,
          whereParams
        ),

        db.query<Category>(
          `
            SELECT *
            FROM categories
            ${whereClause}
            ORDER BY id DESC
            LIMIT $${whereParams.length + 1}
            OFFSET $${whereParams.length + 2}
          `,
          [
            ...whereParams,
            limit,
            offset,
          ]
        ),
      ]);

    const total = Number(
      countResult.rows[0]?.total ?? 0
    );

    const categories = categoriesResult.rows;

    // =========================================================
    // No categories
    // =========================================================
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

    // =========================================================
    // Fetch Subcategories for returned category IDs
    // =========================================================
    const categoryIds = categories.map(
      (item) => item.id
    );

    const placeholders = categoryIds.map(
      (_, index) => `$${index + 1}`
    );

    const subCategoriesResult =
      await db.query<SubCategoryRow>(
        `
          SELECT
            id,
            category_id,
            name,
            slug,
            status,
            created_at,
            updated_at
          FROM sub_categories
          WHERE category_id IN (${placeholders.join(", ")})
          ORDER BY id ASC
        `,
        categoryIds
      );

    const subCategories =
      subCategoriesResult.rows;

    // =========================================================
    // Group Subcategories
    // =========================================================
    const subCategoryMap = new Map<
      number,
      SubCategoryRow[]
    >();

    for (const sub of subCategories) {
      if (!sub.category_id) continue;

      if (!subCategoryMap.has(sub.category_id)) {
        subCategoryMap.set(
          sub.category_id,
          []
        );
      }

      subCategoryMap
        .get(sub.category_id)!
        .push(sub);
    }

    // =========================================================
    // Combine categories + subcategories
    // =========================================================
    const data = categories.map((category) => ({
      ...category,

      subCategories:
        subCategoryMap.get(category.id) || [],
    }));

    // =========================================================
    // Response
    // =========================================================
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
    console.error(
      "Get Categories Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

// Update category
// Update category
export async function PUT(req: NextRequest) {
  const client = await db.connect();
  try {
    await requireAdmin();
    const { id, name, description, subCategories = [], }: { id: number; name: string; description?: string; subCategories: SubCategoryInput[]; } = await req.json(); if (!id) { return NextResponse.json({ success: false, message: "Category ID is required.", }, { status: 400 }); } if (!name || !name.trim()) { return NextResponse.json({ success: false, message: "Category name is required.", }, { status: 400 }); }
    const categoryName = name.trim();
    const categorySlug = createSlug(categoryName); if (!categorySlug) { return NextResponse.json({ success: false, message: "Invalid category name.", }, { status: 400 }); } await client.query("BEGIN");
    // ===================================== // Check category // ===================================== 
    const categoryResult = await client.query<CategoryRow>(` SELECT id FROM categories WHERE id = $1 LIMIT 1 `, [id]); if (categoryResult.rows.length === 0) { await client.query("ROLLBACK"); return NextResponse.json({ success: false, message: "Category not found.", }, { status: 404 }); }
    // ===================================== // Duplicate category // ===================================== 
    const existsResult = await client.query<CategoryRow>(` SELECT id FROM categories WHERE (name = $1 OR slug = $2) AND id <> $3 LIMIT 1 `, [categoryName, categorySlug, id,]); if (existsResult.rows.length > 0) { await client.query("ROLLBACK"); return NextResponse.json({ success: false, message: "Category already exists.", }, { status: 409 }); }
    // ===================================== // Update category // ===================================== 
    await client.query(` UPDATE categories SET name = $1, slug = $2, description = $3, updated_at = NOW() WHERE id = $4 `, [categoryName, categorySlug, description || null, id,]);
    // ===================================== // Existing sub categories // ===================================== 
    const existingSubsResult = await client.query<SubCategoryRow>(` SELECT * FROM sub_categories WHERE category_id = $1 `, [id]); const existingSubs = existingSubsResult.rows; const requestIds = new Set<number>();
    // ===================================== // Update / Insert sub categories // ===================================== 
    for (const item of subCategories) { if (!item.name || !item.name.trim()) { continue; } const subName = item.name.trim(); const subSlug = createSlug(subName); if (!subSlug) { continue; } if (item.id) { requestIds.add(item.id); await client.query(` UPDATE sub_categories SET name = $1, slug = $2, updated_at = NOW() WHERE id = $3 AND category_id = $4 `, [subName, subSlug, item.id, id,]); } else { await client.query(` INSERT INTO sub_categories ( category_id, name, slug, status, created_at, updated_at ) VALUES ( $1, $2, $3, 'ACTIVE', NOW(), NOW() ) `, [id, subName, subSlug,]); } }
    // ===================================== // Delete removed sub categories // ====================================
    for (const existing of existingSubs) { if (!requestIds.has(existing.id)) { await client.query(` DELETE FROM sub_categories WHERE id = $1 AND category_id = $2 `, [existing.id, id,]); } } await client.query("COMMIT"); return NextResponse.json({ success: true, message: "Category updated successfully.", id, name: categoryName, slug: categorySlug, }, { status: 200 });
  } catch (error) { await client.query("ROLLBACK"); console.error(error); return NextResponse.json({ success: false, message: "Internal Server Error", }, { status: 500 }); }
  finally { client.release(); }
}

// Delete category
export async function DELETE(req: NextRequest) {
  const client = await db.connect();

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

    await client.query("BEGIN");

    // =====================================
    // Check category exists
    // =====================================

    const categoryResult = await client.query<CategoryRow>(
      `
        SELECT id
        FROM categories
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    const rows = categoryResult.rows;

    if (rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const category = rows[0];

    // =====================================
    // Check if any product uses this category
    // =====================================

    const productsResult =
      await client.query<ProductRow>(
        `
          SELECT id
          FROM products
          WHERE category_id = $1
          LIMIT 1
        `,
        [id]
      );

    const products = productsResult.rows;

    if (products.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "This category cannot be deleted because it is assigned to one or more products.",
        },
        { status: 409 }
      );
    }

    // =====================================
    // Delete subcategories first
    // =====================================

    await client.query(
      `
        DELETE FROM sub_categories
        WHERE category_id = $1
      `,
      [id]
    );

    // =====================================
    // Delete category
    // =====================================

    await client.query(
      `
        DELETE FROM categories
        WHERE id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}