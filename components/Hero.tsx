
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';

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
  pos?: string;
};

const slides: Slide[] = [
  {
    tag: 'New Collection',
    titleTop: 'Effortless Style,',
    titleAccent: 'Everyday Elegance',
    copy:  'Discover refined silhouettes and timeless pieces designed for your everyday wardrobe.',
    cta: 'Shop New Arrivals',
    href: '/collection?collection=new-arrival',
    alt: 'Woman wearing an elegant new-season outfit',
    desktop: '/images/hero-pc-1.png',
    mobile: '/images/hero-mobile-1.jpeg',
  },
  {
    tag: 'Trending Now',
    titleTop: 'Own Your Look,',
    titleAccent: 'Own Your Moment',
    copy:   'Modern essentials and statement styles designed to express your confidence.',
    cta: 'Explore Collection',
    href: '/shop',
    alt: 'Woman wearing a stylish contemporary outfit',
    desktop: '/images/hero-pc-2.png',
    mobile: '/images/hero-mobile-4.jpeg',
  },
  {
    tag: 'Season Edit',
    titleTop: 'Designed For',
    titleAccent: 'Everyday Elegance',
    copy:  'Elevated fabrics, flattering fits, and effortless designs made for every occasion.',
    cta: 'Best Collection',
    href: '/collection?collection=best-seller',
    alt: 'Woman wearing a sophisticated seasonal fashion outfit',
    desktop: '/images/hero-pc-3.png',
    mobile: '/images/hero-mobile-3.jpeg',
  },
];

/**
 * Time each slide stays active.
 *
 * 5000 = 5 seconds
 */
const SLIDE_DURATION = 5000;

/**
 * Framer Motion easing.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Background crossfade duration.
 */
const FADE_DURATION = 0.9;

/**
 * Text animation duration.
 */
const CONTENT_DURATION = 0.6;

/**
 * Builds the same optimized srcSet
 * Next.js would give <Image>.
 */
const buildProps = (
  src: string,
  alt: string,
  priority = false,
) =>
  getImageProps({
    src,
    alt,
    fill: true,
    sizes: '100vw',
    quality: 80,
    priority,
  }).props;

/**
 * Art-directed hero image.
 *
 * Mobile image is used below 768px.
 * Desktop image is used above 768px.
 */
function SlideImage({
  slide,
  priority,
}: {
  slide: Slide;
  priority: boolean;
}) {
  const { srcSet: desktopSet } = buildProps(
    slide.desktop,
    slide.alt,
    priority,
  );

  const { srcSet: mobileSet, ...img } = buildProps(
    slide.mobile,
    slide.alt,
    priority,
  );

  return (
    <picture>
      <source
        media="(min-width: 768px)"
        srcSet={desktopSet}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...img}
        srcSet={mobileSet}
        alt={slide.alt}
        className="object-cover"
        style={{
          ...img.style,
          objectPosition: slide.pos ?? 'center',
        }}
      />
    </picture>
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const reduce = useReducedMotion();

  /**
   * Go to next slide.
   */
  const next = useCallback(() => {
    setIndex((current) => {
      return (current + 1) % slides.length;
    });
  }, []);

  /**
   * Go to previous slide.
   */
  const prev = useCallback(() => {
    setIndex((current) => {
      return (
        (current - 1 + slides.length) %
        slides.length
      );
    });
  }, []);

  /**
   * ============================================
   * AUTOPLAY
   * ============================================
   *
   * React controls the timer.
   *
   * There is NO CSS animationEnd here.
   *
   * Every time index changes:
   *
   * 1. Old timer is cleared.
   * 2. New 5-second timer starts.
   *
   * When paused:
   * - No timer runs.
   *
   * When resumed:
   * - A fresh 5-second timer starts.
   */
  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = window.setTimeout(() => {
      next();
    }, SLIDE_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [index, paused, next]);

  /**
   * ============================================
   * PRELOAD NEXT IMAGE
   * ============================================
   *
   * This prevents a blank frame during
   * the crossfade transition.
   */
  useEffect(() => {
    const upcoming =
      slides[(index + 1) % slides.length];

    const isDesktop = window.matchMedia(
      '(min-width: 768px)',
    ).matches;

    const props = buildProps(
      isDesktop
        ? upcoming.desktop
        : upcoming.mobile,
      upcoming.alt,
    );

    const preload = new window.Image();

    preload.sizes = '100vw';

    if (props.srcSet) {
      preload.srcset = props.srcSet;
    }

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
        Hero height rules:

        Mobile:
        4:5
        min 540px
        max 680px

        Tablet:
        16:9
        min 560px

        Desktop:
        12:5
        max 720px
      */}
      <div
        className="
          relative
          w-full
          overflow-hidden
          bg-neutral-100
          shadow-card

          aspect-[4/5]
          min-h-[540px]
          max-h-[680px]

          md:aspect-[16/9]
          md:min-h-[560px]
          md:max-h-none

          lg:aspect-[12/5]
          lg:max-h-[720px]
        "
      >
        {/* ==========================================
            BACKGROUND IMAGE
            Crossfade + slow zoom
        ========================================== */}
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: FADE_DURATION,
              ease: EASE,
            }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{
                scale: 1,
              }}
              animate={{
                scale: reduce ? 1 : 1.03,
              }}
              transition={{
                duration: reduce
                  ? 0
                  : SLIDE_DURATION / 1000,
                ease: 'linear',
              }}
            >
              <SlideImage
                slide={slide}
                priority={index === 0}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ==========================================
            BOTTOM DARK GRADIENT
        ========================================== */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-brand-ink/80
            via-brand-ink/25
            to-transparent
          "
        />

        {/* ==========================================
            LEFT DARK GRADIENT
        ========================================== */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-r
            from-brand-ink/55
            via-brand-ink/5
            to-transparent
          "
        />

        {/* ==========================================
            BRAND COLOR OVERLAY
        ========================================== */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-brand-pink/10
            via-transparent
            to-brand-teal-light/10
          "
        />

        {/* ==========================================
            AMBIENT SPARKLES
        ========================================== */}
        {!reduce && (
          <>
            <motion.div
              className="
                pointer-events-none
                absolute
                right-10
                top-10
                text-white/70
              "
              animate={{
                opacity: [0.3, 0.9, 0.3],
                scale: [0.85, 1.05, 0.85],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles size={18} />
            </motion.div>

            <motion.div
              className="
                pointer-events-none
                absolute
                right-24
                top-24
                text-white/50
              "
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.1,
              }}
            >
              <Sparkles size={12} />
            </motion.div>
          </>
        )}

        {/* ==========================================
            CONTENT
        ========================================== */}
        <div
          className="
            absolute
            inset-0
            z-10
            flex
            flex-col
            justify-end
            px-6
            py-8
            sm:px-10
            sm:py-12
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${index}-content`}
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -16,
              }}
              transition={{
                duration: CONTENT_DURATION,
                ease: EASE,
              }}
              className="max-w-lg"
              aria-live={paused ? 'polite' : 'off'}
            >
              {/* ====================================
                  TAG
              ==================================== */}
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-white/30
                  bg-white/15
                  px-4
                  py-1.5
                  text-xs
                  font-semibold
                  text-white
                  backdrop-blur-md
                "
              >
                ✨ {slide.tag}
              </span>

              {/* ====================================
                  TITLE
              ==================================== */}
              <h1
                className="
                  mt-4
                  font-display
                  text-3xl
                  font-bold
                  leading-tight
                  text-white
                  drop-shadow-sm

                  sm:mt-5
                  sm:text-4xl

                  lg:text-5xl
                "
              >
                {slide.titleTop}
                <br />

                <span className="text-brand-pink-light">
                  {slide.titleAccent}
                </span>
              </h1>

             

              {/* ====================================
                  CTA
              ==================================== */}
              <Link
                href={slide.href}
                className="
                  group
                  relative
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  overflow-hidden
                  rounded-full
                  bg-white
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-brand-ink
                  shadow-soft
                  transition-transform
                  hover:scale-[1.03]

                  sm:mt-7
                "
              >
                <span
                  className="
                    absolute
                    inset-0
                    -z-10
                    bg-gradient-to-r
                    from-brand-pink-light
                    to-brand-teal-light
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />

                {slide.cta}

                <ChevronRight
                  size={16}
                  className="
                    transition-transform
                    group-hover:translate-x-0.5
                  "
                />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* ==========================================
              PROGRESS BARS
              VISUAL ONLY
              
              IMPORTANT:
              These DO NOT control autoplay.
              React setTimeout controls autoplay.
          ========================================== */}
          <div
            className="
              mt-7
              flex
              max-w-xs
              gap-2

              sm:mt-9
            "
          >
            {slides.map((s, i) => (
              <button
                key={s.tag}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className="
                  relative
                  h-1
                  flex-1
                  overflow-hidden
                  rounded-full
                  bg-white/25
                "
              >
                {i === index && (
                  <motion.span
                    key={`progress-${index}`}
                    className="
                      absolute
                      inset-0
                      origin-left
                      rounded-full
                      bg-white
                    "
                    initial={{
                      scaleX: 0,
                    }}
                    animate={{
                      scaleX: paused ? 0.5 : 1,
                    }}
                    transition={{
                      duration: paused
                        ? 0
                        : SLIDE_DURATION / 1000,
                      ease: 'linear',
                    }}
                  />
                )}

                {i < index && (
                  <span
                    className="
                      absolute
                      inset-0
                      rounded-full
                      bg-white
                    "
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ==========================================
            PREVIOUS BUTTON
        ========================================== */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="
            absolute
            left-4
            top-1/2
            z-10
            hidden
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-white/15
            text-white
            backdrop-blur-md
            transition
            hover:bg-white/25

            sm:flex
          "
        >
          <ChevronLeft size={18} />
        </button>

        {/* ==========================================
            NEXT BUTTON
        ========================================== */}
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="
            absolute
            right-4
            top-1/2
            z-10
            hidden
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-white/15
            text-white
            backdrop-blur-md
            transition
            hover:bg-white/25

            sm:flex
          "
        >
          <ChevronRight size={18} />
        </button>

        {/* ==========================================
            SLIDE COUNTER
        ========================================== */}
        <div
          className="
            absolute
            bottom-6
            right-6
            z-10
            flex
            items-center
            gap-2
            text-xs
            font-medium
            text-white/80

            sm:right-10
          "
        >
          <span>
            {String(index + 1).padStart(2, '0')}
          </span>

          <span className="h-px w-8 bg-white/40" />

          <span>
            {String(slides.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}
