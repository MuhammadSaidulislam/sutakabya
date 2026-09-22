'use client';

import { useState, useEffect, useCallback } from 'react';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type Slide = {
  tag: string;
  titleTop: string;
  titleAccent: string;
  copy: string;
  cta: string;
  href: string;
  alt: string;
  desktop: string; // 2400 x 1000 (12:5)
  mobile: string; // 1080 x 1350 (4:5)
  pos?: string; // optional object-position, e.g. '70% center'
};

const slides: Slide[] = [
  {
    tag: 'New Arrival',
    titleTop: 'Tiny Moments,',
    titleAccent: 'Big Smiles',
    copy: 'Discover premium quality styles for your little ones & you.',
    cta: 'Shop Collection',
    href: '/collections/new-arrivals',
    alt: 'Mother and children in matching pastel outfits',
    desktop: '/images/hero-pc-1.png',
    mobile: '/images/hero-mobile-1.jpeg',
  },
  {
    tag: 'Trending Now',
    titleTop: 'Little Steps,',
    titleAccent: 'Big Style',
    copy: 'Matching family outfits made for picture-perfect memories.',
    cta: 'Explore Looks',
    href: '/collections/family-matching',
    alt: 'Family wearing coordinated matching outfits',
    desktop: '/images/hero-pc-2.png',
    mobile: '/images/hero-mobile-2.png',
  },
  {
    tag: 'Season Edit',
    titleTop: 'Soft Fabrics,',
    titleAccent: 'Sweet Days',
    copy: 'Organic cotton essentials for delicate, happy skin.',
    cta: 'Shop Organic',
    href: '/collections/organic',
    alt: 'Baby dressed in soft organic cotton clothing',
    desktop: '/images/hero-pc-3.png',
    mobile: '/images/hero-mobile-3.png',
  },
];

const SLIDE_DURATION = 6000;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Builds the same optimized srcSet Next.js would give <Image>. */
const buildProps = (src: string, alt: string, priority = false) =>
  getImageProps({ src, alt, fill: true, sizes: '100vw', quality: 80, priority }).props;

/** Art-directed image: mobile crop below 768px, desktop crop above. Only one file is downloaded. */
function SlideImage({ slide, priority }: { slide: Slide; priority: boolean }) {
  const { srcSet: desktopSet } = buildProps(slide.desktop, slide.alt, priority);
  const { srcSet: mobileSet, ...img } = buildProps(slide.mobile, slide.alt, priority);

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSet} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...img}
        srcSet={mobileSet}
        alt={slide.alt}
        className="object-cover"
        style={{ ...img.style, objectPosition: slide.pos ?? 'center' }}
      />
    </picture>
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  // Warm the cache for the next slide so the crossfade never shows a blank frame.
  useEffect(() => {
    const upcoming = slides[(index + 1) % slides.length];
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const props = buildProps(isDesktop ? upcoming.desktop : upcoming.mobile, upcoming.alt);
    const preload = new window.Image();
    preload.sizes = '100vw';
    if (props.srcSet) preload.srcset = props.srcSet;
    preload.src = props.src;
  }, [index]);

  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative mx-auto overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/*
        Height rules:
        - mobile: 4:5, never shorter than 540px so the text always fits, capped at 680px
        - tablet: 16:9, min 560px
        - desktop: 12:5, min 560px, capped at 720px
      */}
      <div className="relative w-full overflow-hidden bg-neutral-100 shadow-card aspect-[4/5] min-h-[540px] max-h-[680px] md:aspect-[16/9] md:min-h-[560px] md:max-h-none lg:aspect-[12/5] lg:max-h-[720px]">
        {/* ---------------- background image: crossfade + slow zoom ---------------- */}
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
              animate={{ scale: reduce ? 1 : 1.03 }}
              transition={{ duration: SLIDE_DURATION / 1000 + 1, ease: 'linear' }}
            >
              <SlideImage slide={slide} priority={index === 0} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ---------------- legibility + brand-tinted overlays ---------------- */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/25 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-ink/55 via-brand-ink/5 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-pink/10 via-transparent to-brand-teal-light/10" />

        {/* ambient sparkles */}
        {!reduce && (
          <>
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
          </>
        )}

        {/* ---------------- content, bottom-left ---------------- */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 py-8 sm:px-10 sm:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={index + '-content'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-lg"
              aria-live={paused ? 'polite' : 'off'}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                ✨ {slide.tag}
              </span>

              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white drop-shadow-sm sm:mt-5 sm:text-5xl lg:text-6xl">
                {slide.titleTop}
                <br />
                <span className="text-brand-pink-light">{slide.titleAccent}</span>
              </h1>

              <p className="mt-3 max-w-sm text-sm text-white/85 sm:mt-4 sm:text-base">{slide.copy}</p>

              <Link
                href={slide.href}
                className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-ink shadow-soft transition-transform hover:scale-[1.03] sm:mt-7"
              >
                <span className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-pink-light to-brand-teal-light opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {slide.cta}
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/*
            Progress bars double as the autoplay timer: when the active bar's CSS animation ends,
            we advance. Clicking a dot restarts a full duration, and hover/focus pauses both.
          */}
          <div className="mt-7 flex max-w-xs gap-2 sm:mt-9">
            {slides.map((s, i) => (
              <button
                key={s.tag}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25"
              >
                {i === index && (
                  <span
                    key={index}
                    className="absolute inset-0 origin-left rounded-full bg-white"
                    style={{
                      animation: `hero-progress ${SLIDE_DURATION}ms linear forwards`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                    onAnimationEnd={(e) => {
                      if (e.animationName === 'hero-progress') next();
                    }}
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