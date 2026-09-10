'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Star } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { ProductProps } from '@/types/product'



export default function ProductCard({ product, index = 0 }: { product: ProductProps; index?: number }) {
  const wishlist = useStore((s) => s.wishlist)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const isWished = wishlist.some(
    (item) => item.id === product.id
  );
  const addToCart = useStore((s) => s.addToCart)
  const stock = 10;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      offer_price: product.offer_price,
      image: product.images[0].image_url,
      color: "",
      size: "",
      qty: 1,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group card-3d bg-white rounded-2xl border border-border shadow-soft hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-200">
        <Link
          href={`/product/${product.id}`}
          className="group relative flex h-full w-full items-center justify-center overflow-hidden"
        >
          {Number(product.offer_price) > 0 &&
            Number(product.offer_price) < Number(product.price) && (
              <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-red-soft px-2 py-1 text-[10px] font-bold text-white">
                -
                {Math.round(
                  ((Number(product.price) - Number(product.offer_price)) /
                    Number(product.price)) *
                  100
                )}
                %
              </span>
            )}

          {/* Main Image */}
          <Image
            src={product.images[0].image_url}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover Image */}
          {product.images[1] && (
            <Image
              src={product.images[1].image_url}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="absolute inset-0 object-contain p-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <button
          onClick={() => toggleWishlist({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0].image_url,
            color: "",
            size: "",
            qty: 1,
          })}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 rounded-full p-2 transition-all duration-300 ${isWished
            ? "bg-red-soft text-white"
            : "bg-white text-bubblegum-400 hover:bg-red-soft hover:text-white"
            }`}
        >
          <Heart size={16} className={isWished ? "fill-current" : "fill-current"} />
        </button>

        {/* {stock > 0 && stock <= 5 && (
          <div className="absolute bottom-3 left-3 right-3 text-center text-[11px] py-1 rounded-full bg-ink-900/80 text-cream-50">
            Only {stock} left
          </div>
        )} */}
        {/* {stock === 0 && (
          <div className="absolute bottom-3 left-3 right-3 text-center text-[11px] py-1 rounded-full bg-ink-400/90 text-cream-50">
            Out of Stock
          </div>
        )} */}
      </div>

      <div className="block my-3 px-2">
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-mono text-ink-900">
            {product.category_name}
          </span>
          {Number(product.average_rating) > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-ink-400">
                {product.average_rating}
              </span>
            </div>
          )}
        </div>
        <Link href={`/product/${product.id}`} className="text-md font-bold text-rose-danger line-clamp-1">{product.name}</Link>

        <div className="flex items-center gap-2 mt-1">
          {product.offer_price ? (
            <>
              <span className="text-sm font-semibold text-ink-900 text-nowrap">
                ৳ {Number(product.offer_price)}
              </span>

              <span className="text-[11px] text-brand-muted line-through text-nowrap">
                ৳ {Number(product.price)}
              </span>

              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 text-nowrap">
                -{Math.round(
                  ((Number(product.price) - Number(product.offer_price)) /
                    Number(product.price)) *
                  100
                )}%
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-ink-900 text-nowrap">
              ৳ {Number(product.price)}
            </span>
          )}
        </div>
        <button onClick={handleAddToCart} className="mt-2 w-full rounded-full bg-brand-pink py-2 text-xs font-semibold text-white transition hover:bg-brand-rose sm:text-sm">
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
