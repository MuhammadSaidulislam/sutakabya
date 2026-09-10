'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatPrice } from '@/lib/formatPrice'


export default function Page() {
  const cart = useStore((s) => s.cart)
  const updateQty = useStore((s) => s.updateQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const total = cart.reduce((sum, item) => sum + item.qty * (item.offer_price && Number(item.offer_price) > 0 ? Number(item.offer_price) : Number(item.price)), 0);
  const shipping = total > 75 || total === 0 ? 0 : 8
  const grandTotal = total + shipping;


  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <ShoppingBag size={48} className="mx-auto mb-5 text-ink-300" />
        <h1 className="font-serif text-3xl text-black mb-3">Your bag is empty</h1>
        <p className="text-ink-400 mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="inline-block px-8 py-3.5 rounded-full bg-rose-danger text-white font-medium btn-magnetic">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
                <h3 className="font-semibold text-neutral-800 mb-6">Your Shopping Bag</h3>
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 text-xs uppercase tracking-wide text-ink-400 pb-3 border-b border-ink-100">
            <span>Product</span><span>Price</span><span>Quantity</span><span className="text-right">Total</span>
          </div>
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={`${item.id}-${item.color}-${item.size}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -30, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center py-6 border-b border-ink-100"
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div>
                    <p className="font-medium text-ink-800 text-sm">{item.name}</p>
                    {(item.color || item.size) && (
                      <p className="text-xs text-ink-400">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                    )}
                    <button
                      onClick={() => removeFromCart(item.id, item.color, item.size)}
                      className="flex items-center gap-1 text-xs text-red-500 mt-2"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
                <span className="text-sm text-ink-600">{formatPrice(item.price)}</span>
                <div className="flex items-center border border-ink-100 rounded-full w-fit">
                  <button className="p-2" onClick={() => updateQty(item.id, item.color, item.size, item.qty - 1)}><Minus size={12} /></button>
                  <span className="text-sm w-6 text-center">{item.qty}</span>
                  <button className="p-2" onClick={() => updateQty(item.id, item.color, item.size, item.qty + 1)}><Plus size={12} /></button>
                </div>
                <span className="text-sm font-semibold text-ink-900 sm:text-right">{formatPrice(item.price * item.qty)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
          <h2 className="font-serif text-xl mb-5">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="border-t border-ink-200 pt-3 flex justify-between font-semibold text-base">
              <span>Total</span><span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center mt-6 py-3.5 rounded-full bg-brand-pink hover:bg-blush-500 text-white font-medium btn-magnetic shadow-glow"
          >
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="block text-center font-medium mt-3 py-3.5 rounded-full text-sm bg-sky text-white hover:text-blush-500">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
