import { ProductImage } from "./imageProps";
export interface ColorOption {
  name: string
  hex: string
}
export interface CategoryFilter {
  id: number;
  name: string;
}

export interface SizeFilter {
  size: string;
}

export interface ColorFilter {
  color_name: string;
  color_code: string;
}

export interface TagFilter {
  tag: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  categories: CategoryFilter[];
  sizes: SizeFilter[];
  colors: ColorFilter[];
  tags: TagFilter[];
  priceRange: PriceRange;
}

export type ProductProps = {
  id: number;

  // Category
  category?: string;
  category_id: number;
  category_name: string;
  sub_category_id?: number;
  sub_category_name?: string;

  // Basic Information
  name: string;
  slug: string;
  sku: string;

  // Description
  short_description?: string;
  description: string;

  // Pricing
  price: number;
  cost_price?: number;
  offer_price?: number;

  // Inventory
  stock: number;
  low_stock_threshold: number;

  // Status
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "INACTIVE";

  // Product Flags
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;

  // SEO
  meta_title?: string;
  meta_description?: string;

  // Relations
  images: ProductImage[];
  tags: Tag[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];

  // Ratings
  average_rating: string,
  rating_count: number,

  created_at: Date;
  updated_at: Date;
};

export type ProductVariant = {
  id?: number;
  product_id?: number;

  sku?: string;
  color: string;
  size?: string;

  stock: number;
};

export type ProductSpecification = {
  id?: number;
  product_id?: number;

  specification_name: string;
  specification_value: string;
};


export type ProductTag = {
  id: number;
  product_id: number;
  tag: string;
}

export type ProductColor = {
  id: number;
  product_id: number;
  color_name: string;
  color_code: string | null;
}

export type ProductSize = {
  id: number;
  product_id: number;
  size: string;
}

export const colors: ColorOption[] = [
  { name: 'Blush', hex: '#ff8a7a' },
  { name: 'Sage', hex: '#36d9c4' },
  { name: 'Cream', hex: '#ffecd1' },
  { name: 'Ink', hex: '#2a2520' },
  { name: 'Dusty Rose', hex: '#f2441f' },
  { name: 'Sunny Gold', hex: '#ffb703' },
  { name: 'Violet', hex: '#8c3df0' },
]

export interface Filters {
  size: string[]
  color: string[]
  selectedPrice: number
  sort: "newest" | "price-asc" | "price-desc" | "top-viewed";
}

export type Color = {
  color: string;
};
export type Size = {
  size: string;
};
export type Tag = {
  id?: number;
  tag: string;
};