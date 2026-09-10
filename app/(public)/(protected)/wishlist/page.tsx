"use client"
import { formatPrice } from '@/lib/formatPrice'
import { useStore } from '@/store/useStore'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Page = () => {
  const wishlist = useStore((s) => s.wishlist)
  const wishUpdateQty = useStore((s) => s.wishUpdateQty)
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-10">Your Shopping Bag</h1>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={48} className="text-ink-300 mb-4" />
          <p className="text-lg font-medium text-ink-800">Your wishlist is empty</p>
          <p className="text-sm text-ink-400 mt-2">
            Items you save will show up here.
          </p>
        </div>
      ) : (
        <div className="lg:col-span-2 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="py-3 text-left">Product</th>
                <th className="py-3 text-left">Price</th>
                <th className="py-3 text-center">Quantity</th>
                <th className="py-3 text-right">Total</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {wishlist.map((item) => (
                  <motion.tr
                    key={`${item.id}-${item.color}-${item.size}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-ink-100"
                  >
                    {/* Product */}
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-ink-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-ink-400">
                            {item.color} / {item.size}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-5">
                      {formatPrice(item.price)}
                    </td>

                    {/* Quantity */}
                    <td className="py-5">
                      <div className="flex items-center justify-center border border-ink-100 rounded-full w-fit">
                        <button
                          className="p-2"
                          onClick={() =>
                            wishUpdateQty(
                              item.id,
                              item.color,
                              item.size,
                              item.qty - 1
                            )
                          }
                        >
                          <Minus size={12} />
                        </button>

                        <span className="w-8 text-center">
                          {item.qty}
                        </span>

                        <button
                          className="p-2"
                          onClick={() =>
                            wishUpdateQty(
                              item.id,
                              item.color,
                              item.size,
                              item.qty + 1
                            )
                          }
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-5 text-right font-semibold">
                      {formatPrice(item.price * item.qty)}
                    </td>

                    {/* Actions */}
                    <td className="py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          // onClick={() => addToCart(item)}
                          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium bg-blue-500 text-white hover:bg-ink-800 transition"
                        >
                          <ShoppingBag size={16} />
                        </button>

                        <button
                          // onClick={() =>toggleWishlist(item)}
                          className="rounded-full border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Page