"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Quote,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const milestones = [
  {
    year: "2016",
    title: "A little idea in a nursery",
    text: "Our founder, Sarah, couldn't find soft, safe, beautifully made basics for her newborn — so she started sewing her own.",
  },
  {
    year: "2018",
    title: "First store opens",
    text: "What began on a kitchen table grew into our very first shop, stocked with organic cotton essentials for babies.",
  },
  {
    year: "2021",
    title: "Growing the family",
    text: "We expanded into toys, feeding, and maternity wear, working with small ateliers who share our values.",
  },
  {
    year: "2024",
    title: "24,000+ families and counting",
    text: "Today, Kids & Mom ships across the country, but we still test every product the same way we did on day one — on our own kids.",
  },
];

const values = [
  {
    icon: Leaf,
    title: "Gentle by nature",
    text: "Organic, breathable fabrics and thoughtful materials chosen with sensitive skin in mind.",
  },
  {
    icon: ShieldCheck,
    title: "Safety first",
    text: "Every product is carefully selected and tested against strict child-safety standards.",
  },
  {
    icon: Heart,
    title: "Made with care",
    text: "We work with people who take pride in their craft and care about how every piece is made.",
  },
  {
    icon: Sparkles,
    title: "Joyful design",
    text: "Beautiful, practical pieces designed to make everyday family moments feel a little more special.",
  },
];

/* =========================================================
   ANIMATED COUNTER
========================================================= */

function AnimatedCounter({
  value,
  suffix = "",
  duration = 1800,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("about-stats");

      if (!element || started) return;

      const rect = element.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.85) {
        setStarted(true);
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;

      const progress = Math.min(
        (time - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [started, value, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  return (
    <main className="bg-[#faf9f6] text-[#252225]">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-black/5">
        <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2">

          {/* Content */}
          <div className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b46a7a]">
                Our Story
              </p>

              <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Beautiful things
                <br />
                for little lives.
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-[#777176] sm:text-lg">
                Kids & Mom began with one simple idea:
                children deserve products that are beautiful,
                comfortable, safe, and made with care.
              </p>

              <div className="mt-9 h-px w-14 bg-[#b46a7a]" />
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] min-h-[500px] lg:aspect-auto lg:h-[680px]"
          >
            <Image
              src="https://picsum.photos/seed/kidsmom-about/1000/1250"
              alt="Kids & Mom"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/[0.03]" />
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b46a7a]">
            Why We Exist
          </p>

          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Thoughtfully chosen.
            <br />
            Made for real life.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#777176] sm:text-base">
            From the first tiny outfit to the everyday essentials
            that make family life easier, we believe good design
            should never come at the cost of comfort or quality.
          </p>
        </motion.div>

      </section>

      {/* =====================================================
          FOUNDER
      ===================================================== */}

      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-6xl items-center lg:grid-cols-[360px_1fr]">

          <div className="relative aspect-square lg:aspect-[4/5]">
            <Image
              src="https://picsum.photos/seed/kmfounder/700/850"
              alt="Sarah, founder of Kids & Mom"
              fill
              sizes="(max-width: 1024px) 100vw, 360px"
              className="object-cover"
            />
          </div>

          <div className="px-7 py-14 sm:px-12 lg:px-20">

            <Quote
              size={30}
              strokeWidth={1}
              className="text-[#b46a7a]"
            />

            <blockquote className="mt-5 max-w-2xl font-display text-2xl font-medium leading-relaxed sm:text-3xl">
              “I wanted a store I could trust with my own
              children — where every label, every stitch,
              and every price felt honest.”
            </blockquote>

            <div className="mt-8">
              <p className="text-sm font-semibold">
                Sarah Whitfield
              </p>

              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#999399]">
                Founder & Mom of Three
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          JOURNEY
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">

        <div className="mb-14 max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b46a7a]">
            Our Journey
          </p>

          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            From one family
            <br />
            to thousands.
          </h2>
        </div>

        <div className="grid gap-0 border-t border-black/10 md:grid-cols-4">

          {milestones.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
              }}
              className="border-b border-black/10 py-8 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"
            >
              <p className="font-display text-2xl font-semibold text-[#b46a7a]">
                {item.year}
              </p>

              <h3 className="mt-4 text-sm font-semibold">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#777176]">
                {item.text}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="border-y border-black/5 bg-white">

        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b46a7a]">
              What We Believe
            </p>

            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              The details matter.
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">

            {values.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.07,
                  }}
                  className="bg-white p-7 sm:p-8"
                >
                  <Icon
                    size={23}
                    strokeWidth={1.4}
                    className="text-[#b46a7a]"
                  />

                  <h3 className="mt-6 text-sm font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#777176]">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}

          </div>
        </div>

      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section
        id="about-stats"
        className="bg-[#272326] text-white"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">

          <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4">

            {[
              {
                value: 24000,
                suffix: "+",
                label: "Happy Families",
              },
              {
                value: 1200,
                suffix: "+",
                label: "Products",
              },
              {
                value: 9,
                suffix: " yrs",
                label: "In Business",
              },
              {
                value: 98,
                suffix: "%",
                label: "Would Recommend",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center"
              >
                <p className="font-display text-3xl font-semibold sm:text-4xl">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                  />
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="px-6 py-24 text-center sm:py-32">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b46a7a]">
            Kids & Mom
          </p>

          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            For the little moments
            <br />
            that mean everything.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#777176]">
            Thank you for letting us be part of your family&apos;s
            story. We&apos;re just getting started.
          </p>

          <div className="mx-auto mt-8 h-px w-10 bg-[#b46a7a]" />
        </motion.div>

      </section>

    </main>
  );
}
