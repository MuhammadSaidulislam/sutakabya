'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

type CategoryItem = {
  slug: string
  title: string
  desc?: string
  badge?: string
  image: string
  size: 'large' | 'half'
}

const menCollection: CategoryItem = {
  slug: 'men',
  title: "Men's Collection",
  desc: 'Premium styles for the modern man',
  badge: 'Trending 2026',
  image: '/images/ads-2.png',
  size: 'large',
}

const womenCollection: CategoryItem = {
  slug: 'women',
  title: "Women's Style",
  desc: 'Elegance crafted for every occasion',
  badge: 'Winter Elite',
image: '/images/ads-2.png',
  size: 'large',
}

const kidsCollection: CategoryItem = {
  slug: 'kids',
  title: 'Kids Collection',
 image: '/images/ads.png',
  size: 'half',
}

const cosmeticsCollection: CategoryItem = {
  slug: 'cosmetics',
  title: 'Cosmetics',
 image: '/images/ads.png',
  size: 'half',
}

/**
 * Reproduces .bento-overlay + its :hover state as two stacked gradient
 * layers that crossfade — Tailwind has no shorthand for a 3-stop rgba
 * gradient, so both states are expressed as arbitrary-value backgrounds.
 */
function BentoOverlay({ children, padding = 'p-8' }: { children: React.ReactNode; padding?: string }) {
  return (
    <div className={`absolute inset-0 z-[2] flex items-end ${padding}`}>
      {/* Default state: dark gradient, always visible */}
      <div
        className="absolute inset-0 transition-opacity duration-[450ms] ease-out group-hover:opacity-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
        }}
      />
      {/* Hover state: rose gradient, fades in on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-[450ms] ease-out group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(to top, rgba(236,14,77,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)',
        }}
      />
      <div className="relative w-full">{children}</div>
    </div>
  )
}

function LargeTile({ item, delay = 0, from = 'left' }: { item: CategoryItem; delay?: number; from?: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from === 'left' ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full rounded-2xl overflow-hidden"
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <BentoOverlay padding="p-6 sm:p-8">
        <div className="space-y-2">
          {item.badge && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide uppercase">
              {item.badge}
            </span>
          )}
          <h3 className="font-serif text-2xl sm:text-3xl text-white">{item.title}</h3>
          {item.desc && <p className="text-sm text-white/80">{item.desc}</p>}
          <Link
            href="/shop"
            className="inline-flex mt-2 px-5 py-2 rounded-full bg-white text-ink-900 text-sm font-semibold transition-colors duration-300 hover:bg-ink-900 hover:text-white"
          >
            Shop Now
          </Link>
        </div>
      </BentoOverlay>
    </motion.div>
  )
}

function HalfTile({ item, delay = 0, from = 'down' }: { item: CategoryItem; delay?: number; from?: 'down' | 'up' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: from === 'down' ? -20 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full rounded-2xl overflow-hidden"
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 20vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <BentoOverlay padding="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-white">{item.title}</h3>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-semibold text-white transition-all duration-300 group-hover:gap-1.5"
          >
            Explore <ArrowRight size={12} />
          </Link>
        </div>
      </BentoOverlay>
    </motion.div>
  )
}

export default function CategoryBentoGrid() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <div className="flex items-center justify-center flex-col  mb-8">
          <p className="font-serif text-3xl sm:text-4xl text-ink-900">Browse By</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-[2px] w-10 bg-gradient-to-r from-red-500 to-transparent" />

            <span className="whitespace-nowrap text-xl sm:text-3xl font-semibold uppercase tracking-[0.1em] text-rose-danger">
              Curated Collections
            </span>

            <div className="h-[2px] w-10 bg-gradient-to-l from-red-500 to-transparent" />
          </div>
          <div>
            <p className="text-coral-500 text-xs tracking-[0.2em] uppercase mb-2 mt-3"> Discover the latest trends with our handpicked luxury selections.</p>

          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.7fr_1fr] gap-5 h-auto md:h-[560px]">
        <div className="h-[320px] md:h-full">
          <LargeTile item={menCollection} delay={0.1} from="left" />
        </div>

        <div className="grid grid-rows-2 gap-5 h-[420px] md:h-full">
          <HalfTile item={kidsCollection} delay={0.2} from="down" />
          <HalfTile item={cosmeticsCollection} delay={0.3} from="up" />
        </div>

        <div className="h-[320px] md:h-full">
          <LargeTile item={womenCollection} delay={0.4} from="right" />
        </div>
      </div>
    </section>
  )
}