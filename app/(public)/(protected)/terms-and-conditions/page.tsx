"use client";

import { motion } from "framer-motion";
import { FileText, AlertCircle } from "lucide-react";

const terms = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or placing an order on kidsandmom.com, you agree to be bound by these Terms & Conditions, our Privacy Policy, and any additional guidelines posted on our site. If you do not agree, please do not use our site.",
  },
  {
    title: "Eligibility",
    body: "Our site and services are intended for use by individuals who are at least 18 years old, or the age of majority in their jurisdiction. By using our site, you confirm that you meet this requirement.",
  },
  {
    title: "Products & Pricing",
    body: "We make every effort to display accurate product descriptions, images, and pricing. However, errors may occasionally occur, and we reserve the right to correct any pricing or description errors, cancel orders, and issue refunds where necessary.",
  },
  {
    title: "Orders & Payment",
    body: "All orders are subject to acceptance and availability. Payment is due in full at the time of purchase. We accept major credit cards and other payment methods listed at checkout, processed securely by our payment partners.",
  },
  {
    title: "Shipping & Delivery",
    body: "Estimated delivery times are provided for convenience and are not guaranteed. Kids & Mom is not responsible for delays caused by shipping carriers, customs, or events outside our reasonable control.",
  },
  {
    title: "Returns & Refunds",
    body: "Unused items in original packaging may be returned within 30 days of delivery for a refund or exchange, except where noted as Final Sale. Please see our Returns page for full details and instructions.",
  },
  {
    title: "Intellectual Property",
    body: "All content on this site — including text, graphics, logos, and images — is the property of Kids & Mom or its licensors and is protected by applicable intellectual property laws. You may not reproduce or redistribute our content without written permission.",
  },
  {
    title: "User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Please notify us immediately of any unauthorized use.",
  },
  {
    title: "Limitation of Liability",
    body: "To the fullest extent permitted by law, Kids & Mom shall not be liable for any indirect, incidental, or consequential damages arising from your use of our site or products.",
  },
  {
    title: "Governing Law",
    body: "These Terms are governed by the laws of the State of Oregon, without regard to its conflict of law principles, and any disputes will be resolved in the courts located within that jurisdiction.",
  },
  {
    title: "Changes to These Terms",
    body: "We may revise these Terms from time to time. Continued use of our site after changes are posted constitutes your acceptance of the revised Terms.",
  },
];


const Page = () => {
  return (
    <div>
        <section className="bg-gradient-to-br from-peach/30 via-[#fff8f0] to-pink-soft py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-heading font-semibold text-[#c2410c] backdrop-blur">
              <FileText size={14} /> Legal
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Terms & Conditions
            </h1>
            <p className="mt-3 font-body text-sm text-ink-soft">
              Effective date: September 1, 2026
            </p>
            <p className="mt-4 font-body text-sm text-ink-soft leading-relaxed">
              Please read these Terms & Conditions carefully before using kidsandmom.com. They
              govern your access to and use of our site, products, and services.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16">
          <div className="space-y-5">
            {terms.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                className="flex gap-5 rounded-3xl bg-white p-6 shadow-[0_4px_20px_-10px_rgba(58,46,63,0.15)] sm:p-7"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft font-display text-sm font-semibold text-[#c2255c]">
                  {i + 1}
                </span>
                <div>
                  <h2 className="font-heading text-base font-semibold text-ink sm:text-lg">
                    {t.title}
                  </h2>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft sm:text-base">
                    {t.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-3xl bg-cream p-6">
            <AlertCircle className="mt-0.5 shrink-0 text-peach" size={20} />
            <p className="text-sm font-body text-ink-soft">
              Questions about these Terms? Reach out at{" "}
              <a href="mailto:legal@kidsandmom.com" className="text-pink underline">
                legal@kidsandmom.com
              </a>{" "}
              or visit our{" "}
              <a href="/contact" className="text-pink underline">
                Contact page
              </a>
              .
            </p>
          </div>
        </section>
    </div>
  )
}

export default Page