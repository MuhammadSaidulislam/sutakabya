'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function CartDrawer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const isOpen = useStore((s) => s.isCartOpen)
  const close = useStore((s) => s.closeCart)
  const cart = useStore((s) => s.cart)
  const updateQty = useStore((s) => s.updateQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const total = cart.reduce((sum, item) => sum + item.qty * (item.offer_price && Number(item.offer_price) > 0 ? Number(item.offer_price) : Number(item.price)), 0);
  // const total = useStore((s) => s.cartTotal())


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 backdrop-blur-[2px]"
            onClick={close}
          />

          {/* Cart Sidebar */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:w-[440px]"
          >
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between border-b border-ink-100/80 px-6 py-5">
              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                  Shopping
                </p>

                <h2 className="font-serif text-xl text-ink-900">
                  Your Bag{" "}
                  <span className="ml-1 text-sm font-normal text-ink-400">
                    ({cart.reduce((s, c) => s + c.qty, 0)})
                  </span>
                </h2>
              </div>

              <button
                onClick={close}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-100 text-ink-500 transition-all hover:border-ink-300 hover:bg-white hover:text-ink-900"
              >
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>

            {/* ================= CART ITEMS ================= */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Empty Cart */}
              {cart.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-ink-100 bg-white">
                    <ShoppingBag
                      size={25}
                      strokeWidth={1.3}
                      className="text-ink-400"
                    />
                  </div>

                  <h3 className="font-serif text-lg text-ink-800">
                    Your bag is empty
                  </h3>

                  <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-ink-400">
                    Discover something beautiful for you and your little one.
                  </p>
                </div>
              )}

              {/* Items */}
              <AnimatePresence mode="popLayout">
                {cart.map((item) => {
                  /*
                   * ===============================
                   * OFFER PRICE LOGIC
                   * ===============================
                   */

                  const originalPrice = Number(item.price);

                  const offerPrice =
                    item.offer_price !== undefined &&
                      item.offer_price !== null
                      ? Number(item.offer_price)
                      : 0;

                  const hasOffer =
                    offerPrice > 0 &&
                    offerPrice < originalPrice;

                  // Final price customer actually pays
                  const itemPrice = hasOffer
                    ? offerPrice
                    : originalPrice;

                  // Discount percentage
                  const discount = hasOffer
                    ? Math.round(
                      ((originalPrice - offerPrice) /
                        originalPrice) *
                      100
                    )
                    : 0;

                  // Total for this cart item
                  const itemTotal = itemPrice * item.qty;

                  return (
                    <motion.div
                      key={`${item.id}-${item.color}-${item.size}`}
                      layout
                      initial={{
                        opacity: 0,
                        x: 25,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 25,
                        height: 0,
                        marginBottom: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="group relative border-b border-ink-100/70 py-5 first:pt-1 last:border-b-0"
                    >
                      <div className="flex gap-4">
                        {/* ================= IMAGE ================= */}
                        <div className="relative h-[104px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-cream-200">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="84px"
                          />

                          {/* Discount Badge */}
                          {hasOffer && (
                            <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* ================= DETAILS ================= */}
                        <div className="min-w-0 flex-1">
                          {/* Product name + remove */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-ink-900">
                                {item.name}
                              </h3>

                              {/* Color / Size */}
                              {(item.color || item.size) && (
                                <p className="mt-1 text-[10px] uppercase tracking-wide text-ink-400">
                                  {item.color && item.color}

                                  {item.color &&
                                    item.size &&
                                    " / "}

                                  {item.size && item.size}
                                </p>
                              )}
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                removeFromCart(
                                  item.id,
                                  item.color,
                                  item.size
                                )
                              }
                              className="shrink-0 p-1 rounded-md transition-colors bg-rose-500 text-white"
                              aria-label="Remove item"
                            >
                              <Trash2
                                size={13}
                                strokeWidth={1.7}
                              />
                            </button>
                          </div>

                          {/* ================= PRICE ================= */}
                          <div className="mt-2 flex items-center gap-2">
                            {/* Actual selling price */}
                            <span className="text-sm font-semibold text-ink-900">
                              ৳ {itemPrice}
                            </span>

                            {/* Original price */}
                            {hasOffer && (
                              <span className="text-[10px] text-ink-400 line-through">
                                ৳ {originalPrice}
                              </span>
                            )}
                          </div>

                          {/* ================= QUANTITY + TOTAL ================= */}
                          <div className="mt-3 flex items-center justify-between">
                            {/* Quantity */}
                            <div className="flex h-8 items-center rounded-full border border-ink-200 bg-white">
                              {/* Minus */}
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                                onClick={() =>
                                  updateQty(
                                    item.id,
                                    item.color,
                                    item.size,
                                    item.qty - 1
                                  )
                                }
                                aria-label="Decrease quantity"
                              >
                                <Minus
                                  size={11}
                                  strokeWidth={2}
                                />
                              </button>

                              {/* Quantity */}
                              <span className="w-7 text-center text-[11px] font-semibold text-ink-800">
                                {item.qty}
                              </span>

                              {/* Plus */}
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                                onClick={() =>
                                  updateQty(
                                    item.id,
                                    item.color,
                                    item.size,
                                    item.qty + 1
                                  )
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus
                                  size={11}
                                  strokeWidth={2}
                                />
                              </button>
                            </div>

                            {/* Item total */}
                            <span className="text-xs font-semibold text-ink-800">
                              ৳ {itemTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ================= BOTTOM SUMMARY ================= */}
            {cart.length > 0 && (
              <div className="border-t border-ink-100 bg-white/80 px-6 pb-6 pt-5">

                {/* Subtotal */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs text-ink-500">
                    Subtotal
                  </span>

                  <span className="text-base font-semibold text-ink-900">
                    ৳ {total}
                  </span>
                </div>

                {/* Buttons */}
                <div className="space-y-2.5">
                  {/* View Bag */}
                  <Link
                    href="/cart"
                    onClick={close}
                    className="flex h-11 w-full items-center justify-center rounded-full border border-ink-800 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800 transition-all hover:bg-ink-800 hover:text-white"
                  >
                    View Bag
                  </Link>

                  {/* Checkout */}
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="flex h-11 w-full items-center justify-center rounded-full bg-rose-400 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-glow transition-all hover:bg-blush-500"
                  >
                    Checkout
                  </Link>
                </div>

                {/* Security */}
                <p className="mt-3 text-center text-[9px] uppercase tracking-[0.15em] text-ink-300">
                  Secure &amp; effortless checkout
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
