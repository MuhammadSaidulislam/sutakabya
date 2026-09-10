import { ProductVariant } from "./product"

// size stock
export interface SizeStock {
  size: string
  qty: number
}
// cart
export interface CartItem {
  id: number
  name: string
  price: number
  offer_price?: number
  image: string
  color: string
  size: string
  qty: number
  variants?: ProductVariant[]
}
// product
export interface Product {
  id: string
  name: string
  category: string
  price: number
  compareAt: number | null
  rating: number
  reviewCount: number
  isNew: boolean
  isBestseller: boolean
  /** @deprecated use sizeStock totals instead; kept for backward compatibility */
  stock: number
  sizeStock: SizeStock[]
  tags: string[]
  colors: string[]
  sizes: string[]
  images: string[]
  description: string
  materials: string
  shipping: string
}