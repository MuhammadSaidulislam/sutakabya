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
  { label: "Instagram", icon: InstagramIcon, href: "https://instagram.com" },
  { label: "Facebook", icon: FacebookIcon, href: "https://facebook.com" },
  { label: "Pinterest", icon: PinterestIcon, href: "https://pinterest.com" },
  { label: "YouTube", icon: YoutubeIcon, href: "https://youtube.com" },
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

function PinterestIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.5 2 3.7 5.9 3.7 9.1c0 1.9 1 4.3 2.7 5-.2-.9-.4-2.1.1-3 .4-.9 2.4-9 2.4-9-.5-.9-.5-2.1 0-2.9.7-1.1 2.5-1.1 2.5.5 0 1-.6 2.5-1 3.9-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.6-2.5 3.6-5.5 0-2.3-1.7-4-4.7-4-3.5 0-5.6 2.4-5.6 5 0 1 .3 1.6.7 2.1.2.2.2.3.1.6l-.3 1c-.1.3-.3.4-.6.3-1.4-.6-2-2.2-2-3.9 0-2.9 2.5-6.4 7.4-6.4 4 0 6.7 2.8 6.7 5.9 0 4-2.2 7-5.5 7-1.1 0-2.1-.6-2.4-1.2 0 0-.6 2.3-.7 2.8-.2 1-.6 1.9-1.1 2.7A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-2.6-.2-4-.6-4.9-.3-.7-.9-1.3-1.6-1.6C18.6 5 12 5 12 5s-6.6 0-7.8.5c-.7.3-1.3.9-1.6 1.6C2.2 8 2 9.4 2 12s.2 4 .6 4.9c.3.7.9 1.3 1.6 1.6C5.4 19 12 19 12 19s6.6 0 7.8-.5c.7-.3 1.3-.9 1.6-1.6.4-.9.6-2.3.6-4.9Z" />
      <path d="M10 9.3v5.4l4.8-2.7L10 9.3Z" fill="#f7f3ed" />
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
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.15fr] lg:gap-10">
          {/* BRAND / CONTACT */}
          <div>
            <Link href="/" className="inline-block">
                 <Image src="/logo-removebg-preview.png" alt="Logo" width={150} height={80} />
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-6 text-ink-500">
              A thoughtfully curated world of beautiful essentials for little
              ones and the people who love them.
            </p>

            <div className="mt-7 space-y-4">
              <a href="tel:+18001234567"  className="group flex items-center gap-3 text-sm text-ink-600 transition-colors hover:text-coral-500">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-100 bg-white transition-colors group-hover:border-coral-200">
                  <Phone size={14} />
                </span>
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.15em] text-ink-400">
                    Customer Care
                  </span>
                  <span className="font-medium">(+1) 800 123 4567</span>
                </span>
              </a>

              <div className="flex items-start gap-3 text-sm text-ink-500">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-100 bg-white">
                  <MapPin size={14} />
                </span>
                <p className="pt-1 leading-5">
                  1600 Pennsylvania Avenue NW,
                  <br />
                  Washington, DC 20500
                </p>
              </div>

              <a  href="mailto:hello@kidsandmom.com"   className="flex items-center gap-3 text-sm text-ink-500 transition-colors hover:text-coral-500">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-100 bg-white">
                  <Mail size={14} />
                </span>
                hello@kidsandmom.com
              </a>
            </div>
          </div>

          <FooterColumn title="Information" links={infoLinks} />
          <FooterColumn title="Categories"   links={categories.map((category) => ({
    label: category.name,
    href: `/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`,
  }))} />
          <FooterColumn title="Help & FAQs" links={helpLinks} />

          {/* SOCIAL */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-900">
              Follow Along
            </h3>

            <div className="mt-3 h-px w-7 bg-coral-500" />

            <p className="mt-6 text-sm leading-6 text-ink-500">
              Come say hello. Discover new collections, little moments,
              styling inspiration, and family stories.
            </p>

            <div className="mt-6 flex gap-2.5">
              {socials.map(({ label, icon: Icon, href }) => (
                <a  key={label}  href={href}  target="_blank" rel="noreferrer"   aria-label={label}   className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-coral-500 hover:bg-coral-500 hover:text-white">
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
            © 2026 Kids & Mom. All rights reserved.
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