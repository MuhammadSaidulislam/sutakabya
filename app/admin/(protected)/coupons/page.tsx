"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import AddCoupon from "@/components/AddCoupon";
import { CouponForm } from "@/types/coupon";
import { useSearchParams } from "next/navigation";
import { TablePage } from "@/components/TablePage";


export default function CouponsPage() {
  return (
    <Suspense fallback={null}>
      <CouponsPageInner />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/* Empty form                                                         */
/* ------------------------------------------------------------------ */

const emptyForm: CouponForm = {
  code: "",
  discount_percentage: "",
};

function CouponsPageInner() {
  const searchParams = useSearchParams();
  const presetFilter = searchParams.get("filter");

  const [coupons, setCoupons] = useState<CouponForm[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CouponForm | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    presetFilter ?? "All"
  );

  const [deleteTarget, setDeleteTarget] =
    useState<CouponForm | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [, startTransition] = useTransition();

  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);

  /* ------------------------------------------------------------------ */
  /* Open Add                                                           */
  /* ------------------------------------------------------------------ */

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  /* ------------------------------------------------------------------ */
  /* Open Edit                                                          */
  /* ------------------------------------------------------------------ */

  const openEdit = (coupon: CouponForm) => {
    setEditing(coupon);

    setForm({
      id: coupon.id,
      code: coupon.code,
      discount_percentage: String(coupon.discount_percentage)
    });

    setFormOpen(true);
  };

  /* ------------------------------------------------------------------ */
  /* Submit Coupon                                                      */
  /* ------------------------------------------------------------------ */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.code.trim() || !form.discount_percentage) {
      return;
    }

    try {
      setLoading(true);

      /* -------------------------------------------------------------- */
      /* Coupon payload                                                  */
      /* -------------------------------------------------------------- */

      const payload = {
        ...(editing?.id ? { id: editing.id } : {}),
        code: form.code.trim().toUpperCase(),
        discount_percentage: Number(form.discount_percentage),
        status: form.status || "ACTIVE",
      };

      /* -------------------------------------------------------------- */
      /* Create / Update                                                 */
      /* -------------------------------------------------------------- */

      const res = await fetch("/api/admin/coupons", {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message || "Something went wrong."
        );
      }

      /* -------------------------------------------------------------- */
      /* Close and reset                                                 */
      /* -------------------------------------------------------------- */

      setFormOpen(false);
      setEditing(null);
      setForm({ ...emptyForm });

      /* -------------------------------------------------------------- */
      /* Refresh table                                                   */
      /* -------------------------------------------------------------- */

      fetchCoupons();
    } catch (error) {
      console.error("Coupon submit error:", error);
    } finally {
      setLoading(false);
    }
  };

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
        status: statusFilter,
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
    statusFilter,
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

  /* ------------------------------------------------------------------ */
  /* Search / Filter                                                    */
  /* ------------------------------------------------------------------ */

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div>
      <PageHeader
        title="Coupons"
        description={`${totalItems} discount codes for your storefront`}
        action={
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-blush-deep px-4 py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
          >
            <Plus size={17} />
            Add coupon
          </button>
        }
      />

      {/* -------------------------------------------------------------- */}
      {/* Filters                                                        */}
      {/* -------------------------------------------------------------- */}

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60"
          />

          <input
            value={search}
            onChange={(e) =>
              handleSearchChange(e.target.value)
            }
            placeholder="Search by coupon code…"
            className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-ink-soft/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            handleStatusChange(e.target.value)
          }
          className="rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[13.5px] text-ink sm:w-44"
        >
          <option value="All">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Coupon Table                                                    */}
      {/* -------------------------------------------------------------- */}

      <TablePage
        title="Coupons"
        subtitle={`${totalItems} coupons`}
        addLabel="Add Coupon"
        headers={[
          "Code",
          "Discount",
          "Used",
          "Status",
          "Actions",
        ]}
        page={page}
        onAddClick={openAdd}
        setSearch={handleSearchChange}
        search={search}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        rows={coupons.map((coupon) => (
          <tr
            key={coupon.id}
            className="border-t border-border"
          >

            {/* Code */}
            <td className="px-5 py-3 font-medium text-ink">
              {coupon.code}
            </td>

            {/* Discount */}
            <td className="px-5 py-3 text-ink-soft">
              {Number(coupon.discount_percentage).toFixed(2)}%
            </td>

            {/* Used */}
            <td className="px-5 py-3 text-ink-soft">
              {coupon.used ?? 0}
            </td>

            {/* Status */}
            <td className="px-5 py-3">
              <span
                className={
                  coupon.status === "ACTIVE"
                    ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                    : "inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                }
              >
                {coupon.status}
              </span>
            </td>

            {/* Actions */}
            <td className="w-px whitespace-nowrap px-5 py-3">
              <div className="flex justify-end gap-1.5">
                <button
                  aria-label={`Edit ${coupon.code}`}
                  onClick={() => openEdit(coupon)}
                  className="rounded-lg p-2 text-ink-soft hover:bg-cream-deep hover:text-ink"
                >
                  <Pencil size={15} />
                </button>

                <button
                  aria-label={`Delete ${coupon.code}`}
                  onClick={() =>
                    setDeleteTarget(coupon)
                  }
                  className="rounded-lg p-2 text-ink-soft hover:bg-rose-danger/10 hover:text-rose-danger"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      />

      {/* -------------------------------------------------------------- */}
      {/* Add / Edit Coupon                                              */}
      {/* -------------------------------------------------------------- */}

      {formOpen && (
        <AddCoupon
          editing={editing}
          form={form}
          setForm={setForm}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
            setForm({ ...emptyForm });
          }}
          onSubmit={handleSubmit}
        />
      )}

      {/* -------------------------------------------------------------- */}
      {/* Delete Confirmation                                             */}
      {/* -------------------------------------------------------------- */}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this coupon?"
        description={`"${deleteTarget?.code}" will no longer be redeemable at checkout.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          setCoupons((prev) =>
            prev.filter(
              (c) => c.id !== deleteTarget?.id
            )
          );

          setDeleteTarget(null);
        }}
      />
    </div>
  );
}