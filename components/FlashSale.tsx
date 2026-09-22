
'use client';

import { useEffect, useState } from 'react';
import { Flame, ArrowRight, Zap } from 'lucide-react';
import Reveal from './Reveal';
import Link from 'next/link'

const SALE_END_DATE = new Date('2026-09-30T23:59:59+06:00').getTime();

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const difference = SALE_END_DATE - Date.now();

      if (difference <= 0) {
        setExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),
        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),
        seconds: Math.floor(
          (difference / 1000) % 60
        ),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);


  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 rounded-3xl bg-brand-teal">
      <Reveal direction="up">
        <div className="relative overflow-hidden rounded-3xl px-5 py-6 shadow-card sm:px-8 sm:py-7">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-rose/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-brand-teal/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Sale information */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-pink text-white shadow-lg">
                <Flame size={27} fill="currentColor" />

                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand-pink">
                  <Zap size={11} fill="currentColor" />
                </span>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-md font-bold uppercase tracking-[0.2em] text-white">
                    Flash Sale
                  </span>

                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70">
                    Limited Time
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  Up to{' '}
                  <span className="text-brand-rose">50% OFF</span>
                </h2>

                <p className="mt-1 text-xs text-brand-ink sm:text-sm">
                  Grab your favorites before the sale disappears.
                </p>
              </div>
            </div>

            {/* Countdown */}
            {!expired ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <CountdownBox
                  value={timeLeft.days}
                  label="Days"
                  highlight
                />

                <span className="pb-5 text-xl font-bold text-white/30">
                  :
                </span>

                <CountdownBox
                  value={timeLeft.hours}
                  label="Hours"
                  highlight
                />

                <span className="pb-5 text-xl font-bold text-white/30">
                  :
                </span>

                <CountdownBox
                  value={timeLeft.minutes}
                  label="Min"
                  highlight
                />

                <span className="pb-5 text-xl font-bold text-white/30">
                  :
                </span>

                <CountdownBox
                  value={timeLeft.seconds}
                  label="Sec"
                  highlight
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-white/10 px-6 py-4 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-brand-rose">
                  Sale Ended
                </p>
              </div>
            )}

            {/* CTA */}
            {!expired && (
              <Link href="/collection?collection=flash-sale" type="button" className="group flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg sm:px-7">
                Shop All Deals
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {/* Bottom urgency line */}
          {!expired && (
            <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-brand-rose" />
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

function CountdownBox({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex min-w-[52px] flex-col items-center sm:min-w-[60px]">
      <div
        className={`flex h-12 w-full items-center justify-center rounded-xl border px-2 font-display text-xl font-bold sm:h-14 sm:text-2xl ${highlight
            ? 'border-brand-rose/50 bg-brand-rose text-white'
            : 'border-white/10 bg-white/10 text-white'
          }`}
      >
        {value.toString().padStart(2, '0')}
      </div>

      <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider text-white">
        {label}
      </span>
    </div>
  );
}