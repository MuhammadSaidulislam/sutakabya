"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail } from "lucide-react";


const sections = [
  {
    id: "collect",
    title: "1. Information We Collect",
    body: [
      "When you create an account, place an order, or contact our support team, we collect information such as your name, email address, shipping and billing address, phone number, and payment details.",
      "We also automatically collect certain technical information when you browse our site, including your IP address, device and browser type, pages viewed, and referring URLs, through cookies and similar technologies.",
    ],
  },
  {
    id: "use",
    title: "2. How We Use Your Information",
    body: [
      "We use the information we collect to process and fulfill your orders, provide customer support, send order and shipping updates, and personalize your shopping experience.",
      "With your permission, we may also use your email address to send product recommendations, promotions, and newsletters. You can unsubscribe from marketing emails at any time using the link at the bottom of any message.",
    ],
  },
  {
    id: "sharing",
    title: "3. How We Share Information",
    body: [
      "We share information with trusted third-party service providers who help us operate our business — including payment processors, shipping carriers, and email marketing platforms — solely for the purpose of performing services on our behalf.",
      "We do not sell your personal information to third parties. We may disclose information if required to do so by law or in response to a valid legal request.",
    ],
  },
  {
    id: "cookies",
    title: "4. Cookies & Tracking Technologies",
    body: [
      "Our site uses cookies to remember your cart, preferences, and login status, and to understand how visitors use our site so we can improve it.",
      "You can control cookies through your browser settings; disabling cookies may limit some features of our site, such as remembering items in your cart.",
    ],
  },
  {
    id: "security",
    title: "5. Data Security",
    body: [
      "We use industry-standard safeguards, including encryption during checkout, to protect your personal information. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "children",
    title: "6. Children's Privacy",
    body: [
      "While our products are made for babies and children, our website and services are intended for use by adults. We do not knowingly collect personal information directly from children under 13.",
      "If you believe a child has provided us with personal information without a parent or guardian's consent, please contact us so we can promptly remove it.",
    ],
  },
  {
    id: "rights",
    title: "7. Your Rights & Choices",
    body: [
      "Depending on where you live, you may have the right to access, correct, delete, or receive a copy of the personal information we hold about you, or to object to certain uses of it.",
      "To exercise any of these rights, please reach out using the contact details below and we will respond within a reasonable timeframe.",
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We'll post the updated version here with a new effective date.",
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    body: [
      "If you have questions about this Privacy Policy or how we handle your information, please reach out to us at privacy@kidsandmom.com or through our Contact page.",
    ],
  },
];


const Page = () => {
      const [active, setActive] = useState(sections[0].id);
  return (
    <div>
          <section className=" py-14 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full  px-4 py-1.5 text-xs font-heading font-semibold text-lavender backdrop-blur">
              <ShieldCheck size={14} /> Your Privacy Matters
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 font-body text-sm text-ink-soft">
              Last updated: September 1, 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16 bg-white">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-3xl bg-white p-5 shadow-[0_4px_20px_-10px_rgba(58,46,63,0.15)]">
                <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  On this page
                </p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setActive(s.id)}
                      className={`block rounded-xl px-3 py-2 text-sm font-body transition-colors ${
                        active === s.id
                          ? "bg-pink-soft/50 text-pink font-semibold"
                          : "text-ink-soft hover:bg-cream"
                      }`}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="space-y-10">
              <p className="font-body text-ink-soft leading-relaxed">
                Kids & Mom (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects
                your privacy and is committed to protecting the personal information you share
                with us. This Privacy Policy explains what information we collect, how we use
                it, and the choices you have.
              </p>

              {sections.map((s, i) => (
                <motion.div
                  key={s.id}
                  id={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                  className="scroll-mt-28"
                >
                  <h2 className="font-heading text-lg font-semibold text-ink sm:text-xl">
                    {s.title}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {s.body.map((p, idx) => (
                      <p key={idx} className="font-body text-sm leading-relaxed text-ink-soft sm:text-base">
                        {p}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              <div className="flex items-start gap-3 rounded-3xl bg-cream p-6">
                <Mail className="mt-0.5 shrink-0 text-pink" size={20} />
                <p className="text-sm font-body text-ink-soft">
                  Questions about this policy? Email us at{" "}
                  <a href="mailto:privacy@kidsandmom.com" className="text-pink underline">
                    privacy@kidsandmom.com
                  </a>{" "}
                  or visit our{" "}
                  <a href="/contact" className="text-pink underline">
                    Contact page
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
  )
}

export default Page