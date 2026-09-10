'use client';

import { Zap, ChevronRight } from 'lucide-react';
import Reveal, { StaggerContainer, StaggerItem } from './Reveal';
import ProductCard from './ProductCard';
import { useState, useEffect } from 'react';
import { ProductProps } from '@/types/product';
interface FlashSaleProps {
  products: ProductProps[];
}
// import useCountdown from './useCountdown';
function useCountdown(days = 2, hours = 15, minutes = 22, seconds = 18) {
    const initialMs =
        ((days * 24 + hours) * 60 + minutes) * 60 * 1000 + seconds * 1000;
    const [remaining, setRemaining] = useState(initialMs);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining((prev) => (prev > 1000 ? prev - 1000 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const totalSeconds = Math.floor(remaining / 1000);
    return {
        days: Math.floor(totalSeconds / (24 * 3600)),
        hours: Math.floor((totalSeconds % (24 * 3600)) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}

function TimeBox({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center rounded-xl bg-brand-teal px-3 py-2 text-white sm:px-4 sm:py-2.5">
            <span className="font-display text-lg font-bold leading-none sm:text-xl">
                {String(value).padStart(2, '0')}
            </span>
            <span className="mt-1 text-[9px] uppercase tracking-wide text-white/70 sm:text-[10px]">
                {label}
            </span>
        </div>
    );
}

export default function FlashSale({  products}: FlashSaleProps) {
    const { days, hours, minutes, seconds } = useCountdown(2, 15, 22, 18);

    return (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Reveal direction="scale">
                <div className="rounded-2xl bg-gradient-to-r from-brand-pink-light to-white p-5 shadow-card sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        {/* Left: title + timer */}
                        <div className="flex shrink-0 flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <h2 className="font-display text-xl font-bold text-brand-ink sm:text-2xl">
                                    Flash Sale
                                </h2>
                                <Zap size={20} className="text-brand-gold" fill="#F5A623" />
                            </div>
                            <p className="text-xs text-brand-muted sm:text-sm">
                                Hurry up! Limited time offer
                            </p>
                            <div className="flex items-center gap-2">
                                <TimeBox value={days} label="Days" />
                                <TimeBox value={hours} label="Hours" />
                                <TimeBox value={minutes} label="Mins" />
                                <TimeBox value={seconds} label="Secs" />
                            </div>
                            <button className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-xs font-semibold text-white shadow-soft transition hover:bg-brand-rose sm:text-sm">
                                Shop All Deals
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Right: product grid */}
                        <StaggerContainer className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                            {products.slice(0, 4).map((p, i) => (
                                <StaggerItem key={p.name}>
                                    <ProductCard product={p} index={i} />
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
