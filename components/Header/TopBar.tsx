
'use client';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Truck, Banknote, RefreshCcw, Headset } from 'lucide-react';

const items = [
    { icon: Truck, label: 'Free Shipping on orders over ৳1500' },
    { icon: Banknote, label: 'Cash on Delivery' },
    { icon: RefreshCcw, label: 'Easy Return' },
    { icon: Headset, label: 'Need Help? +880 1234 567890' },
];

export default function TopBar() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 25,
        restDelta: 0.001,
    });
    return (
        <>
            <motion.div style={{ scaleX }} className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-brand-pink" />
            <div className="hidden sm:block  w-full bg-brand-pink text-white text-[11px] sm:text-xs">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-x-auto no-scrollbar px-4 py-2 sm:justify-between sm:gap-10">
                    {items.map(({ icon: Icon, label }) => (
                        <span key={label} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                            <Icon size={13} className="opacity-90" />
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}
