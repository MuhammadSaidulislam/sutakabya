'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Menu, X, User } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useHydrated } from '@/lib/useHydrated'


const navLinks = [
  { href: '/shop', label: 'For Mom' },
  { href: '/shop', label: 'For Baby' },
  { href: '/shop', label: 'For Child' },
  { href: '/shop', label: 'Maternity' },
  { href: '/events/eid-festival', label: 'Eid Festival', highlight: true },
  { href: '/about', label: 'Our Story' },
]

export default function Navbar({isLoggedIn}:{isLoggedIn: boolean}) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
//  const cartCount = useStore((s) => s.cartCount())
  const wishlist = useStore((s) => s.wishlist)
 const toggleCart = useStore((s) => s.toggleCart)
const hydrated = useHydrated();

const cart = useStore((state) => state.cart);

const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);



  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-red-500/700 backdrop-blur-lg border-b border-black/5 shadow-soft' : 'bg-transparent' }`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-20 items-center justify-between">
          <button
            className="md:hidden text-ink-800"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="font-serif text-2xl sm:text-3xl tracking-tight text-ink-900">
            Kids <span className="text-gradient">&amp;</span> Mom
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.highlight
                    ? 'text-sunny-500 hover:text-coral-500 font-semibold'
                    : 'text-ink-600 hover:text-rose-danger'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              aria-label="Account"
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-cream-200 transition-colors"
            >
              <User size={20} className="text-ink-700" />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 rounded-full hover:bg-cream-200 transition-colors"
            >
              <Heart size={20} className="text-ink-700" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-soft text-[10px] leading-4 text-white font-semibold text-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
         <button
              onClick={toggleCart}
              aria-label="Open cart"
              className="relative p-2 rounded-full hover:bg-cream-200 transition-colors"
            >
              <ShoppingBag size={20} className="text-ink-700" />
              {hydrated && cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-sage-500 text-[10px] leading-4 bg-teal-500 text-white text-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden glass border-t border-ink-100 px-5 py-4 flex flex-col gap-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-ink-700 py-1"
            >
              {link.label}
            </Link>
          ))}
        </motion.nav>
      )}
    </header>
  )
}
