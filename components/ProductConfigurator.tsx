'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, ShoppingBag, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { ProductProps } from '@/types/product'

export default function ProductConfigurator({ product }: { product: ProductProps }) {
  const availableVariants = product.variants.filter(
    (variant): variant is ProductProps['variants'][number] & { color: string; size: string } =>
      variant.stock > 0 && !!variant.color && !!variant.size
  );
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addToCart = useStore((s) => s.addToCart)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const wishlist = useStore((s) => s.wishlist)
  const isWished = wishlist.some((item) => item.id === product.id);


  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0].image_url,
      color: selectedColor,
      size: selectedSize,
      qty: Math.min(qty, 5),
      //   qty: Math.min(qty, stockForSize),
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }


  console.log('availableVariants', availableVariants)

  return (
    <div>
      <p className="text-coral-500 text-xs tracking-[0.2em] uppercase mb-2">{product.category_name}</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-3">{product.name}</h1>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-0.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => {
              const rating = Number(product.average_rating);
              return (
                <Star key={i} size={15} className={i < rating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300"} />
              );
            })}
          </div>
        </div>
        <span className="text-sm text-ink-400">{product.average_rating} ({product.rating_count} reviews)</span>
      </div>

      <div className="flex items-center gap-3 mb-5">
        {product.offer_price ? (
          <>
            <span className="text-3xl font-semibold text-ink-900 text-nowrap">
              ৳ {Number(product.offer_price)}
            </span>

            <span className="text-2xl text-brand-muted line-through text-nowrap">
              ৳ {Number(product.price)}
            </span>

            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[18px] font-bold text-rose-600 text-nowrap">
              -{Math.round(
                ((Number(product.price) - Number(product.offer_price)) /
                  Number(product.price)) *
                100
              )}%
            </span>
          </>
        ) : (
          <span className="text-3xl font-semibold text-ink-900 text-nowrap">
            ৳ {Number(product.price)}
          </span>
        )}
      </div>

      {/*  {totalAvailable <= 8 && totalAvailable > 0 && (
        <p className="text-sm text-coral-500 font-medium mb-6">⚡ Only {totalAvailable} left across all sizes — order soon</p>
      )}
      {totalAvailable === 0 && (
        <p className="text-sm text-ink-400 font-medium mb-6">Currently out of stock in all sizes</p>
      )}
      {totalAvailable > 8 && <div className="mb-6" />} */}

      {/* Color */}
      {availableVariants && availableVariants.length > 0 &&
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold">
              Color:
            </h3>

            <div className="flex gap-2">
              {availableVariants.map((variant) => (
                <button
                  key={variant.color}
                  onClick={() => setSelectedColor(variant.color)}
                  className={`w-7 h-7 p-[2px] rounded-full transition-all duration-200 ${selectedColor === variant.color
                    ? "border-2 border-brand-pink"
                    : "border-2 border-transparent hover:border-gray-300"
                    }`}
                >
                  <div
                    className="w-full h-full rounded-full border border-gray-200"
                    style={{
                      backgroundColor: variant.color.toLowerCase(),
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>}


      {/* Size with per-size stock */}
      {availableVariants && availableVariants.length > 0 &&
        <div className="mb-3">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold">
              Size:
            </h3>
            <div className="flex gap-1 flex-wrap">
              {availableVariants?.map((variant) => (
                <button
                  key={variant.size}
                  onClick={() => setSelectedSize(variant.size)}
                  className={`  px-2 rounded-sm border transition font-semibold  ${selectedSize === variant.size
                    ? "border-brand-pink bg-brand-pink text-white"
                    : "border-gray-300 text-gray-700"} `}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>
        </div>}

      {/* Specifications */}
      {product.specifications.length > 0 &&
        <div className="space-y-2">
          {product.specifications.map((spec) => (
            <div
              key={spec.id}
              className="flex items-start text-sm"
            >
              <span className="font-medium text-gray-900 min-w-[160px]">
                {spec.specification_name}:
              </span>
              <span className="text-gray-600">
                {spec.specification_value}
              </span>
            </div>
          ))}
        </div>}

      {/* Qty + Add to cart */}
      <div className="flex items-center gap-4 mb-4 mt-5">
        <div className="flex items-center border border-ink-100 rounded-full">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3.5 py-2.5"
          >
            -
          </button>

          <span className="w-8 text-center text-sm">{qty}</span>

          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-3.5 py-2.5 disabled:opacity-30"
          >
            +
          </button>
        </div>

        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.96 }}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-pink py-3.5 font-medium text-white shadow-glow hover:bg-coral-500 btn-magnetic"
        >
          {added ? (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Check size={18} />
              Added to Bag
            </motion.span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingBag size={18} />
              Add to Cart
            </span>
          )}
        </motion.button>

        <button
          onClick={() => toggleWishlist({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0].image_url,
            color: selectedColor,
            size: selectedSize,
            qty: Math.min(qty, 5),
          })}
          aria-label="Toggle wishlist"
          className={`rounded-full border border-ink-100 p-3.5 hover:border-bubblegum-300 ${isWished
            ? "bg-red-soft text-white"
            : "bg-white text-bubblegum-400 hover:bg-red-soft hover:text-white"
            }`}
        >
          <Heart size={18} className="fill-current" />
        </button>
      </div>


    </div>
  )
}
