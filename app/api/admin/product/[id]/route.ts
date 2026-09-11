import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import  db  from "@/lib/db";
import { ProductProps, ProductSpecification, ProductTag, ProductVariant } from "@/types/product";
import { ProductImage } from "@/types/imageProps";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // PRODUCT
    // ============================================================

    const productResult = await db.query<ProductProps>(
      `
      SELECT
        p.id,
        p.category_id,
        c.name AS category_name,

        p.sub_category_id,
        sc.name AS sub_category_name,

        p.name,
        p.slug,
        p.sku,

        p.description,
        p.short_description,

        p.price,
        p.cost_price,
        p.offer_price,

        p.stock,
        p.low_stock_threshold,

        p.status,

        p.featured,
        p.best_seller,
        p.new_arrival,

        p.meta_title,
        p.meta_description,

        COALESCE(r.average_rating, 0)::numeric(3,1) AS average_rating,
        COALESCE(r.rating_count, 0)::integer AS rating_count,

        p.created_at,
        p.updated_at

      FROM products p

      INNER JOIN categories c
        ON c.id = p.category_id

      INNER JOIN sub_categories sc
        ON sc.id = p.sub_category_id

      LEFT JOIN (
        SELECT
          product_id,
          ROUND(AVG(rating)::numeric, 1) AS average_rating,
          COUNT(*) AS rating_count
        FROM product_reviews
        WHERE status = 'APPROVED'
        GROUP BY product_id
      ) r
        ON r.product_id = p.id

      WHERE p.id = $1

      LIMIT 1
      `,
      [productId]
    );

    const products = productResult.rows;

    if (!products.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const product = products[0];

    // ============================================================
    // PRODUCT RELATED DATA
    // ============================================================

    const [
      imageResult,
      tagResult,
      specificationResult,
      variantResult,
    ] = await Promise.all([
      db.query<ProductImage>(
        `
        SELECT
          id,
          product_id,
          image_url,
          is_thumbnail
        FROM product_images
        WHERE product_id = $1
        ORDER BY is_thumbnail DESC, id ASC
        `,
        [productId]
      ),

      db.query<ProductTag>(
        `
        SELECT
          id,
          product_id,
          tag
        FROM product_tags
        WHERE product_id = $1
        `,
        [productId]
      ),

      db.query<ProductSpecification>(
        `
        SELECT
          id,
          specification_name,
          specification_value
        FROM product_specifications
        WHERE product_id = $1
        ORDER BY id ASC
        `,
        [productId]
      ),

      db.query<ProductVariant>(
        `
        SELECT
          id,
          sku,
          color,
          size,
          stock
        FROM product_variants
        WHERE product_id = $1
        ORDER BY id ASC
        `,
        [productId]
      ),
    ]);

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      data: {
        ...product,

        images: imageResult.rows.map((img) => ({
          id: img.id,
          image_url: img.image_url,
          is_thumbnail: Boolean(img.is_thumbnail),
        })),

        tags: tagResult.rows.map((tag) => tag.tag),

        specifications: specificationResult.rows.map((spec) => ({
          id: spec.id,
          specification_name: spec.specification_name,
          specification_value: spec.specification_value,
        })),

        variants: variantResult.rows.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
        })),
      },
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