"use client";

import { Suspense, useCallback, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Phone, Mail, MapPin, Eye, Ticket } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusPill from "@/components/StatusPill";
import ProductThumb from "@/components/ProductThumb";
import { customers, Customer, getCustomerStats } from "@/lib/data";
import { TablePage } from "@/components/TablePage";
import { User } from "@/types/user";
import { format } from "date-fns";
import { Badge } from "@/components/Badge";
import { CouponForm } from "@/types/coupon";

const avatarTones: Record<string, string> = {
  blush: "bg-blush/25 text-blush-deep",
  sage: "bg-sage/25 text-sage-deep",
  honey: "bg-honey/25 text-honey-deep",
  sky: "bg-sky/25 text-sky-deep",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}

function PageInner() {
  const searchParams = useSearchParams();
  const presetMobile = searchParams.get("mobile");

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(() =>
    presetMobile ? customers.find((c) => c.mobile === presetMobile) ?? null : null
  );

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<User[]>([]);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  // const [search, setSearch] = useState("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User>();
  const [customerCoupons, setCustomerCoupons] = useState<number[]>([]);
  const [coupons, setCoupons] = useState<CouponForm[]>([]);

  const selectedStats = selected ? getCustomerStats(selected.mobile) : null;

  const fetchCustomers = useCallback(async () => {

    if (initialLoading) {
      setLoading(true);
    }

    const start = Date.now();

    try {
      const res = await fetch(
        `/api/admin/user?page=${page}&limit=${limit}&search=${search}`
      );

      const result = await res.json();

      if (result.success) {
        setUsers(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(1000 - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
        setInitialLoading(false);
      }, delay);
    }
  }, [page, limit, search, initialLoading]);
  // User list
  useEffect(() => {
    startTransition(() => {
      fetchCustomers();
    });
  }, [fetchCustomers]);


  /* ------------------------------------------------------------------ */
  /* Fetch Coupons                                                      */
  /* ------------------------------------------------------------------ */

  const fetchCoupons = useCallback(async () => {
    if (initialLoading) {
      setLoading(true);
    }

    const start = Date.now();

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        status: "ACTIVE",
      });

      const res = await fetch(
        `/api/admin/coupons?${params.toString()}`
      );

      const result = await res.json();

      if (result.success) {
        setCoupons(result.data || []);

        setTotalPages(
          result.pagination?.totalPages || 0
        );

        setTotalItems(
          result.pagination?.total || 0
        );
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(1000 - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
        setInitialLoading(false);
      }, delay);
    }
  }, [
    page,
    limit,
    search,
    initialLoading,
  ]);

  /* ------------------------------------------------------------------ */
  /* Load Coupons                                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    startTransition(() => {
      fetchCoupons();
    });
  }, [fetchCoupons]);

  // coupon modal
  const toggleCoupon = async (couponId: number) => {
    const assigned = customerCoupons.includes(couponId);

    const res = await fetch(
      `/api/admin/user/${selectedCustomer?.id}`,
      {
        method: assigned ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coupon_id: couponId,
        }),
      }
    );

    if (!res.ok) return;

    setCustomerCoupons((prev) =>
      assigned
        ? prev.filter((id) => id !== couponId)
        : [...prev, couponId]
    );
  };

  const openCouponModal = async (user: User) => {
    setSelectedCustomer(user);
    setCouponModalOpen(true);

    // Get coupons already assigned to this customer
    const res = await fetch(`/api/admin/user/${user.id}`);
    const data = await res.json();

    setCustomerCoupons(data.coupon_ids || []);
  };


  return (
    <>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers, each identified by a unique mobile number`}
      />

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile number, or email…"
            className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-ink-soft/50"
          />
        </div>
      </div>
      <div className="space-y-8">
        <TablePage title="Product categories" subtitle="Categories organizing your products" addLabel="Add category"
          headers={["ID", "Customer", "Total Order", "Total Amount", "Last Order", "Status", "Coupon", "Actions"]}
          page={page}
          onAddClick={() => { }}
          setSearch={setSearch}
          search={search}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          rows={users && users.map(user => (
            <tr key={user.id} className="border-t border-border">
              <td className="font-medium text-ink w-px whitespace-nowrap">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold `}
                >
                  {initials(user.name)}
                </span>
              </td>
              <td className="w-px whitespace-nowrap">
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-semibold text-ink">{user.name}</p>
                  <p className="text-[12.5px] text-ink-soft">{user.phone ? user.phone : user.email}</p>
                </div>
              </td>
              <td className="font-medium text-ink">
                {user.total_orders}
              </td>
              <td className="font-medium">৳ {user.total_spent}</td>
              <td>{user?.last_order ? format(new Date(user.last_order), "dd-MM-yyyy") : "N/A"}</td>
              <td><Badge status={user.status} /></td>
              <td><button
                  onClick={() => openCouponModal(user)}
                  className="cursor-pointer rounded-lg p-2 text-ink-soft hover:bg-sky-deep hover:text-white"
                  title="Assign coupons"
                >
                 Coupon
                </button>
                </td>
              <td>
                
                <button className="cursor-pointer rounded-lg p-2 text-ink-soft hover:bg-sky-deep hover:text-white">
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        />
      </div>

      {selected && selectedStats && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold ${avatarTones[selected.avatarColor]}`}
                >
                  {initials(selected.name)}
                </span>
                <div>
                  <h2 className="font-display text-[18px] font-semibold text-ink">{selected.name}</h2>
                  <p className="text-[12.5px] text-ink-soft">Customer since {selected.joinedDate}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-ink-soft hover:bg-cream-deep hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 rounded-xl bg-cream p-4 text-[13px] text-ink-soft">
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-blush-deep" />
                {selected.mobile}
                <span className="ml-1 rounded-full bg-blush/20 px-2 py-0.5 text-[11px] font-semibold text-blush-deep">
                  Unique ID
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Mail size={14} className="text-ink-soft" />
                {selected.email}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-ink-soft" />
                {selected.address}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="font-display text-[18px] font-semibold text-ink">{selectedStats.totalOrders}</p>
                <p className="text-[11.5px] text-ink-soft">Orders placed</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="font-display text-[18px] font-semibold text-ink">{selectedStats.totalItems}</p>
                <p className="text-[11.5px] text-ink-soft">Items bought</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="font-display text-[18px] font-semibold text-ink">${selectedStats.totalSpent.toFixed(0)}</p>
                <p className="text-[11.5px] text-ink-soft">Lifetime spend</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
                Order history
              </p>
              <div className="flex flex-col gap-3">
                {selectedStats.customerOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13.5px] font-semibold text-ink">{order.id}</p>
                        <p className="text-[12px] text-ink-soft">{order.date}</p>
                      </div>
                      <StatusPill status={order.status} />
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-2.5">
                          {/* <ProductThumb image={item.image} size={28} emojiSize={13} /> */}
                          <p className="min-w-0 flex-1 truncate text-[12.5px] text-ink-soft">{item.name}</p>
                          <p className="text-[12.5px] text-ink-soft">×{item.qty}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-border pt-2 text-[13px] font-semibold text-ink">
                      <span>Order total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {couponModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 w-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">
                Assign Coupons
              </h2>
              <button onClick={() => setCouponModalOpen(false)} className="text-sm font-medium" >
                <X />
              </button>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {coupons.map((coupon) => {
                const couponId = coupon.id;
                const assigned = couponId !== undefined && customerCoupons.includes(couponId);

                return (
                  <div
                    key={couponId ?? coupon.code}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div>
                      <p className="font-semibold text-ink">
                        {coupon.code}
                      </p>

                      <p className="text-xs text-ink-soft">
                        {coupon.discount_percentage}% discount
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => couponId !== undefined && toggleCoupon(couponId)}
                      className={`relative h-6 w-11 rounded-full transition ${assigned
                        ? "bg-sky-deep"
                        : "bg-neutral-300"
                        }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${assigned
                          ? "left-6"
                          : "left-1"
                          }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setCouponModalOpen(false)}
              className="mt-5 w-full rounded-xl bg-neutral-100 py-2.5 text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

