import { useState } from 'react';
import {  Check,   Package,  ArrowRight,  Sparkles } from 'lucide-react';
import { Order } from '@/types/order';
import Link from 'next/link';


/* ------------------------------------------------------------------ */
/*  Main modal component — static, no motion/confetti                  */
/* ------------------------------------------------------------------ */
type OrderSuccessModalProps = {
  open: boolean;
  order: Order | null;
};

export function OrderSuccessModal({
  open,
  order,
}: OrderSuccessModalProps) {

  console.log("order",order)

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      {/* backdrop */}
      {/* <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} /> */}
 
      {/* dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* top decorative panel */}
        <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">

          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-[0_10px_30px_-6px_rgba(16,185,129,0.55)]">
            <Check size={28} className="text-white" strokeWidth={3} />
          </span>
        </div>
 
        {/* body */}
        <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <div className="text-center">
            <h2 id="order-success-title" className="text-xl font-bold text-brand-pink sm:text-2xl">
              Order Confirmed!
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Thanks for shopping with us — your order has been placed
              successfully and is being prepared.
            </p>
          </div>
 
          {/* order number pill */}
          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Order Number
              </p>
              <p className="text-sm font-semibold text-slate-800">{order?.order_no}</p>
            </div>
          </div>
 
          {/* summary rows */}
          <div className="mt-4 space-y-3 rounded-2xl border bg-cream border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Package size={16} />
              </span>
              <div className="flex-1 text-sm">
                <p className="text-slate-500">{order?.items_total} items · Placed {order?.ordered_at ? new Date(order.ordered_at).toLocaleDateString("en-US", {  year: "numeric",  month: "short",  day: "numeric", }) : "-"}</p>
                <p className="font-semibold text-slate-800">Total paid: ৳ {order?.total}</p>
              </div>
            </div>
            {/* <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Truck size={16} />
              </span>
              <div className="flex-1 text-sm">
                <p className="text-slate-500">Estimated delivery</p>
                <p className="font-semibold text-slate-800">Aug 31 – Sep 2</p>
              </div>
            </div> */}
          </div>
 
 
          {/* actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Link href="/account"  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              Track Your Order
              <ArrowRight size={15} />
            </Link>
            <div className="flex gap-2.5">
              <Link href="/" className="text-center flex-1 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                Continue Shopping
              </Link>
            </div>
          </div>
 
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <Sparkles size={12} className="text-amber-400" />A confirmation email is on its way to your inbox.
          </p>
        </div>
      </div>
 
      <style>{`
        details > summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo wrapper — lets you preview the modal by reopening it           */
/* ------------------------------------------------------------------ */
export default function OrderSuccessDemo() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center bg-slate-100 p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Simulate Checkout Success
        </button>
      )}
      {/* <OrderSuccessModal open={open} onClose={() => setOpen(false)} /> */}
    </div>
  );
}