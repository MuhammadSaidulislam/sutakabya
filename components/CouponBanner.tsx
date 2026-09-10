'use client';

import { useState } from 'react';
import { Gift, Check, Copy } from 'lucide-react';
import Reveal from './Reveal';

export default function CouponBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('WELCOME300');
    } catch {
      /* clipboard may be unavailable, ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <Reveal direction="up">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-brand-teal-light px-5 py-6 shadow-card sm:flex-row sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-teal text-white">
              <Gift size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
                Special Coupon
              </p>
              <p className="font-display text-2xl font-bold text-brand-ink sm:text-3xl">
                Save <span className="text-brand-rose">৳300</span>
              </p>
              <p className="text-xs text-brand-muted">On your first order</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-dashed border-brand-teal/40 bg-white/60 px-5 py-3 sm:w-auto">
            <div>
              <p className="text-[10px] text-brand-muted">Use Code:</p>
              <p className="font-display text-base font-bold tracking-wider text-brand-ink">
                WELCOME300
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-1 sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-teal/90 sm:w-auto"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <p className="text-[10px] text-brand-muted">Valid till 31 Jul, 2026</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
