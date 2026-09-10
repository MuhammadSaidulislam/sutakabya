"use client";

import { X, Download, Printer } from "lucide-react";
import { OrderDetails } from "@/types/order";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";



export default function InvoiceModal({
  data,
  onClose,
}: {
  data: OrderDetails | null;
  onClose: () => void;
}) {
  if (!data) return null;

  const { order, customer, products } = data;

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formattedDate = order.ordered_at
    ? new Date(order.ordered_at).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "N/A";

  const formattedDateTime = order.ordered_at
    ? new Date(order.ordered_at).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "N/A";

  const shippingAddress = order.shipping_address
    ? JSON.parse(order.shipping_address)
    : null;

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

 const handleDownload = () => {
  generateInvoicePDF({
     data,
    shippingAddress: shippingAddress || {},
  });
};


  // ============================================================
  // PRINT
  // ============================================================

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl">

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-display text-[18px] font-semibold text-ink">
              Invoice
            </h2>

            <p className="mt-0.5 text-[11px] text-ink-soft">
              {order.order_no}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
          >
            <X size={18} />
          </button>

        </div>

        {/* ====================================================== */}
        {/* INVOICE */}
        {/* ====================================================== */}

        <div
          id="invoice-content"
          className="mt-4 rounded-2xl border border-border bg-surface p-5"
        >

          {/* Company + Invoice */}

          <div className="flex flex-col justify-between gap-5 sm:flex-row">

            {/* Company */}

            <div>
              <p className="font-display text-[17px] font-semibold text-ink">
                MomAndChild
              </p>

              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                Baby & Maternity Essentials
                <br />
                House 12, Road 4, Banani, Dhaka
                <br />
                care@momandchild.com
              </p>
            </div>

            {/* Invoice */}

            <div className="sm:text-right">

              <p className="font-display text-[15px] font-semibold text-blush-deep">
                INVOICE
              </p>

              <p className="mt-1 text-[12.5px] font-medium text-ink-soft">
                {order.order_no}
              </p>

              <p className="text-[12.5px] text-ink-soft">
                Date: {formattedDate}
              </p>

              <div className="mt-2 flex gap-2 sm:justify-end">

                <span className="rounded-full bg-blush-deep/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blush-deep">
                  {order.order_status}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${order.payment_status.toLowerCase() === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {order.payment_status}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================== */}
          {/* CUSTOMER */}
          {/* ==================================================== */}

          <div className="mt-5 border-t border-border pt-4">

            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
              Billed to
            </p>


            {shippingAddress && (
              <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                <p>{shippingAddress.name}</p>
                <p>{shippingAddress.phone}</p>
                <p>{shippingAddress.address}</p>
                <p>
                  {shippingAddress.city}
                  {shippingAddress.zip && ` - ${shippingAddress.zip}`}
                </p>
              </div>
            )}
            {customer.email && (
              <p className="text-[13px] text-ink-soft">
                {customer.email}
              </p>
            )}

          </div>

          {/* ==================================================== */}
          {/* PRODUCTS */}
          {/* ==================================================== */}

          <div className="mt-5 overflow-x-auto">

            <table className="w-full min-w-[500px] text-left text-[12px]">

              <thead>

                <tr className="border-b border-border text-ink-soft">

                  <th className="pb-2 font-medium">
                    Item
                  </th>

                  <th className="pb-2 font-medium">
                    SKU
                  </th>

                  <th className="pb-2 text-center font-medium">
                    Qty
                  </th>

                  <th className="pb-2 text-right font-medium">
                    Price
                  </th>

                  <th className="pb-2 text-right font-medium">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {products.map((item) => (

                  <tr
                    key={item.order_item_id}
                    className="border-b border-border last:border-0"
                  >

                    <td className="max-w-[200px] py-3 text-ink">
                      <span className={`line-clamp-2 `}>
                        {item.product.name}
                        {item.product.status === "CANCELLED" ? <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-[9px] text-red-600">Cancel</span> : ""}
                      </span>
                    </td>

                    <td className="py-3 text-ink-soft">
                      {item.product.sku || "-"}
                    </td>

                    <td className="py-3 text-center text-ink-soft">
                      {item.qty}
                    </td>

                    <td className="py-3 text-right text-ink-soft">
                      ${Number(item.price).toFixed(2)}
                    </td>

                    <td className="py-3 text-right font-medium text-ink">
                      ${Number(item.subtotal).toFixed(2)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* ==================================================== */}
          {/* SUMMARY */}
          {/* ==================================================== */}

          <div className="mt-4 flex justify-end">

            <div className="w-full max-w-[230px] text-[13px]">

              <div className="flex justify-between py-1 text-ink-soft">
                <span>Subtotal</span>
                <span>
                  ${Number(order.subtotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-1 text-ink-soft">
                <span>Shipping</span>
                <span>
                  ${Number(order.shipping_rate).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-1 text-ink-soft">
                <span>Coupon Discount</span>
                <span className="text-emerald-600">
                  ${(Number(order.subtotal) * Number(order.coupon_discount || 0)) / 100}
                </span>
              </div>

              <div className="flex justify-between py-1 text-ink-soft">
                <span>Discount</span>
                <span className="text-emerald-600">
                  ${Number(order.discount).toFixed(2)}
                </span>
              </div>

              <div className="mt-1 flex justify-between border-t border-border py-2 font-display text-[15px] font-semibold text-ink">

                <span>Total</span>

                <span className="text-blush-deep">
                  ${Number(order.total).toFixed(2)}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================== */}
          {/* FOOTER */}
          {/* ==================================================== */}

          <div className="mt-5 border-t border-border pt-4 text-center">

            <p className="text-[12px] font-medium text-ink-soft">
              Thank you for shopping with MomAndChild!
            </p>

            <p className="mt-1 text-[11px] text-ink-soft/70">
              Order {order.order_no} • {formattedDateTime}
            </p>

          </div>

        </div>

        {/* ====================================================== */}
        {/* ACTIONS */}
        {/* ====================================================== */}

        <div className="mt-5 flex gap-3">

          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-[14px] font-semibold text-ink-soft transition hover:bg-cream-deep hover:text-ink"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blush-deep py-2.5 text-[14px] font-semibold text-surface transition hover:bg-blush-deep/90"
          >
            <Download size={16} />
            Download PDF
          </button>

        </div>

      </div>

    </div>
  );
}