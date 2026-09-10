'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const slides = [
  {
    tag: 'New Arrival',
    titleTop: 'Tiny Moments,',
    titleAccent: 'Big Smiles',
    copy: 'Discover premium quality styles for your little ones & you.',
    cta: 'Shop Collection',
    img: 'https://picsum.photos/seed/kidsmom-hero1/1600/1000',
  },
  {
    tag: 'Trending Now',
    titleTop: 'Little Steps,',
    titleAccent: 'Big Style',
    copy: 'Matching family outfits made for picture-perfect memories.',
    cta: 'Explore Looks',
    img: 'https://picsum.photos/seed/kidsmom-hero2/1600/1000',
  },
  {
    tag: 'Season Edit',
    titleTop: 'Soft Fabrics,',
    titleAccent: 'Sweet Days',
    copy: 'Organic cotton essentials for delicate, happy skin.',
    cta: 'Shop Organic',
    img: 'https://picsum.photos/seed/kidsmom-hero3/1600/1000',
  },
];

const SLIDE_DURATION = 6000;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    const t = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[index];

  return (
    <section className="relative mx-auto mt-4 max-w-7xl overflow-hidden rounded-3xl sm:mt-6 sm:px-4 lg:px-8">
      <div className="relative min-h-[560px] overflow-hidden rounded-3xl shadow-card sm:min-h-[620px]">
        {/* ---------------- full-bleed background image, slow ken-burns zoom ---------------- */}
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: 1.09 }}
              transition={{ duration: SLIDE_DURATION / 1000 + 1, ease: 'linear' }}
            >
              <Image
                src={slide.img}
                alt="Mother and children in matching pastel outfits"
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ---------------- legibility + brand-tinted overlays ---------------- */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/25 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-ink/55 via-brand-ink/5 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-pink/10 via-transparent to-brand-teal-light/10" />

        {/* ambient sparkle accents, kept minimal since the photo carries the scene */}
        <motion.div
          className="pointer-events-none absolute right-10 top-10 text-white/70"
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.05, 0.85] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={18} />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute right-24 top-24 text-white/50"
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
        >
          <Sparkles size={12} />
        </motion.div>

        {/* ---------------- content, overlaid bottom-left ---------------- */}
        <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-end px-6 py-10 sm:min-h-[620px] sm:px-10 sm:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={index + '-content'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-lg"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                ✨ {slide.tag}
              </span>

              <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
                {slide.titleTop}
                <br />
                <span className="text-brand-pink-light">{slide.titleAccent}</span>
              </h1>

              <p className="mt-4 max-w-sm text-sm text-white/85 sm:text-base">{slide.copy}</p>

              <button className="group relative mt-7 inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-ink shadow-soft transition-transform hover:scale-[1.03]">
                <span className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-pink-light to-brand-teal-light opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {slide.cta}
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </AnimatePresence>

          {/* autoplay progress bars, Apple/Stories-style */}
          <div className="mt-9 flex max-w-xs gap-2">
            {slides.map((s, i) => (
              <button
                key={s.tag}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25"
              >
                {i === index && (
                  <motion.span
                    key={index}
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                  />
                )}
                {i < index && <span className="absolute inset-0 rounded-full bg-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- arrows ---------------- */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25 sm:flex"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25 sm:flex"
        >
          <ChevronRight size={18} />
        </button>

        {/* slide counter */}
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 text-xs font-medium text-white/80 sm:right-10">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className="h-px w-8 bg-white/40" />
          <span>{String(slides.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
}