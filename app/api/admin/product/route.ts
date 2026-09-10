import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ProductImage } from "@/types/imageProps";
import { ProductProps, ProductSpecification, ProductTag, ProductVariant, Tag } from "@/types/product";
import { deleteImage } from "@/lib/delete-image";

interface ProductImageRow extends RowDataPacket {
  id: number;
}

interface ProductRow extends RowDataPacket {
  id: number;
}

interface CategoryRow extends RowDataPacket {
  id: number;
}

interface ProductTagRow extends RowDataPacket {
  id: number;
}

// Product create
export async function POST(req: NextRequest) {
  let connection;

  try {
    await requireAdmin();

    const body = await req.json();

    const {
      // Basic
      name,
      slug,
      sku,

      // Category
      category_id,
      sub_category_id,

      // Description
      description,
      short_description,

      // Pricing
      price,
      cost_price,
      offer_price,

      // Inventory
      stock,
      low_stock_threshold,

      // Status
      status,

      // Flags
      featured,
      best_seller,
      new_arrival,

      // SEO
      meta_title,
      meta_description,

      // Relations
      images = [],
      specifications = [],
      tags = [],
      variants = [],
    } = body;

    if (
      !category_id ||
      !sub_category_id ||
      !name ||
      price == null ||
      stock == null ||
      !status
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category, Sub Category, Name, Price, Stock and Status are required.",
        },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    // Category

    const [category] = await connection.execute<CategoryRow[]>(
      `SELECT id
       FROM categories
       WHERE id = ?
       LIMIT 1`,
      [category_id]
    );

    if (!category.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // Sub Category

    const [subCategory] = await connection.execute<CategoryRow[]>(
      `SELECT id
       FROM sub_categories
       WHERE id = ?
       AND category_id = ?
       LIMIT 1`,
      [sub_category_id, category_id]
    );

    if (!subCategory.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Sub category not found.",
        },
        { status: 404 }
      );
    }

    // Duplicate Name

    const [exists] = await connection.execute<ProductRow[]>(
      `SELECT id
       FROM products
       WHERE name = ?
       LIMIT 1`,
      [name]
    );

    if (exists.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Product already exists.",
        },
        { status: 409 }
      );
    }

    // Duplicate Slug

    if (slug) {
      const [slugExists] = await connection.execute<ProductRow[]>(
        `SELECT id
         FROM products
         WHERE slug = ?
         LIMIT 1`,
        [slug]
      );

      if (slugExists.length) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "Slug already exists.",
          },
          { status: 409 }
        );
      }
    }

    // Duplicate SKU

    if (sku) {
      const [skuExists] = await connection.execute<ProductRow[]>(
        `SELECT id
         FROM products
         WHERE sku = ?
         LIMIT 1`,
        [sku]
      );

      if (skuExists.length) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "SKU already exists.",
          },
          { status: 409 }
        );
      }
    }

    // Insert Product

    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO products
      (
        category_id,
        sub_category_id,
        name,
        slug,
        sku,
        description,
        short_description,
        price,
        cost_price,
        offer_price,
        stock,
        low_stock_threshold,
        status,
        featured,
        best_seller,
        new_arrival,
        meta_title,
        meta_description,
        view_count,
        created_at,
        updated_at
      )
      VALUES
      (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW()
      )
      `,
      [
        category_id,
        sub_category_id,
        name,
        slug || null,
        sku || null,
        description || null,
        short_description || null,
        price,
        cost_price || 0,
        offer_price || 0,
        stock,
        low_stock_threshold || 5,
        status,
        featured ? 1 : 0,
        best_seller ? 1 : 0,
        new_arrival ? 1 : 0,
        meta_title || null,
        meta_description || null,
      ]
    );

    const productId = result.insertId;

    // Product Images

    if (Array.isArray(images) && images.length > 0) {
      for (const image of images) {
        await connection.execute(
          `
          INSERT INTO product_images
          (
            product_id,
            image_url,
            is_thumbnail,
            created_at
          )
          VALUES (?, ?, ?, NOW())
          `,
          [
            productId,
            image.image_url,
            image.is_thumbnail ? 1 : 0,
          ]
        );
      }
    }

    // Specifications

    if (Array.isArray(specifications) && specifications.length) {
      for (let i = 0; i < specifications.length; i++) {
        const spec = specifications[i];

        await connection.execute(
          `
          INSERT INTO product_specifications
          (
            product_id,
            specification_name,
            specification_value,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, NOW(), NOW())
          `,
          [
            productId,
            spec.specification_name,
            spec.specification_value,
            i + 1,
          ]
        );
      }
    }

    // Tags

    if (Array.isArray(tags) && tags.length) {
      for (const tag of tags) {
        await connection.execute(
          `
          INSERT INTO product_tags
          (
            product_id,
            tag
          )
          VALUES (?, ?)
          `,
          [
            productId,
            typeof tag === "string" ? tag : tag.tag,
          ]
        );
      }
    }

    // Variants

    if (Array.isArray(variants) && variants.length) {
      for (const variant of variants) {
        await connection.execute(
          `
          INSERT INTO product_variants
          (
            product_id,
            sku,
            color,
            size,
            stock,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
          `,
          [
            productId,
            variant.sku || null,
            variant.color || null,
            variant.size || null,
            variant.stock || 0,
          ]
        );
      }
    }

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        id: productId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// All the product list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // =========================================================
    // Pagination
    // =========================================================
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 12, 1);
    const offset = (page - 1) * limit;

    // =========================================================
    // Filters
    // =========================================================
    const search = searchParams.get("search")?.trim() || "";

    const status = searchParams.get("status")?.trim() || "All";

    const sort = searchParams.get("sort")?.trim() || "newest";

    const color = searchParams.get("color")?.split(",").filter(Boolean) ?? [];

    const size = searchParams.get("size")?.split(",").filter(Boolean) ?? [];

    const categories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];

    const subCategories = searchParams.get("subCategory")?.split(",").filter(Boolean) ?? [];

    const maxPrice = Number(searchParams.get("maxPrice")) || 0;


    // =========================================================
    // Conditions & Parameters
    // =========================================================
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // =========================================================
    // Search
    // =========================================================
    if (search) {
      conditions.push("p.name LIKE ?");
      params.push(`%${search}%`);
    }

    // =========================================================
    // Category - using category slug
    // Example:
    // ?category=clothes,toys,moms-care,gears
    // =========================================================
    if (categories.length && !categories.includes("All")) {
      conditions.push(
        `c.slug IN (${categories.map(() => "?").join(",")})`
      );

      params.push(...categories);
    }

    // =========================================================
    // Sub Category - using subcategory slug
    // Example:
    // ?subCategory=baby-fashion,girls-fashion
    // =========================================================
    if (  subCategories.length &&  !subCategories.includes("All")) {
      conditions.push(
        `sc.slug IN (${subCategories.map(() => "?").join(",")})`
      );

      params.push(...subCategories);
    }

    // =========================================================
    // Status
    // =========================================================
    if (status !== "All") {
      conditions.push("p.status = ?");
      params.push(status);
    }

    // =========================================================
    // Color
    // =========================================================
    if (color.length > 0) {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.color IN (${color.map(() => "?").join(",")})
        )
      `);

      params.push(...color);
    }

    // =========================================================
    // Size
    // =========================================================
    if (size.length > 0) {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.size IN (${size.map(() => "?").join(",")})
        )
      `);

      params.push(...size);
    }

    // =========================================================
    // Max Price
    // =========================================================
    if (maxPrice > 0) {
      conditions.push("p.price <= ?");
      params.push(maxPrice);
    }

    // =========================================================
    // WHERE clause
    // =========================================================
    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // =========================================================
    // Sorting
    // =========================================================
    let orderBy = "ORDER BY p.created_at DESC";

    switch (sort) {
      case "price-asc":
        orderBy = "ORDER BY p.price ASC";
        break;

      case "price-desc":
        orderBy = "ORDER BY p.price DESC";
        break;

      case "top-viewed":
        orderBy = "ORDER BY p.view_count DESC";
        break;

      case "newest":
      default:
        orderBy = "ORDER BY p.created_at DESC";
        break;
    }

    // =========================================================
    // Count Products
    // =========================================================
    const [countResult] = await db.query<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total

        FROM products p

        INNER JOIN categories c
          ON c.id = p.category_id

        LEFT JOIN sub_categories sc
          ON sc.id = p.sub_category_id

        ${whereClause}
      `,
      params
    );

    const total = Number(countResult[0]?.total ?? 0);

    // =========================================================
    // Fetch Products
    // =========================================================
    const [products] = await db.query<
      (ProductProps & RowDataPacket)[]
    >(
      `
        SELECT
          p.id,

          p.category_id,
          c.name AS category_name,
          c.slug AS category_slug,

          p.sub_category_id,
          sc.name AS sub_category_name,
          sc.slug AS sub_category_slug,

          p.name,
          p.slug,
          p.sku,

          p.price,
          p.cost_price,
          p.offer_price,

          p.low_stock_threshold,
          p.stock,

          p.short_description,
          p.description,

          p.meta_title,
          p.meta_description,

          p.featured,
          p.best_seller,
          p.new_arrival,

          p.status,

          COALESCE(r.average_rating, 0) AS average_rating,
          COALESCE(r.rating_count, 0) AS rating_count,

          p.created_at,
          p.updated_at

        FROM products p

        INNER JOIN categories c
          ON c.id = p.category_id

        LEFT JOIN sub_categories sc
          ON sc.id = p.sub_category_id

        LEFT JOIN (
          SELECT
            product_id,
            ROUND(AVG(rating), 1) AS average_rating,
            COUNT(*) AS rating_count
          FROM product_reviews
          WHERE status = 'APPROVED'
          GROUP BY product_id
        ) r
          ON r.product_id = p.id

        ${whereClause}

        ${orderBy}

        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    // =========================================================
    // Related Data
    // =========================================================
    let images: (ProductImage & RowDataPacket)[] = [];

    let specifications: (
      ProductSpecification & RowDataPacket
    )[] = [];

    let tags: (ProductTag & RowDataPacket)[] = [];

    let variants: (ProductVariant & RowDataPacket)[] = [];

    // =========================================================
    // Fetch related product data
    // =========================================================
    if (products.length > 0) {
      const productIds = products.map((product) => product.id);

      const placeholders = productIds
        .map(() => "?")
        .join(",");

      // =======================================================
      // Images
      // =======================================================
      const [imageRows] = await db.query<
        (ProductImage & RowDataPacket)[]
      >(
        `
          SELECT
            id,
            product_id,
            image_url,
            is_thumbnail

          FROM product_images

          WHERE product_id IN (${placeholders})
        `,
        productIds
      );

      images = imageRows;

      // =======================================================
      // Specifications
      // =======================================================
      const [specificationRows] = await db.query<
        (ProductSpecification & RowDataPacket)[]
      >(
        `
          SELECT
            id,
            product_id,
            specification_name,
            specification_value

          FROM product_specifications

          WHERE product_id IN (${placeholders})

          ORDER BY created_at
        `,
        productIds
      );

      specifications = specificationRows;

      // =======================================================
      // Tags
      // =======================================================
      const [tagRows] = await db.query<
        (ProductTag & RowDataPacket)[]
      >(
        `
          SELECT
            id,
            product_id,
            tag

          FROM product_tags

          WHERE product_id IN (${placeholders})
        `,
        productIds
      );

      tags = tagRows;

      // =======================================================
      // Variants
      // =======================================================
      const [variantRows] = await db.query<
        (ProductVariant & RowDataPacket)[]
      >(
        `
          SELECT
            id,
            product_id,
            sku,
            color,
            size,
            stock,
            created_at,
            updated_at

          FROM product_variants

          WHERE product_id IN (${placeholders})
        `,
        productIds
      );

      variants = variantRows;
    }

    // =========================================================
    // Combine Related Data With Products
    // =========================================================
    const data = products.map((product) => ({
      ...product,

      images: images.filter(
        (image) => image.product_id === product.id
      ),

      specifications: specifications.filter(
        (specification) =>
          specification.product_id === product.id
      ),

      tags: tags.filter(
        (tag) => tag.product_id === product.id
      ),

      variants: variants.filter(
        (variant) => variant.product_id === product.id
      ),
    }));

    // =========================================================
    // Fetch Filter Data In Parallel
    // =========================================================
    const [
      [categoryRows],
      [subCategoryRows],
      [sizeRows],
      [colorRows],
      [tagRows],
      [priceRows],
    ] = await Promise.all([
      // =======================================================
      // Categories
      // =======================================================
      db.query<RowDataPacket[]>(`
        SELECT
          id,
          name,
          slug

        FROM categories

        ORDER BY name
      `),

      // =======================================================
      // Sub Categories
      // =======================================================
      db.query<RowDataPacket[]>(`
        SELECT
          id,
          category_id,
          name,
          slug

        FROM sub_categories

        ORDER BY name
      `),

      // =======================================================
      // Sizes
      // =======================================================
      db.query<RowDataPacket[]>(`
        SELECT DISTINCT
          size

        FROM product_variants

        WHERE size IS NOT NULL
          AND size <> ''

        ORDER BY size
      `),

      // =======================================================
      // Colors
      // =======================================================
      db.query<RowDataPacket[]>(`
        SELECT DISTINCT
          color

        FROM product_variants

        WHERE color IS NOT NULL
          AND color <> ''

        ORDER BY color
      `),

      // =======================================================
      // Tags
      // =======================================================
      db.query<RowDataPacket[]>(`
        SELECT DISTINCT
          tag

        FROM product_tags

        WHERE tag IS NOT NULL
          AND tag <> ''

        ORDER BY tag
      `),

      // =======================================================
      // Price Range
      // =======================================================
      db.query<RowDataPacket[]>(`
        SELECT
          MIN(price) AS minPrice,
          MAX(price) AS maxPrice

        FROM products
      `),
    ]);

    // =========================================================
    // Build Category Options
    // =========================================================
    const categoryOptions = categoryRows.map((category) => ({
      ...category,

      sub_categories: subCategoryRows.filter(
        (subCategory) =>
          subCategory.category_id === category.id
      ),
    }));

    // =========================================================
    // Response
    // =========================================================
    return NextResponse.json({
      success: true,

      data,

      filters: {
        categories: categoryOptions,

        sizes: sizeRows,

        colors: colorRows,

        tags: tagRows,

        priceRange: {
          min: Number(priceRows[0]?.minPrice ?? 0),
          max: Number(priceRows[0]?.maxPrice ?? 0),
        },
      },

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

// Delete product

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    // Check product exists
    const [product] = await db.execute<ProductRow[]>(
      "SELECT id FROM products WHERE id = ? LIMIT 1",
      [id]
    );

    if (product.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    // Get all images
    const [images] = await db.execute<(ProductImage & RowDataPacket)[]>(
      `
      SELECT id, image_url
      FROM product_images
      WHERE product_id = ?
      `,
      [id]
    );

    // Delete image files
    for (const image of images) {
      if (image.image_url) {
        try {
          await deleteImage(image.image_url);
        } catch (error) {
          console.error("Failed to delete image:", image.image_url, error);
        }
      }
    }

    // Delete image records
    await db.execute<ResultSetHeader>(
      "DELETE FROM product_images WHERE product_id = ?",
      [id]
    );

    // Delete product
    await db.execute<ResultSetHeader>(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// Update product
export async function PUT(req: NextRequest) {
  let connection;

  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const productId = Number(searchParams.get("id"));

    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product id.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      category_id,
      sub_category_id,
      name,
      slug,
      sku,
      short_description,
      description,
      cost_price,
      offer_price,
      price,
      stock,
      low_stock_threshold,
      meta_title,
      meta_description,
      featured,
      best_seller,
      new_arrival,
      status,
      images = [],
      specifications = [],
      tags = [],
      variants = []
    } = body;

    if (
      !category_id ||
      !sub_category_id ||
      !name ||
      !slug ||
      !sku ||
      cost_price == null ||
      price == null ||
      stock == null ||
      !status
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category, sub_category_id, name, slug, sku, short_description, cost_price, price, stock and status are required.",
        },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Product exists
    const [product] = await connection.execute<ProductRow[]>(
      "SELECT id FROM products WHERE id = ? LIMIT 1",
      [productId]
    );

    if (!product.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    // Category exists
    const [category] = await connection.execute<CategoryRow[]>(
      "SELECT id FROM categories WHERE id = ? LIMIT 1",
      [category_id]
    );

    if (!category.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // Duplicate product name (except current product)
    const [exists] = await connection.execute<ProductRow[]>(
      `
      SELECT id
      FROM products
      WHERE name = ?
      AND id != ?
      LIMIT 1
      `,
      [name, productId]
    );

    if (exists.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Product already exists.",
        },
        { status: 409 }
      );
    }

    // Update product
    await connection.execute<ResultSetHeader>(
      `
      UPDATE products
      SET
        category_id=?,
        name=?,
        slug=?,
        sku=?,
        short_description=?,
        description=?,
        cost_price=?,
        offer_price=?,
        price=?,
        stock=?,
        low_stock_threshold=?,
        meta_title=?,
        meta_description=?,
        featured=?,
        best_seller=?,
        new_arrival=?,
        status=?,
        updated_at=NOW()
      WHERE id=?
      `,
      [
        category_id,
        name,
        slug,
        sku,
        short_description,
        description || null,
        cost_price,
        offer_price,
        price,
        stock,
        low_stock_threshold,
        meta_title,
        meta_description,
        featured,
        best_seller,
        new_arrival,
        status,
        productId,
      ]
    );

    // Existing DB images
    const [dbImages] = await connection.execute<ProductImageRow[]>(
      `
      SELECT id
      FROM product_images
      WHERE product_id=?
      `,
      [productId]
    );

    const dbIds = dbImages.map((img) => img.id);

    const requestIds = (images as ProductImage[])
      .map((img) => img.id)
      .filter((id): id is number => id !== undefined);

    // Delete removed images
    const deleteIds = dbIds.filter((id) => !requestIds.includes(id));

    if (deleteIds.length > 0) {
      await connection.execute(
        `
        DELETE FROM product_images
        WHERE id IN (${deleteIds.map(() => "?").join(",")})
        `,
        deleteIds
      );
    }

    // Update existing / Insert new
    for (const image of images as ProductImage[]) {
      if (image.id) {
        await connection.execute(
          `
          UPDATE product_images
          SET
            image_url=?,
            is_thumbnail=?
          WHERE id=?
          `,
          [
            image.image_url,
            image.is_thumbnail ? 1 : 0,
            image.id,
          ]
        );
      } else {
        await connection.execute(
          `
          INSERT INTO product_images
          (
            product_id,
            image_url,
            is_thumbnail,
            created_at
          )
          VALUES (?, ?, ?, NOW())
          `,
          [
            productId,
            image.image_url,
            image.is_thumbnail ? 1 : 0,
          ]
        );
      }
    }


    // Specifications 
    const [dbSpecifications] = await connection.execute<ProductImageRow[]>(
      `
  SELECT id
  FROM product_specifications
  WHERE product_id = ?
  `,
      [productId]
    );
    const dbSpecificationIds = dbSpecifications.map((s) => s.id);

    const requestSpecificationIds = specifications.map((s: ProductSpecification) => s.id)
      .filter((id: number | undefined): id is number => id !== undefined);

    const deleteSpecificationIds = dbSpecificationIds.filter(
      (id) => !requestSpecificationIds.includes(id)
    );
    if (deleteSpecificationIds.length > 0) {
      await connection.execute(
        `
    DELETE FROM product_specifications
    WHERE id IN (${deleteSpecificationIds.map(() => "?").join(",")})
    `,
        deleteSpecificationIds
      );
    }

    for (const specification of specifications) {
      if (specification.id) {
        // Update
        await connection.execute(
          `
      UPDATE product_specifications
      SET
        specification_name = ?,
        specification_value = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
          [
            specification.specification_name,
            specification.specification_value,
            specification.id,
          ]
        );
      } else {
        // Insert
        await connection.execute(
          `
      INSERT INTO product_specifications
      (
        product_id,
        specification_name,
        specification_value,
        created_at
      )
      VALUES (?, ?, ?, NOW())
      `,
          [
            productId,
            specification.specification_name,
            specification.specification_value,
          ]
        );
      }
    }

    // Tags
    const [dbTags] = await connection.execute<ProductTagRow[]>(
      `
  SELECT id
  FROM product_tags
  WHERE product_id = ?
  `,
      [productId]
    );

    const dbTagIds = dbTags.map((t) => t.id);

    const requestTagIds = tags.map((t: ProductTag) => t.id)
      .filter((id: number | undefined): id is number => id !== undefined);

    const deleteTagIds = dbTagIds.filter((id) => !requestTagIds.includes(id));

    if (deleteTagIds.length > 0) {
      await connection.execute(
        `
    DELETE FROM product_tags
    WHERE id IN (${deleteTagIds.map(() => "?").join(",")})
    `,
        deleteTagIds
      );
    }
    for (const tag of tags as ProductTag[]) {
      if (!tag.tag?.trim()) continue;

      if (tag.id) {
        // Update
        await connection.execute(
          `
      UPDATE product_tags
      SET tag = ?
      WHERE id = ?
      `,
          [
            tag.tag.trim(),
            tag.id,
          ]
        );
      } else {
        // Insert
        await connection.execute(
          `
      INSERT INTO product_tags
      (
        product_id,
        tag
      )
      VALUES (?, ?)
      `,
          [
            productId,
            tag.tag.trim(),
          ]
        );
      }
    }

    // Variants
    const [dbVariants] = await connection.execute<ProductImageRow[]>(
      `
  SELECT id
  FROM product_variants
  WHERE product_id = ?
  `,
      [productId]
    );

    const dbVariantIds = dbVariants.map((v) => v.id);

    const requestVariantIds = (variants as ProductVariant[])
      .map((v) => v.id)
      .filter((id): id is number => id !== undefined);

    const deleteVariantIds = dbVariantIds.filter(
      (id) => !requestVariantIds.includes(id)
    );

    if (deleteVariantIds.length > 0) {
      await connection.execute(
        `
    DELETE FROM product_variants
    WHERE id IN (${deleteVariantIds.map(() => "?").join(",")})
    `,
        deleteVariantIds
      );
    }
    for (const variant of variants as ProductVariant[]) {
      if (
        !variant.color &&
        !variant.size &&
        !variant.sku
      ) {
        continue;
      }

      if (variant.id) {
        // Update
        await connection.execute(
          `
      UPDATE product_variants
      SET
        sku = ?,
        color = ?,
        size = ?,
        stock = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
          [
            variant.sku || null,
            variant.color || null,
            variant.size || null,
            variant.stock || 0,
            variant.id,
          ]
        );
      } else {
        // Insert
        await connection.execute(
          `
      INSERT INTO product_variants
      (
        product_id,
        sku,
        color,
        size,
        stock,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, NOW())
      `,
          [
            productId,
            variant.sku || null,
            variant.color || null,
            variant.size || null,
            variant.stock || 0,
          ]
        );
      }
    }



    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}