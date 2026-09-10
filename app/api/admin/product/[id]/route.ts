import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { ProductProps, ProductSpecification, ProductTag, ProductVariant } from "@/types/product";
import { ProductImage } from "@/types/imageProps";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Product
    const [products] = await db.query<(ProductProps & RowDataPacket)[]>(
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

        CAST(COALESCE(r.average_rating, 0) AS DECIMAL(3,1)) AS average_rating,
        CAST(COALESCE(r.rating_count, 0) AS UNSIGNED) AS rating_count,

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
        ROUND(AVG(rating), 1) AS average_rating,
        COUNT(*) AS rating_count
      FROM product_reviews
      WHERE status = 'APPROVED'
      GROUP BY product_id) r
      ON r.product_id = p.id

      WHERE p.id = ?

      LIMIT 1
      `,
      [id]
    );

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

    const [
      imageResult,
      tagResult,
      specificationResult,
      variantResult,
    ] = await Promise.all([
      db.query<(ProductImage & RowDataPacket)[]>(
        `
        SELECT
          id,
          product_id,
          image_url,
          is_thumbnail
        FROM product_images
        WHERE product_id=?
        ORDER BY is_thumbnail DESC,id ASC
        `,
        [id]
      ),

      db.query<(ProductTag & RowDataPacket)[]>(
        `
        SELECT
          id,
          product_id,
          tag
        FROM product_tags
        WHERE product_id=?
        `,
        [id]
      ),

      db.query<(ProductSpecification & RowDataPacket)[]>(
        `
        SELECT
          id,
          specification_name,
          specification_value
        FROM product_specifications
        WHERE product_id=?
        ORDER BY id ASC
        `,
        [id]
      ),

      db.query<(ProductVariant & RowDataPacket)[]>(
        `
        SELECT
          id,
          sku,
          color,
          size,
          stock
        FROM product_variants
        WHERE product_id=?
        ORDER BY id ASC
        `,
        [id]
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...product,

        images: imageResult[0].map((img) => ({
          id: img.id,
          image_url: img.image_url,
          is_thumbnail: Boolean(img.is_thumbnail),
        })),

        tags: tagResult[0].map((tag) => tag.tag),

        specifications: specificationResult[0].map((spec) => ({
          id: spec.id,
          specification_name: spec.specification_name,
          specification_value: spec.specification_value,
        })),

        variants: variantResult[0].map((variant) => ({
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