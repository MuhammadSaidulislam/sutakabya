import type { Category, SubCategory } from "@/types/categories";
import db from "./db";

export async function getCategories(): Promise<Category[]> {
  try {
    const categoryResult = await db.query(`
      SELECT
        id,
        name,
        slug
      FROM categories
      ORDER BY name ASC
    `);

    const subCategoryResult = await db.query(`
      SELECT
        id,
        category_id,
        name,
        slug,
        status
      FROM sub_categories
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
    `);

    const categories =
      categoryResult.rows as Omit<Category, "subCategories">[];

    const subCategories =
      subCategoryResult.rows as SubCategory[];

    return categories.map((category) => ({
      ...category,
      subCategories: subCategories.filter(
        (subCategory) =>
          Number(subCategory.category_id) === Number(category.id)
      ),
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}