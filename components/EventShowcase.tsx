import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Reveal from './Reveal';

export default function EventShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <Reveal direction="scale">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FDECC8] to-[#FCE0C4] shadow-card">
          <div className="grid grid-cols-1 items-center gap-4 px-6 py-10 sm:px-10 md:grid-cols-3 md:py-14">
            <div className="relative order-2 mx-auto aspect-square w-40 overflow-hidden rounded-2xl sm:w-48 md:order-1">
              <Image
                src="https://picsum.photos/seed/promo-boy/300/300"
                alt="Boy in striped shirt with sunglasses"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="order-1 text-center md:order-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-rose">
                Limited Time Offer
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-rose sm:text-4xl">
                Buy 2 Get 1 Free
              </h2>
              <p className="mt-2 text-sm text-brand-ink/80">On kids &amp; mom fashion</p>
              <button className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-pink px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-rose">
                Shop Now
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="relative order-3 mx-auto aspect-square w-40 overflow-hidden rounded-2xl sm:w-48">
              <Image
                src="https://picsum.photos/seed/promo-girl/300/300"
                alt="Girl with shopping bag"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
