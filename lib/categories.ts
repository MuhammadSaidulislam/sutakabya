import type { Category, SubCategory } from "@/types/categories";
import { db } from "./db";

export async function getCategories(): Promise<Category[]> {
  try {
    const [categoryRows] = await db.query(`
      SELECT
        id,
        name,
        slug
      FROM categories
      ORDER BY name ASC
    `);

    const [subCategoryRows] = await db.query(`
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

    const categories = categoryRows as Omit<Category, "subCategories">[];
    const subCategories = subCategoryRows as SubCategory[];

    return categories.map((category) => ({
      ...category,
      subCategories: subCategories.filter(
        (subCategory) =>  Number(subCategory.category_id) === Number(category.id)
      ),
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}