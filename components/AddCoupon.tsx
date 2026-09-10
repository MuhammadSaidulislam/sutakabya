import { CouponForm } from "@/types/coupon";
import React, { Dispatch, SetStateAction } from "react";

type AddCouponProps = {
  editing?: CouponForm | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  form: CouponForm;
  setForm: Dispatch<SetStateAction<CouponForm>>;
};

const AddCoupon = ({
  editing,
  onSubmit,
  onClose,
  form,
  setForm,
}: AddCouponProps) => {

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl">

        {/* ---------------------------------------------------------- */}
        {/* Header                                                     */}
        {/* ---------------------------------------------------------- */}

        <h2 className="font-display text-[18px] font-semibold text-ink">
          {editing ? "Edit coupon" : "Add coupon"}
        </h2>

        <p className="mt-1 text-[13px] text-ink-soft">
          Create a percentage discount coupon for your customers.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-5 flex flex-col gap-4"
        >


          {/* -------------------------------------------------------- */}
          {/* Coupon Code                                                */}
          {/* -------------------------------------------------------- */}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Coupon code
            </label>

            <input
              required
              value={form.code}
              onChange={(e) =>
                setForm({
                  ...form,
                  code: e.target.value.toUpperCase(),
                })
              }
              placeholder="e.g. WELCOME10"
              className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] uppercase text-ink placeholder:normal-case placeholder:text-ink-soft/50"
            />

            <p className="mt-1 text-[11px] text-ink-soft">
              Customers will enter this code at checkout.
            </p>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Discount Percentage                                       */}
          {/* -------------------------------------------------------- */}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Discount percentage
            </label>

            <div className="relative">
              <input
                required
                type="number"
                min="1"
                max="100"
                step="0.01"
                value={form.discount_percentage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount_percentage: e.target.value,
                  })
                }
                placeholder="e.g. 20"
                className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 pr-10 text-[14px] text-ink"
              />

              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-soft">
                %
              </span>
            </div>

            <p className="mt-1 text-[11px] text-ink-soft">
              Enter a value between 1% and 100%.
            </p>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Status                                                     */}
          {/* -------------------------------------------------------- */}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Status
            </label>

            <select
              value={form.status || "ACTIVE"}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as
                    | "ACTIVE"
                    | "INACTIVE",
                })
              }
              className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Buttons                                                    */}
          {/* -------------------------------------------------------- */}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-[14px] font-semibold text-ink-soft hover:bg-cream-deep"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-blush-deep py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
            >
              {editing ? "Save changes" : "Add coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoupon;