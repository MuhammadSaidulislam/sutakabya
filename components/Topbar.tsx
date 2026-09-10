"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  PackageX,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

type Notification = {
  id: string;
  icon: typeof Bell;
  tone: "blush" | "sage" | "honey" | "sky";
  title: string;
  description: string;
  time: string;
};

const notifications: Notification[] = [
  {
    id: "N-1",
    icon: ShoppingBag,
    tone: "blush",
    title: "New order placed",
    description: "#ORD-8291 from Amina Rahman • $64.48",
    time: "12m ago",
  },
  {
    id: "N-2",
    icon: PackageX,
    tone: "honey",
    title: "Low stock alert",
    description: "Plush Elephant Rattle Toy has 5 units left",
    time: "1h ago",
  },
  {
    id: "N-3",
    icon: Star,
    tone: "sky",
    title: "New review pending",
    description: "Smart Video Baby Monitor received a 2-star review",
    time: "3h ago",
  },
  {
    id: "N-4",
    icon: Truck,
    tone: "sage",
    title: "Delivery delayed",
    description: "#ORD-8289 to Fatima Islam — new ETA Jul 14",
    time: "5h ago",
  },
];

const tones: Record<Notification["tone"], string> = {
  blush: "bg-blush/20 text-blush-deep",
  sage: "bg-sage/20 text-sage-deep",
  honey: "bg-honey/20 text-honey-deep",
  sky: "bg-sky/20 text-sky-deep",
};

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(true);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click-outside handling lives on document, not on a full-screen overlay button.
  // An overlay would sit on top of the *other* trigger button and swallow the
  // click before it ever reaches it, so switching directly from one dropdown
  // to the other would silently fail.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <header className="sticky top-0 z-30 flex items-center justify-end gap-3 border-b border-border bg-[#162027] px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
      <button
        aria-label="Open menu"
        onClick={onMenuClick}
        className="mr-auto rounded-lg border border-border bg-surface p-2 text-ink-soft lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-3">
        <div ref={notifRef} className="relative">
          <button
            aria-label="Notifications"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative rounded-full border border-border bg-surface p-2.5 text-ink-soft hover:text-ink"
          >
            <Bell size={17} />
            {unread && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blush-deep" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-[min(22rem,88vw)] rounded-2xl border border-border bg-surface p-1.5 shadow-lg">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-[13px] font-semibold text-ink">Notifications</p>
                <button
                  onClick={() => setUnread(false)}
                  className="text-[12px] font-semibold text-blush-deep hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="my-1 border-t border-border" />
              <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-cream-deep"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[n.tone]}`}
                      >
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">{n.title}</p>
                        <p className="truncate text-[12px] text-ink-soft">{n.description}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-soft/70">{n.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-2.5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage text-[12px] font-semibold text-surface">
              RA
            </span>
            <span className="hidden text-[13px] font-medium text-ink sm:inline">Rima Akter</span>
            <ChevronDown size={14} className="hidden text-ink-soft sm:inline" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-border bg-surface p-1.5 shadow-lg">
              <div className="px-3 py-2">
                <p className="text-[13px] font-medium text-ink">Rima Akter</p>
                <p className="text-[12px] text-ink-soft">admin@momandchild.com</p>
              </div>
              <div className="my-1 border-t border-border" />
              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink hover:bg-cream-deep"
              >
                <Settings size={15} className="text-ink-soft" />
                Store settings
              </Link>
              <button
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-cream-deep"
                onClick={() => setProfileOpen(false)}
              >
                <User size={15} className="text-ink-soft" />
                My profile
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center curosr-pointer gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-rose-danger hover:bg-rose-danger/10"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}