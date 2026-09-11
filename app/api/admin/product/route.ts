import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/admin-auth";
import { ProductImage } from "@/types/imageProps";
import { ProductProps, ProductSpecification, ProductTag, ProductVariant } from "@/types/product";
import { deleteImage } from "@/lib/delete-image";
import db from "@/lib/db";

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
  const client = await db.connect();

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

    await client.query("BEGIN");

    // Category

    const categoryResult = await client.query(
      `SELECT id
       FROM categories
       WHERE id = $1
       LIMIT 1`,
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // Sub Category

    const subCategoryResult = await client.query(
      `SELECT id
       FROM sub_categories
       WHERE id = $1
       AND category_id = $2
       LIMIT 1`,
      [sub_category_id, category_id]
    );

    if (subCategoryResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Sub category not found.",
        },
        { status: 404 }
      );
    }

    // Duplicate Name

    const existsResult = await client.query(
      `SELECT id
       FROM products
       WHERE name = $1
       LIMIT 1`,
      [name]
    );

    if (existsResult.rows.length > 0) {
      await client.query("ROLLBACK");

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
      const slugExistsResult = await client.query(
        `SELECT id
         FROM products
         WHERE slug = $1
         LIMIT 1`,
        [slug]
      );

      if (slugExistsResult.rows.length > 0) {
        await client.query("ROLLBACK");

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
      const skuExistsResult = await client.query(
        `SELECT id
         FROM products
         WHERE sku = $1
         LIMIT 1`,
        [sku]
      );

      if (skuExistsResult.rows.length > 0) {
        await client.query("ROLLBACK");

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

    const productResult = await client.query(
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
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, 0, NOW(), NOW()
      )
      RETURNING id
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
        Boolean(featured),
        Boolean(best_seller),
        Boolean(new_arrival),
        meta_title || null,
        meta_description || null,
      ]
    );

    const productId = productResult.rows[0].id;

    // Product Images

    if (Array.isArray(images) && images.length > 0) {
      for (const image of images) {
        await client.query(
          `
          INSERT INTO product_images
          (
            product_id,
            image_url,
            is_thumbnail,
            created_at
          )
          VALUES ($1, $2, $3, NOW())
          `,
          [
            productId,
            image.image_url,
            Boolean(image.is_thumbnail),
          ]
        );
      }
    }

    // Specifications

    if (Array.isArray(specifications) && specifications.length) {
      for (const spec of specifications) {
        await client.query(
          `
          INSERT INTO product_specifications
          (
            product_id,
            specification_name,
            specification_value,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, NOW(), NOW())
          `,
          [
            productId,
            spec.specification_name,
            spec.specification_value,
          ]
        );
      }
    }

    // Tags

    if (Array.isArray(tags) && tags.length) {
      for (const tag of tags) {
        await client.query(
          `
          INSERT INTO product_tags
          (
            product_id,
            tag
          )
          VALUES ($1, $2)
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
        await client.query(
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
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
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

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        id: productId,
      },
      { status: 201 }
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

    const color =
      searchParams.get("color")?.split(",").filter(Boolean) ?? [];

    const size =
      searchParams.get("size")?.split(",").filter(Boolean) ?? [];

    const categories =
      searchParams.get("category")?.split(",").filter(Boolean) ?? [];

    const subCategories =
      searchParams.get("subCategory")?.split(",").filter(Boolean) ?? [];

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
      params.push(`%${search}%`);

      conditions.push(`p.name ILIKE $${params.length}`);
    }

    // =========================================================
    // Category - using category slug
    // =========================================================
    if (categories.length && !categories.includes("All")) {
      const placeholders = categories.map((category) => {
        params.push(category);
        return `$${params.length}`;
      });

      conditions.push(`c.slug IN (${placeholders.join(", ")})`);
    }

    // =========================================================
    // Sub Category - using subcategory slug
    // =========================================================
    if (
      subCategories.length &&
      !subCategories.includes("All")
    ) {
      const placeholders = subCategories.map((subCategory) => {
        params.push(subCategory);
        return `$${params.length}`;
      });

      conditions.push(
        `sc.slug IN (${placeholders.join(", ")})`
      );
    }

    // =========================================================
    // Status
    // =========================================================
    if (status !== "All") {
      params.push(status);

      conditions.push(`p.status = $${params.length}`);
    }

    // =========================================================
    // Color
    // =========================================================
    if (color.length > 0) {
      const placeholders = color.map((item) => {
        params.push(item);
        return `$${params.length}`;
      });

      conditions.push(`
        EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.color IN (${placeholders.join(", ")})
        )
      `);
    }

    // =========================================================
    // Size
    // =========================================================
    if (size.length > 0) {
      const placeholders = size.map((item) => {
        params.push(item);
        return `$${params.length}`;
      });

      conditions.push(`
        EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.size IN (${placeholders.join(", ")})
        )
      `);
    }

    // =========================================================
    // Max Price
    // =========================================================
    if (maxPrice > 0) {
      params.push(maxPrice);

      conditions.push(`p.price <= $${params.length}`);
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
    const countResult = await db.query(
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

    const total = Number(
      countResult.rows[0]?.total ?? 0
    );

    // =========================================================
    // Fetch Products
    // =========================================================
    const productParams = [...params, limit, offset];

    const productsResult = await db.query<ProductProps>(
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

        LIMIT $${productParams.length - 1}
        OFFSET $${productParams.length}
      `,
      productParams
    );

    const products = productsResult.rows;

    // =========================================================
    // Related Data
    // =========================================================
    let images: ProductImage[] = [];

    let specifications: ProductSpecification[] = [];

    let tags: ProductTag[] = [];

    let variants: ProductVariant[] = [];

    // =========================================================
    // Fetch related product data
    // =========================================================
    if (products.length > 0) {
      const productIds = products.map(
        (product) => product.id
      );

      const productPlaceholders = productIds.map(
        (_, index) => `$${index + 1}`
      );

      const productIdParams = productIds;

      // =======================================================
      // Images
      // =======================================================
      const imageResult = await db.query<ProductImage>(
        `
          SELECT
            id,
            product_id,
            image_url,
            is_thumbnail

          FROM product_images

          WHERE product_id IN (${productPlaceholders.join(", ")})
        `,
        productIdParams
      );

      images = imageResult.rows;

      // =======================================================
      // Specifications
      // =======================================================
      const specificationResult =
        await db.query<ProductSpecification>(
          `
            SELECT
              id,
              product_id,
              specification_name,
              specification_value

            FROM product_specifications

            WHERE product_id IN (${productPlaceholders.join(", ")})

            ORDER BY created_at
          `,
          productIdParams
        );

      specifications = specificationResult.rows;

      // =======================================================
      // Tags
      // =======================================================
      const tagResult = await db.query<ProductTag>(
        `
          SELECT
            id,
            product_id,
            tag

          FROM product_tags

          WHERE product_id IN (${productPlaceholders.join(", ")})
        `,
        productIdParams
      );

      tags = tagResult.rows;

      // =======================================================
      // Variants
      // =======================================================
      const variantResult =
        await db.query<ProductVariant>(
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

            WHERE product_id IN (${productPlaceholders.join(", ")})
          `,
          productIdParams
        );

      variants = variantResult.rows;
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
      categoryResult,
      subCategoryResult,
      sizeResult,
      colorResult,
      tagResult,
      priceResult,
    ] = await Promise.all([
      // =======================================================
      // Categories
      // =======================================================
      db.query(`
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
      db.query(`
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
      db.query(`
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
      db.query(`
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
      db.query(`
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
      db.query(`
        SELECT
          MIN(price) AS "minPrice",
          MAX(price) AS "maxPrice"

        FROM products
      `),
    ]);

    const categoryRows = categoryResult.rows;
    const subCategoryRows = subCategoryResult.rows;
    const sizeRows = sizeResult.rows;
    const colorRows = colorResult.rows;
    const tagRows = tagResult.rows;
    const priceRows = priceResult.rows;

    // =========================================================
    // Build Category Options
    // =========================================================
    const categoryOptions = categoryRows.map((category) => ({
      ...category,

      sub_categories: subCategoryRows.filter(
        (subCategory) =>
          Number(subCategory.category_id) ===
          Number(category.id)
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
    const productResult = await db.query<ProductRow>(
      `
        SELECT id
        FROM products
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    const product = productResult.rows;

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
    const imageResult = await db.query<ProductImage>(
      `
        SELECT
          id,
          image_url
        FROM product_images
        WHERE product_id = $1
      `,
      [id]
    );

    const images = imageResult.rows;

    // Delete image files
    for (const image of images) {
      if (image.image_url) {
        try {
          await deleteImage(image.image_url);
        } catch (error) {
          console.error(
            "Failed to delete image:",
            image.image_url,
            error
          );
        }
      }
    }

    // Delete image records
    await db.query(
      `
        DELETE FROM product_images
        WHERE product_id = $1
      `,
      [id]
    );

    // Delete product
    await db.query(
      `
        DELETE FROM products
        WHERE id = $1
      `,
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
  const client = await db.connect();

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
      variants = [],
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

    await client.query("BEGIN");

    // =========================================================
    // Product exists
    // =========================================================
    const productResult = await client.query<ProductRow>(
      `
        SELECT id
        FROM products
        WHERE id = $1
        LIMIT 1
      `,
      [productId]
    );

    const product = productResult.rows;

    if (!product.length) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    // =========================================================
    // Category exists
    // =========================================================
    const categoryResult = await client.query<CategoryRow>(
      `
        SELECT id
        FROM categories
        WHERE id = $1
        LIMIT 1
      `,
      [category_id]
    );

    const category = categoryResult.rows;

    if (!category.length) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // =========================================================
    // Duplicate product name (except current product)
    // =========================================================
    const existsResult = await client.query<ProductRow>(
      `
        SELECT id
        FROM products
        WHERE name = $1
          AND id != $2
        LIMIT 1
      `,
      [name, productId]
    );

    const exists = existsResult.rows;

    if (exists.length) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Product already exists.",
        },
        { status: 409 }
      );
    }

    // =========================================================
    // Update product
    // =========================================================
    await client.query(
      `
        UPDATE products
        SET
          category_id = $1,
          name = $2,
          slug = $3,
          sku = $4,
          short_description = $5,
          description = $6,
          cost_price = $7,
          offer_price = $8,
          price = $9,
          stock = $10,
          low_stock_threshold = $11,
          meta_title = $12,
          meta_description = $13,
          featured = $14,
          best_seller = $15,
          new_arrival = $16,
          status = $17,
          updated_at = NOW()
        WHERE id = $18
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
        Boolean(featured),
        Boolean(best_seller),
        Boolean(new_arrival),
        status,
        productId,
      ]
    );

    // =========================================================
    // Existing DB images
    // =========================================================
    const dbImagesResult = await client.query<ProductImageRow>(
      `
        SELECT id
        FROM product_images
        WHERE product_id = $1
      `,
      [productId]
    );

    const dbImages = dbImagesResult.rows;

    const dbIds = dbImages.map((img) => img.id);

    const requestIds = (images as ProductImage[])
      .map((img) => img.id)
      .filter(
        (id): id is number => id !== undefined
      );

    // =========================================================
    // Delete removed images
    // =========================================================
    const deleteIds = dbIds.filter(
      (id) => !requestIds.includes(id)
    );

    if (deleteIds.length > 0) {
      const placeholders = deleteIds.map(
        (_, index) => `$${index + 1}`
      );

      await client.query(
        `
          DELETE FROM product_images
          WHERE id IN (${placeholders.join(", ")})
        `,
        deleteIds
      );
    }

    // =========================================================
    // Update existing / Insert new images
    // =========================================================
    for (const image of images as ProductImage[]) {
      if (image.id) {
        await client.query(
          `
            UPDATE product_images
            SET
              image_url = $1,
              is_thumbnail = $2
            WHERE id = $3
          `,
          [
            image.image_url,
            Boolean(image.is_thumbnail),
            image.id,
          ]
        );
      } else {
        await client.query(
          `
            INSERT INTO product_images
            (
              product_id,
              image_url,
              is_thumbnail,
              created_at
            )
            VALUES ($1, $2, $3, NOW())
          `,
          [
            productId,
            image.image_url,
            Boolean(image.is_thumbnail),
          ]
        );
      }
    }

    // =========================================================
    // Specifications
    // =========================================================
    const dbSpecificationsResult =
      await client.query<ProductTagRow>(
        `
          SELECT id
          FROM product_specifications
          WHERE product_id = $1
        `,
        [productId]
      );

    const dbSpecifications =
      dbSpecificationsResult.rows;

    const dbSpecificationIds =
      dbSpecifications.map((specification) => specification.id);

    const requestSpecificationIds =
      (specifications as ProductSpecification[])
        .map((specification) => specification.id)
        .filter(
          (id): id is number => id !== undefined
        );

    const deleteSpecificationIds =
      dbSpecificationIds.filter(
        (id) => !requestSpecificationIds.includes(id)
      );

    if (deleteSpecificationIds.length > 0) {
      const placeholders = deleteSpecificationIds.map(
        (_, index) => `$${index + 1}`
      );

      await client.query(
        `
          DELETE FROM product_specifications
          WHERE id IN (${placeholders.join(", ")})
        `,
        deleteSpecificationIds
      );
    }

    for (const specification of specifications as ProductSpecification[]) {
      if (specification.id) {
        // Update
        await client.query(
          `
            UPDATE product_specifications
            SET
              specification_name = $1,
              specification_value = $2,
              updated_at = NOW()
            WHERE id = $3
          `,
          [
            specification.specification_name,
            specification.specification_value,
            specification.id,
          ]
        );
      } else {
        // Insert
        await client.query(
          `
            INSERT INTO product_specifications
            (
              product_id,
              specification_name,
              specification_value,
              created_at
            )
            VALUES ($1, $2, $3, NOW())
          `,
          [
            productId,
            specification.specification_name,
            specification.specification_value,
          ]
        );
      }
    }

    // =========================================================
    // Tags
    // =========================================================
    const dbTagsResult =
      await client.query<ProductTagRow>(
        `
          SELECT id
          FROM product_tags
          WHERE product_id = $1
        `,
        [productId]
      );

    const dbTags = dbTagsResult.rows;

    const dbTagIds = dbTags.map((tag) => tag.id);

    const requestTagIds =
      (tags as ProductTag[])
        .map((tag) => tag.id)
        .filter(
          (id): id is number => id !== undefined
        );

    const deleteTagIds = dbTagIds.filter(
      (id) => !requestTagIds.includes(id)
    );

    if (deleteTagIds.length > 0) {
      const placeholders = deleteTagIds.map(
        (_, index) => `$${index + 1}`
      );

      await client.query(
        `
          DELETE FROM product_tags
          WHERE id IN (${placeholders.join(", ")})
        `,
        deleteTagIds
      );
    }

    for (const tag of tags as ProductTag[]) {
      if (!tag.tag?.trim()) {
        continue;
      }

      if (tag.id) {
        // Update
        await client.query(
          `
            UPDATE product_tags
            SET tag = $1
            WHERE id = $2
          `,
          [
            tag.tag.trim(),
            tag.id,
          ]
        );
      } else {
        // Insert
        await client.query(
          `
            INSERT INTO product_tags
            (
              product_id,
              tag
            )
            VALUES ($1, $2)
          `,
          [
            productId,
            tag.tag.trim(),
          ]
        );
      }
    }

    // =========================================================
    // Variants
    // =========================================================
    const dbVariantsResult =
      await client.query<ProductTagRow>(
        `
          SELECT id
          FROM product_variants
          WHERE product_id = $1
        `,
        [productId]
      );

    const dbVariants = dbVariantsResult.rows;

    const dbVariantIds = dbVariants.map(
      (variant) => variant.id
    );

    const requestVariantIds =
      (variants as ProductVariant[])
        .map((variant) => variant.id)
        .filter(
          (id): id is number => id !== undefined
        );

    const deleteVariantIds = dbVariantIds.filter(
      (id) => !requestVariantIds.includes(id)
    );

    if (deleteVariantIds.length > 0) {
      const placeholders = deleteVariantIds.map(
        (_, index) => `$${index + 1}`
      );

      await client.query(
        `
          DELETE FROM product_variants
          WHERE id IN (${placeholders.join(", ")})
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
        await client.query(
          `
            UPDATE product_variants
            SET
              sku = $1,
              color = $2,
              size = $3,
              stock = $4,
              updated_at = NOW()
            WHERE id = $5
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
        await client.query(
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
            VALUES ($1, $2, $3, $4, $5, NOW())
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

    // =========================================================
    // Commit
    // =========================================================
    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully.",
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