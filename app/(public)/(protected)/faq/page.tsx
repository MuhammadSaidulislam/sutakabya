"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Package, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";

const faqData = [
  {
    category: "Orders & Shipping",
    icon: Package,
    color: "bg-pink-soft text-[#c2255c]",
    items: [
      { q: "How long does shipping take?", a: "Standard orders arrive within 3–5 business days. Express shipping (1–2 business days) is available at checkout for an additional fee." },
      { q: "Do you ship internationally?", a: "Currently we ship within the US and Canada. We're working on expanding to more countries — sign up for our newsletter to be the first to know." },
      { q: "Can I change or cancel my order?", a: "You can modify or cancel your order within 1 hour of placing it by contacting our support team. After that, orders move quickly into fulfillment and can't be changed." },
      { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking link by email. You can also view live status from the 'Order Tracking' page in your account." },
    ],
  },
  {
    category: "Returns & Exchanges",
    icon: RotateCcw,
    color: "bg-sky-soft text-[#0369a1]",
    items: [
      { q: "What is your return policy?", a: "We offer 30-day free returns on unused items in original packaging. Simply start a return from your Orders page and we'll email you a prepaid shipping label." },
      { q: "Can I exchange for a different size?", a: "Yes — select 'Exchange' instead of 'Return' when starting the process, and we'll ship your new size as soon as we receive the original item." },
      { q: "Are sale items returnable?", a: "Sale items marked 'Final Sale' cannot be returned or exchanged. All other discounted items follow our standard 30-day policy." },
      { q: "When will I get my refund?", a: "Refunds are processed within 3–5 business days of us receiving your return, and typically appear on your statement within 5–10 business days." },
    ],
  },
  {
    category: "Product & Safety",
    icon: ShieldCheck,
    color: "bg-mint-soft text-[#059669]",
    items: [
      { q: "Are your products tested for safety?", a: "Every product is independently lab-tested to meet or exceed relevant child-safety standards before it's listed on our site." },
      { q: "What materials do you use?", a: "Most of our clothing and textiles use GOTS-certified organic cotton. Toy materials are BPA-free, phthalate-free, and non-toxic — details are listed on each product page." },
      { q: "How do I find the right size?", a: "Each product page includes a size guide with measurements by age and weight. When in doubt, we recommend sizing up for growing babies." },
      { q: "How should I care for organic cotton items?", a: "Machine wash cold with like colors and tumble dry low. Avoid fabric softener, which can reduce the fabric's natural breathability over time." },
    ],
  },
  {
    category: "Payments & Account",
    icon: CreditCard,
    color: "bg-lavender-soft text-[#7c3aed]",
    items: [
      { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and Apple Pay. Buy-now-pay-later options are available at checkout in eligible regions." },
      { q: "Is my payment information secure?", a: "Yes — all transactions are encrypted and processed through PCI-compliant payment providers. We never store your full card details on our servers." },
      { q: "How do I apply a discount code?", a: "Enter your code in the 'Coupon' field during checkout, before you enter payment details, and the discount will apply automatically." },
      { q: "How do reward points work?", a: "You earn 1 point for every $1 spent. Points can be redeemed for discounts starting at 200 points, visible anytime from your account dashboard." },
    ],
  },
];


const Page = () => {
    const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("Orders & Shipping-0");

  const filtered = useMemo(() => {
    if (!query.trim()) return faqData;
    const q = query.toLowerCase();
    return faqData
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query]);
  return (
    <div>
         {/* Hero + search */}
        <section className="relative overflow-hidden bg-gradient-to-br from-yellow/30 via-[#fffaf0] to-pink-soft py-16 sm:py-20">
          <div className="pointer-events-none absolute left-[8%] top-10 h-14 w-14 rounded-2xl bg-mint/50 animate-float-slow" />
          <div className="pointer-events-none absolute right-[10%] bottom-8 h-16 w-16 rounded-full bg-sky/40 animate-float-slower" />
          <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-heading font-semibold text-[#b45309] backdrop-blur">
              <HelpCircle size={14} /> Frequently Asked Questions
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold text-ink sm:text-5xl">
              How can we help?
            </h1>
            <p className="mt-4 font-body text-ink-soft text-base sm:text-lg">
              Find quick answers about orders, shipping, returns, and more.
            </p>

            <div className="relative mt-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-soft" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search questions..."
                className="w-full rounded-md bg-white py-4 pl-14 pr-5 text-sm shadow-lg outline-none placeholder:text-ink-soft/60 "
              />
            </div>
          </div>
        </section>

        {/* FAQ list */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 bg-white">
          {filtered.length === 0 && (
            <p className="text-center font-body text-ink-soft">
              No results for &ldquo;{query}&rdquo; — try a different search term, or{" "}
              <a href="/contact" className="text-pink underline">
                contact our team
              </a>
              .
            </p>
          )}

          <div className="space-y-12">
            {filtered.map((cat) => (
              <div key={cat.category}>
                <div className="mb-4 flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${cat.color}`}>
                    <cat.icon size={18} />
                  </span>
                  <h2 className="font-heading text-lg font-semibold text-ink">{cat.category}</h2>
                </div>

                <div className="space-y-3">
                  {cat.items.map((item, i) => {
                    const id = `${cat.category}-${i}`;
                    const isOpen = openId === id;
                    return (
                      <div
                        key={id}
                        className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_-8px_rgba(58,46,63,0.15)]"
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : id)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                        >
                          <span className="font-heading text-sm font-semibold text-ink">
                            {item.q}
                          </span>
                          <motion.span
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="shrink-0 text-ink-soft"
                          >
                            <ChevronDown size={18} />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <p className="px-5 pb-5 text-sm font-body text-ink-soft leading-relaxed">
                                {item.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-gradient-to-br from-sky-soft to-mint-soft p-8 text-center">
            <h3 className="font-display text-xl font-semibold text-ink">
              Still have questions?
            </h3>
            <p className="mt-2 font-body text-sm text-ink-soft">
              Our support team is happy to help with anything not covered here.
            </p>
            <a
              href="/contact"
              className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-heading font-semibold text-white hover:bg-pink transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
    </div>
  )
}

export default Page