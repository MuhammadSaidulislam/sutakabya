import { Truck, Banknote, RefreshCcw, BadgeCheck, ShieldCheck } from 'lucide-react';
import Reveal from './Reveal';

const features = [
  { icon: Truck, title: 'Free Shipping', sub: 'On orders over ৳1500' },
  { icon: Banknote, title: 'Cash on Delivery', sub: 'Pay when you receive' },
  { icon: RefreshCcw, title: 'Easy Return', sub: 'Within 7 days' },
  { icon: BadgeCheck, title: 'Premium Quality', sub: '100% original products' },
  { icon: ShieldCheck, title: 'Secure Payment', sub: '100% safe & secure' },
];

export default function Features() {
  return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 shadow-card sm:grid-cols-3 sm:gap-6 sm:p-6 md:grid-cols-5">
          {features.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-pink-light text-brand-pink">
                <Icon size={20} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-brand-ink">{title}</p>
                <p className="text-xs text-brand-muted">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
