"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Tag,
  ShoppingBag,
  Truck,
  Settings,
  X,
  Heart,
  Users,
  Star,
  Ticket,
  Megaphone,
} from "lucide-react";
import { products } from "@/lib/data";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const lowStockCount = products.filter((p) => p.status !== "In Stock").length;

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-ink px-4 py-6 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-ink">
              <Heart size={18} strokeWidth={2.5} fill="currentColor" className="text-surface" />
            </span>
            <span className="font-display text-[17px] font-semibold leading-none text-cream">
              Mom<span className="text-blush">&</span>Child
            </span>
          </Link>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-md p-1 text-cream/70 hover:text-cream lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-8 px-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/40">
          Store management
        </p>

        <nav className="mt-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-0.5">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                  active
                    ? "bg-blush text-ink"
                    : "text-cream/70 hover:bg-white/5 hover:text-cream"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={2.25}
                  className={active ? "text-ink" : "text-cream/50 group-hover:text-cream"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
