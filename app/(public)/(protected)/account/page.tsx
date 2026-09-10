'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, Package, Heart, MapPin, User as UserIcon, LogOut, ShoppingBag, Star } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Badge } from '@/components/Badge'
import { formatPrice } from '@/lib/formatPrice'
import { Order, OrderDetails } from '@/types/order'
import { useRouter } from "next/navigation";
import OrdersTable from '@/components/OrdersTable'
import { User } from '@/types/user'
import CustomerAccount from '@/components/CustomerAccount'
import OrderInvoice from '@/components/OrderInvoice'
import CustomerAddress from '@/components/CustomerAddress'
import AddReview from '@/components/AddReview'


type Tab = 'dashboard' | 'orders' | 'review' | 'address' | 'wishlist' | 'account'

const NAV_ITEMS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'review', label: 'My reviews', icon: Star },
  { id: 'address', label: 'Address Book', icon: MapPin },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart },
  { id: 'account', label: 'Account Details', icon: UserIcon },
]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const router = useRouter();
  const wishedProducts = useStore((s) => s.wishlist)
  const wishlist = useStore((s) => s.wishlist)
  const toggleWishlist = useStore((s) => s.toggleWishlist)

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status !== "All") {
          params.set("status", status);
        }

        const res = await fetch(`/api/user/order?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, limit, search, status]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);

        const res = await fetch("/api/user/profile");

        // Guest user → API returned no content
        if (res.status === 204) {
          return;
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
          return;
        }
        setProfile(data.data);
      } catch (error) {
        console.error("Profile loading error:", error);

        // toast({
        //   type: "error",
        //   message: "Failed to load profile.",
        //   position: "top-right",
        // });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/user/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  // Order pdf download
  const handleViewOrder = async (orderId: number) => {
    try {
      setOrderLoading(true);
      setOrderModalOpen(true);

      const res = await fetch(`/api/admin/order/${orderId}`);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch order");
      }

      setSelectedOrder(result.data);
    } catch (error) {
      console.error("Get order error:", error);
      setSelectedOrder(null);
    } finally {
      setOrderLoading(false);
    }
  };


  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 lg:gap-8">
        {/* ---------- Sidebar ---------- */}
        <aside className="md:sticky md:top-24 h-fit">
          <div className="border border-border shadow-cream-deep rounded-2xl p-6 bg-white ">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full ring-2 ring-coral-400 ring-offset-2 overflow-hidden bg-coral-100 flex items-center justify-center">
                <UserIcon size={32} className="text-coral-400" />
              </div>
              <h1 className="font-serif text-xl text-ink-900 mt-4">{profile?.name}</h1>
              {profile?.phone && <p className="text-xs text-ink-400">{profile?.phone}</p>}
              {profile?.email && <p className="text-xs text-ink-400">{profile?.email}</p>}
              {/* <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-coral-500">
                <span className="w-3 h-px bg-coral-500" />
                Elite Member
              </span> */}
            </div>

            <div className="h-px bg-ink-100 my-6" />

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setOrderModalOpen(false) }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${active
                      ? 'bg-cream text-brand-pink'
                      : 'text-cream-600 hover:bg-cream-100'
                      }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <div className="h-px bg-ink-100 my-4" />

            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full text-left">
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </aside>

        {/* ---------- Main content ---------- */}
        <main>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<ShoppingBag size={20} className="text-coral-500" />}
              value={orders.length}
              label="Total Orders"
            />
            <StatCard
              icon={<Heart size={20} className="text-coral-500" />}
              value={wishedProducts.length}
              label="In Wishlist"
            />
            {/* <StatCard
                  icon={<Wallet size={20} className="text-coral-500" />}
                  value={formatPrice(totalSpent)}
                  label="Total Spent"
                /> */}
          </div>

          {/* Recent orders */}
          {activeTab === 'dashboard' && <>
            {!orderModalOpen && <div className="border border-border shadow-cream-deep rounded-2xl p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-lg text-ink-900">Order History</h2>
              </div>
              <OrdersTable search={search} status={status} setSearch={setSearch} setStatus={setStatus} pagination={pagination} page={page} setPage={setPage} limit={limit} orders={orders} handleViewOrder={handleViewOrder} />
            </div>}
            {orderModalOpen && <div className="border border-border shadow-cream-deep rounded-2xl p-5 sm:p-6 bg-white">
              <OrderInvoice key={selectedOrder?.order.id ?? "none"} selectedOrder={selectedOrder} onClose={() => { setSelectedOrder(null); setOrderModalOpen(false); }} />
            </div>}
          </>}

          {activeTab === 'orders' &&
            <>
              {!orderModalOpen && <div className="border border-border shadow-cream-deep rounded-2xl p-5 sm:p-6 bg-white">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-lg text-ink-900">Order History</h2>
                </div>
                <OrdersTable search={search} status={status} setSearch={setSearch} setStatus={setStatus} pagination={pagination} page={page} setPage={setPage} limit={limit} orders={orders} handleViewOrder={handleViewOrder} />
              </div>}
              {orderModalOpen && <div className="border border-border shadow-cream-deep rounded-2xl p-5 sm:p-6 bg-white">
                <OrderInvoice key={selectedOrder?.order.id ?? "none"} selectedOrder={selectedOrder} onClose={() => { setSelectedOrder(null); setOrderModalOpen(false); }} />
              </div>}
            </>
          }

          {activeTab === 'review' && <AddReview />}

          {activeTab === 'wishlist' && (
            <div className="rounded-2xl border border-ink-100 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)]">

              {/* Header */}
              <div className="flex items-end justify-between border-b border-[#EDE5DD] px-5 py-5 sm:px-7">
                <div>
                  <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.25em] text-coral-400">
                    Your Collection
                  </p>

                  <h2 className="font-serif text-xl text-ink-900">
                    My Wishlist
                  </h2>
                </div>

                {wishedProducts.length > 0 && (
                  <span className="text-xs text-ink-400">
                    {wishedProducts.length}{' '}
                    {wishedProducts.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              {/* Empty Wishlist */}
              {wishedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                  <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-cream-50">
                    <div className="absolute inset-2 rounded-full border border-brand-gold/30" />

                    <svg
                      className="h-7 w-7 text-coral-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path
                        d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0112 6.3a4.7 4.7 0 018.8 2.4Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="font-serif text-xl text-ink-900">
                    Your collection is waiting
                  </p>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-ink-400">
                    Save pieces you love and keep them close for your next purchase.
                  </p>

                  <Link href="/shop" className="mt-6 inline-flex items-center gap-2   rounded-full  bg-ink-900  px-6 py-3    text-[10px] font-semibold  uppercase tracking-[0.18em]  text-white transition-all duration-300 hover:bg-coral-500">
                    Explore Collection
                    <span>→</span>
                  </Link>
                </div>
              ) : (

                /* Wishlist Products */
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 p-5 sm:grid-cols-3 sm:gap-x-5 sm:p-7 lg:grid-cols-4">

                  {wishedProducts.map((p) => (
                    <div key={p.id} className="group relative bg-cream-200">

                      {/* Image */}

                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-100">

                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                        />

                        {/* Image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t  from-black/20  via-transparent  to-transparent opacity-0  transition-opacity duration-300  group-hover:opacity-100"
                        />

                        {/* Wishlist button */}
                        <button type="button" className={`absolute top-3 right-3 rounded-full p-2 transition-all duration-300 bg-red-soft text-white`}
                          aria-label="Remove from wishlist"
                          onClick={() => toggleWishlist({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image: p.image,
                            color: "",
                            size: "",
                            qty: 1,
                          })}
                        >
                          <Heart size={16} className="fill-current" />
                        </button>
                      </div>


                      {/* Product Info */}
                      <div className="mt-3">

                        <Link href={`/product/${p.id}`}>
                          <p className="line-clamp-1 text-sm font-medium text-ink-800 transition-colors group-hover:text-coral-500">
                            {p.name}
                          </p>
                        </Link>

                        <p className="mt-1 font-serif text-sm text-ink-900">
                          {formatPrice(p.price)}
                        </p>

                        {/* Add to cart */}
                        <button type="button" className="mt-2 w-full rounded-full bg-brand-pink py-2 text-xs font-semibold text-white transition hover:bg-brand-rose sm:text-sm">
                          Add to Bag
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'address' && <CustomerAddress />}

          {activeTab === 'account' && profile && <CustomerAccount profile={profile} />}
        </main>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl  border  border-border shadow-cream-deep  px-5 py-6  shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300  hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      {/* Decorative corner */}
      <div
        className="
          absolute -right-8 -top-8
          h-20 w-20
          rounded-full
          bg-cream-100
          transition-transform duration-500
          group-hover:scale-150
        "
      />

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div
          className="
            flex h-12 w-12 shrink-0
            items-center justify-center
            rounded-full
            bg-brand-pink
            text-white
            transition-all duration-300
            group-hover:border-coral-200
            group-hover:bg-coral-50
          "
        >
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p className="font-serif text-2xl leading-none tracking-tight text-ink-900">
            {value}
          </p>

          <p
            className="
              mt-2
              text-[10px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-ink-400
            "
          >
            {label}
          </p>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="
          absolute bottom-0 left-5 right-5
          h-px
          bg-ink-100
          transition-all duration-300
          group-hover:bg-coral-300
        "
      />
    </div>
  );
}

