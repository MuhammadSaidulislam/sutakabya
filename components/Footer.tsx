"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowRight,
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import { motion } from "framer-motion";
import type { Category } from "@/types/categories";
import Image from "next/image";
/* -------------------------------------------------------------------- */
/*  Static content                                                       */
/* -------------------------------------------------------------------- */

const infoLinks = [
  { label: "Our Story", href: "/about" },
  { label: "F.A.Q.'s", href: "/faq" },
  { label: "Order Tracking", href: "/account/orders" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Playdate Events", href: "/events" },
];

const serviceLinks = [
  { label: "Shipping Info", href: "/shipping" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "Your Account", href: "/account" },
  { label: "Terms & Conditions", href: "/terms" },
];

const helpLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
   { label: "Terms and Conditions", href: "/terms-and-conditions" },
];

const socials = [
  { label: "Facebook", icon: FacebookIcon, href: "https://www.facebook.com/sutakabya" },
  { label: "YouTube", icon: YoutubeIcon, href: "https://www.youtube.com/@sutakabya" },
  { label: "TikTok", icon: TikTokIcon, href: "https://www.tiktok.com/@sutakabya" },
];


const paymentMethods = ["VISA", "MASTERCARD", "AMEX", "PAYPAL"];
const trustBadges = ["SSL Secure", "PCI Compliant", "Safe Checkout"];

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumnProps = {
  title: string;
  links: FooterLink[];
};

interface FooterProps {
  categories: Category[];
}

/* -------------------------------------------------------------------- */
/*  Inline brand icons — kept local so the footer has no missing glyphs  */
/* -------------------------------------------------------------------- */

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.35C16.19 4.31 15.14 4.2 13.9 4.2c-2.5 0-4.2 1.53-4.2 4.33V10.5H7.2v3h2.5V21h3.8z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.6 7.2a5.8 5.8 0 0 1-3.5-1.2v7.1a5.1 5.1 0 1 1-4.4-5v2.8a2.3 2.3 0 1 0 1.6 2.2V2h2.8c.2 1.8 1.3 3.2 3.5 3.7v1.5Z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.122C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.376.564A3.016 3.016 0 0 0 .502 6.186C0 8.057 0 12 0 12s0 3.943.502 5.814a3.016 3.016 0 0 0 2.122 2.122C4.495 20.5 12 20.5 12 20.5s7.505 0 9.376-.564a3.016 3.016 0 0 0 2.122-2.122C24 15.943 24 12 24 12s0-3.943-.502-5.814Z"
      />

      <path
        d="M9.545 15.568V8.432L15.818 12l-6.273 3.568Z"
        fill="#1C1C1B"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------- */
/*  Footer column                                                        */
/* -------------------------------------------------------------------- */

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-900">
        {title}
      </h3>

      <div className="mt-3 h-px w-7 bg-coral-500" />

      <ul className="mt-6 space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group inline-flex items-center text-[13px] text-ink-500 transition-colors duration-200 hover:text-coral-500"
            >
              <span>{link.label}</span>
              <ArrowRight
                size={12}
                className="ml-1.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Footer                                                                */
/* -------------------------------------------------------------------- */

export default function Footer({ categories }: FooterProps) {
  const [showTop, setShowTop] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-brand-pink text-white">
      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.15fr] lg:gap-6">
          {/* BRAND / CONTACT */}
          <div>
            <Link href="/" className="inline-block">
                 <Image src="/logo-footer.png" alt="Logo" width={150} height={80} />
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-6 text-ink-500">
              A thoughtfully curated world of beautiful essentials for little
              ones and the people who love them.
            </p>

         
          </div>

          <FooterColumn title="Information" links={infoLinks} />
          <FooterColumn title="Categories"   links={categories.map((category) => ({  label: category.name,  href: `/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`, }))} />
          <FooterColumn title="Help & FAQs" links={helpLinks} />

          {/* SOCIAL */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-900">
              Follow Along
            </h3>

            <div className="mt-3 h-px w-7 bg-coral-500" />

               <div className="mt-7 space-y-4">
              <a href="tel:+8801929420564"  className="group flex items-center gap-3 text-sm text-ink-600 transition-colors hover:text-coral-500">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-100 transition-colors group-hover:border-coral-200">
                  <Phone size={14} />
                </span>
                <span>
                  <span className="font-medium">01929420564</span>
                </span>
              </a>

              <div className="flex items-start gap-3 text-sm text-ink-500">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-100">
                  <MapPin size={14} />
                </span>
                <p className="pt-1 leading-5">
                ৮১(আন্ডারগ্রাউন্ড), বিক্রমপুর প্লাজা শপিংমল, জুরাইন,ঢাকা
                </p>
              </div>

              <a  href="mailto:sutakabya@gmail.com"  className="flex items-center gap-3 text-sm text-ink-500 transition-colors hover:text-coral-500">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-100">
                  <Mail size={14} />
                </span>
               sutakabya@gmail.com
              </a>
            </div>

            <div className="mt-6 flex gap-2.5">
              {socials.map(({ label, icon: Icon, href }) => (
                <a  key={label}  href={href}  target="_blank" rel="noreferrer"   aria-label={label}   className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200  text-ink-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-coral-500 hover:bg-coral-500 hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          COPYRIGHT
      ===================================================== */}
      <div className="border-t border-white/10 bg-ink-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] uppercase tracking-[0.12em] text-cream-200/60">
            © 2026 Sutakabya. All rights reserved.
          </p>
          <p className="text-[10px] text-cream-200/40">
            Crafted with care for growing families.
          </p>
        </div>
      </div>

      {/* =====================================================
          BACK TO TOP
      ===================================================== */}
      <motion.button
        initial={false}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 12 }}
        transition={{ duration: 0.2 }}
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-pink text-white shadow-lg transition-colors hover:bg-coral-500 ${
          showTop ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <ArrowUp size={17} />
      </motion.button>
    </footer>
  );
}