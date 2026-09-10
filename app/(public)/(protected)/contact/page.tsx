"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle } from "lucide-react";

const infoCards = [
    { icon: Mail, title: "Email Us", lines: ["hello@kidsandmom.com", "support@kidsandmom.com"], color: "bg-pink-soft text-[#c2255c]" },
    { icon: Phone, title: "Call Us", lines: ["+1 (555) 012-4488", "Mon–Fri, 9am–6pm EST"], color: "bg-sky-soft text-[#0369a1]" },
    { icon: MapPin, title: "Visit Us", lines: ["128 Meadow Lane", "Portland, OR 97205"], color: "bg-lavender-soft text-[#7c3aed]" },
    { icon: Clock, title: "Support Hours", lines: ["Mon–Fri: 9am – 6pm", "Sat: 10am – 4pm"], color: "bg-mint-soft text-[#059669]" },
];

const topics = ["Order Support", "Product Question", "Returns & Exchanges", "Wholesale Inquiry", "Something Else"];


const Page = () => {
    const [submitted, setSubmitted] = useState(false);
    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-sky-soft via-[#f2fbff] to-mint-soft py-16 sm:py-20">
                <div className="pointer-events-none absolute left-[10%] top-8 h-14 w-14 rounded-2xl bg-yellow/50 animate-float-slow" />
                <div className="pointer-events-none absolute right-[8%] bottom-6 h-16 w-16 rounded-full bg-pink/40 animate-float-slower" />
                <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-heading font-semibold text-sky backdrop-blur">
                        <MessageCircle size={14} /> We&apos;d love to hear from you
                    </span>
                    <h1 className="mt-5 font-display text-4xl font-semibold text-ink sm:text-5xl">
                        Get in Touch
                    </h1>
                    <p className="mt-4 font-body text-ink-soft text-base sm:text-lg">
                        Questions about an order, a product, or just want to say hi? Our team of (real,
                        caffeinated) humans usually replies within one business day.
                    </p>
                </div>
            </section>

            {/* Info cards */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 sm:-mt-10 relative z-10">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {infoCards.map((c, i) => (
                        <motion.div
                            key={c.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.45, delay: i * 0.08 }}
                            whileHover={{ y: -4 }}
                            className="flex flex-col items-start gap-3 rounded-3xl bg-white p-6 shadow-[0_10px_30px_-12px_rgba(58,46,63,0.2)]"
                        >
                            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.color}`}>
                                <c.icon size={20} />
                            </span>
                            <h3 className="font-heading font-semibold text-ink">{c.title}</h3>
                            <div className="text-sm font-body text-ink-soft">
                                {c.lines.map((l) => (
                                    <p key={l}>{l}</p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Form + map */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5 }}
                        className="rounded-[2.5rem] bg-white p-8 shadow-[0_10px_40px_-15px_rgba(58,46,63,0.2)] sm:p-10"
                    >
                        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                            Send us a message
                        </h2>
                        <p className="mt-2 font-body text-sm text-ink-soft">
                            Fill out the form and we&apos;ll get back to you shortly.
                        </p>

                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 flex flex-col items-center gap-3 rounded-3xl bg-mint-soft/60 px-6 py-10 text-center"
                                >
                                    <CheckCircle2 className="text-[#059669]" size={40} />
                                    <h3 className="font-heading text-lg font-semibold text-ink">
                                        Message sent!
                                    </h3>
                                    <p className="text-sm font-body text-ink-soft max-w-xs">
                                        Thanks for reaching out — a member of our team will be in touch within one
                                        business day.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form key="form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setSubmitted(true);
                                    }}
                                    className="mt-8 space-y-5"
                                >
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-heading font-semibold text-ink-soft">
                                                Full Name
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Jane Appleseed"
                                                className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-heading font-semibold text-ink-soft">
                                                Email Address
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="jane@email.com"
                                                className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-heading font-semibold text-ink-soft">
                                            Order Number (optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="#KM-10234"
                                            className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-heading font-semibold text-ink-soft">
                                            Message
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="Tell us a bit more..."
                                            className="w-full resize-none rounded-2xl border border-border px-4 py-3 text-sm outline-none"
                                        />
                                    </div>

                                    <button type="submit" className="w-full sm:w-auto bg-brand-pink hover:bg-pink-soft text-white font-heading font-semibold rounded-2xl px-6 py-3 text-sm transition-colors flex items-center justify-center gap-2">
                                        <span className="flex items-center gap-2">
                                            <Send size={16} /> Send Message
                                        </span>
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex h-full flex-col gap-6"
                    >
                        {/* Map */}
                        <div className="min-h-full flex-1 overflow-hidden rounded-xl border border-ink/5 bg-white shadow-[0_10px_40px_-15px_rgba(58,46,63,0.15)]">
                            <iframe
                                title="Kids & Mom store location"
                                className="h-full min-h-[350px] w-full grayscale-[15%]"
                                loading="lazy"
                                src="https://www.google.com/maps?q=Portland,OR&output=embed"
                            />
                        </div>

                        {/* Live Chat */}
                        <div className="shrink-0 rounded-3xl bg-gradient-to-br from-pink to-lavender p-8 text-white">
                            <h3 className="font-display text-xl font-semibold">
                                Prefer live chat?
                            </h3>

                            <p className="mt-2 text-sm font-body leading-6 text-white/85">
                                Our support widget is available in the bottom-right corner of
                                every page during business hours — usually the fastest way to
                                reach us.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default Page