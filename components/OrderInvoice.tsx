"use client";

import React, { useState } from 'react'
import { OrderDetails as OrderDetailsType } from "@/types/order";

interface OrderProps {
  selectedOrder: OrderDetailsType | null;
  onClose: () => void;
}

interface ShippingAddress {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
}

// ---- Helper function ----
function parseAddress(raw: unknown): ShippingAddress | null {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : (raw as ShippingAddress);
  } catch {
    return null;
  }
}

const OrderInvoice = ({ selectedOrder, onClose }: OrderProps) => {
  // ============================================================
  // ALL HOOKS MUST BE HERE
  // ============================================================

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    selectedOrder?.products.forEach((item) => {
      initial[item.order_item_id] = Number(item.qty);
    });
    return initial;
  });

  // cancelledItems is the single source of truth for whether a line item is
  // cancelled, whether that cancellation originally came from the order item
  // status or from the product itself being discontinued. It is fully
  // toggleable - the admin can restore any item from here, including ones
  // whose underlying product is cancelled, and Save will send that choice
  // to the API.
  const [cancelledItems, setCancelledItems] = useState<Set<number>>(() => {
    const cancelled = new Set<number>();
    selectedOrder?.products.forEach((item) => {
      if (
        item.status?.toUpperCase() === "CANCELLED" ||
        item.product.status === "CANCELLED"
      ) {
        cancelled.add(item.order_item_id);
      }
    });
    return cancelled;
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(
    () => parseAddress(selectedOrder?.order.shipping_address)
  );

  // ============================================================
  // NO ORDER
  // ============================================================

  if (!selectedOrder) {
    return null;
  }

  // ============================================================
  // ORDER DATA
  // ============================================================

  const { order, customer, products } = selectedOrder;

  // Customers can only edit their shipping address and cancel/restore
  // items on this invoice - payment status, delivery option, shipping
  // cost, and discount are set by the store and stay read-only here.
  const shipping = Number(order.shipping_rate || 0);
  const discount = Number(order.discount || 0);
  const paymentStatus = order.payment_status || "PENDING";
  const deliveryOption = order.delivery_option || "STANDARD";

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

  // ============================================================
  // QUANTITY CHANGE
  // ============================================================

  const handleQuantityChange = (orderItemId: number, value: number) => {
    if (value < 1) {
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [orderItemId]: value,
    }));
  };

  // ============================================================
  // CANCEL / RESTORE ITEM
  // ============================================================
  // Freely toggles the cancelled state for a line item, regardless of
  // whether it started out cancelled because of the order item status or
  // because the underlying product is discontinued. Restoring here is a
  // deliberate customer action and will be sent to the API on Save.

  const handleCancelItem = (orderItemId: number) => {
    setCancelledItems((prev) => {
      const updated = new Set(prev);

      if (updated.has(orderItemId)) {
        updated.delete(orderItemId);
      } else {
        updated.add(orderItemId);
      }

      return updated;
    });
  };

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const calculatedSubtotal = products.reduce((total, item) => {
    if (cancelledItems.has(item.order_item_id)) {
      return total;
    }

    const qty = quantities[item.order_item_id] ?? Number(item.qty);

    return total + Number(item.price) * qty;
  }, 0);

  // ============================================================
  // TOTAL
  // ============================================================

  // const calculatedTotal = calculatedSubtotal + Number(shipping) - Number(discount);
  const calculatedTotal = calculatedSubtotal + Number(shipping) -  Number(discount) - (calculatedSubtotal * Number(selectedOrder.order.coupon_discount || 0)) / 100;

  // ============================================================
  // ADDRESS CHANGE
  // ============================================================

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...(prev || {}),
      [field]: value,
    }));
  };

  // ============================================================
  // CANCEL EDITING
  // ============================================================

  const handleCancelEditing = () => {
    if (!selectedOrder) {
      return;
    }

    const initialQuantities: Record<number, number> = {};

    selectedOrder.products.forEach((item) => {
      initialQuantities[item.order_item_id] = Number(item.qty);
    });

    setQuantities(initialQuantities);

    const cancelled = new Set<number>();

    selectedOrder.products.forEach((item) => {
      if (
        item.status?.toUpperCase() === "CANCELLED" ||
        item.product.status === "CANCELLED"
      ) {
        cancelled.add(item.order_item_id);
      }
    });

    setCancelledItems(cancelled);

    setShippingAddress(parseAddress(selectedOrder.order.shipping_address));

    setEditing(false);
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSaveChanges = async () => {
    try {
      setSaving(true);

      const items = products.map((item) => ({
        order_item_id: item.order_item_id,

        qty: quantities[item.order_item_id] ?? Number(item.qty),

        status: cancelledItems.has(item.order_item_id)
          ? "CANCELLED"
          : "ACTIVE",
      }));

      const payload = {
        items,
        // These are read-only for customers - sent through unchanged so the
        // API has a complete record, but never modified from this screen.
        shipping,
        discount,
        payment_status: paymentStatus,
        delivery_option: deliveryOption,
        // Customer-editable fields:
        shipping_address: shippingAddress,
      };

      const response = await fetch(`/api/admin/order/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update order");
      }

      setEditing(false);
    } catch (error) {
      console.error("Save order error:", error);

      alert(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      <div className="flex items-center justify-between">

        <div>
          <h2 className="font-display text-[18px] font-semibold text-ink">Invoice</h2>
          <p className="mt-0.5 text-[11px] text-ink-soft">{order.order_no}</p>
        </div>

        {!editing ? (
          <div className='flex items-center gap-2'>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full  px-4 py-2  text-[10px] font-semibold  uppercase tracking-[0.15em]  text-white transition-all hover:border-coral-400 bg-rose-500 hover:bg-coral-50 hover:text-coral-500"
            >
              Exit
            </button>
            <button
              onClick={() => setEditing(true)}
              type="button"
              className="rounded-full  border border-ink-200  px-4 py-2  text-[10px] font-semibold  uppercase tracking-[0.15em]  text-ink-700 transition-all hover:border-coral-400 hover:bg-coral-50 hover:text-coral-500"
            >
              Edit Order
            </button>
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <button
              onClick={handleCancelEditing}
              disabled={saving}
              type="button"
              className="rounded-full px-4 py-2 text-[10px] border border-ink-soft font-semibold  uppercase  tracking-[0.15em] text-ink-500 hover:text-ink-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              type="button"
              className="rounded-full   bg-brand-pink  px-5 py-2   text-[10px]   font-semibold   uppercase  tracking-[0.15em]   text-white    transition-all  hover:bg-coral-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

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
            <div>

              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
                Billed to
              </p>

              {editing ? (
                <div className="mt-2 grid max-w-[240px] gap-2">

                  <input
                    value={shippingAddress?.name || ""}
                    onChange={(e) => updateAddress("name", e.target.value)}
                    placeholder="Name"
                    className="rounded-lg border border-border px-3 py-2 text-[12px] outline-none focus:border-brand-pink"
                  />

                  <input
                    value={shippingAddress?.phone || ""}
                    onChange={(e) => updateAddress("phone", e.target.value)}
                    placeholder="Phone"
                    className="rounded-lg border border-border px-3 py-2 text-[12px] outline-none focus:border-brand-pink"
                  />

                  <input
                    value={shippingAddress?.address || ""}
                    onChange={(e) => updateAddress("address", e.target.value)}
                    placeholder="Address"
                    className="rounded-lg border border-border px-3 py-2 text-[12px] outline-none focus:border-brand-pink"
                  />

                  <div className="grid grid-cols-2 gap-2">

                    <input
                      value={shippingAddress?.city || ""}
                      onChange={(e) => updateAddress("city", e.target.value)}
                      placeholder="City"
                      className="rounded-lg border border-border px-3 py-2 text-[12px] outline-none focus:border-brand-pink"
                    />

                    <input
                      value={shippingAddress?.zip || ""}
                      onChange={(e) => updateAddress("zip", e.target.value)}
                      placeholder="ZIP"
                      className="rounded-lg border border-border px-3 py-2 text-[12px] outline-none focus:border-brand-pink"
                    />

                  </div>

                </div>
              ) : (
                shippingAddress && (
                  <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    <p>{shippingAddress.name}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.address}</p>
                    <p>
                      {shippingAddress.city}
                      {shippingAddress.zip && ` - ${shippingAddress.zip}`}
                    </p>
                  </div>
                )
              )}

              {customer.email && (
                <p className="text-[13px] text-ink-soft">
                  {customer.email}
                </p>
              )}

            </div>
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

            <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">

              <span className="rounded-full bg-blush-deep/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blush-deep">
                {order.order_status}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${paymentStatus.toLowerCase() === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
                  }`}
              >
                {paymentStatus}
              </span>

            </div>

          </div>

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

                <th className="pb-2 text-center font-medium">
                  Qty
                </th>

                <th className="pb-2 text-right font-medium">
                  Price
                </th>

                <th className="pb-2 text-right font-medium">
                  Amount
                </th>

                {editing && (
                  <th className="pb-2 text-right font-medium">
                    Action
                  </th>
                )}

              </tr>

            </thead>

            <tbody>

              {products.map((item) => {
                const cancelled = cancelledItems.has(item.order_item_id);

                // Informational only - lets the admin see *why* an item is
                // cancelled (discontinued product vs. manually cancelled),
                // but doesn't block restoring it.
                const productCancelled = item.product.status === "CANCELLED";

                const qty = quantities[item.order_item_id] ?? Number(item.qty);

                const amount = Number(item.price) * qty;

                return (
                  <tr
                    key={item.order_item_id}
                    className="border-b border-border last:border-0"
                  >

                    <td className="max-w-[200px] py-3 text-ink">
                      <span
                        className={`line-clamp-2 ${cancelled ? "line-through text-red-500" : ""
                          }`}
                      >
                        {item.product.name}
                      </span>

                      {cancelled && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-medium text-red-600">
                          {productCancelled ? "Discontinued" : "Cancelled"}
                        </span>
                      )}
                    </td>


                    <td className="py-3 text-center text-ink-soft">
                      {editing && !cancelled ? (
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.order_item_id,
                              Number(e.target.value)
                            )
                          }
                          className="w-16 rounded-lg border border-border px-2 py-1 text-center"
                        />
                      ) : (
                        qty
                      )}
                    </td>

                    <td
                      className={`py-3 text-right text-ink-soft ${cancelled ? "line-through text-red-400" : ""
                        }`}
                    >
                      {Number(item.price).toFixed(2)}
                    </td>

                    <td
                      className={`py-3 text-right font-medium ${cancelled ? "line-through text-red-400" : "text-ink"
                        }`}
                    >
                      {cancelled ? "0.00" : amount.toFixed(2)}
                    </td>

                    {editing && (
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCancelItem(item.order_item_id)}
                          title={
                            productCancelled && cancelled
                              ? "Restoring will mark this line item active again, even though the product is discontinued in the catalog"
                              : undefined
                          }
                          className={`rounded-full px-3 py-1 text-[9px] font-semibold ${cancelled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                            }`}
                        >
                          {cancelled ? "Restore" : "Cancel"}
                        </button>
                      </td>
                    )}

                  </tr>
                );
              })}

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
                ৳ {calculatedSubtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 text-ink-soft">
              <span>Shipping</span>
              <span>
                ৳ {Number(shipping).toFixed(2)}
              </span>
            </div>

             <div className="flex justify-between py-1 text-ink-soft">
                <span>Coupon Discount</span>
                <span className="text-emerald-600">
                  ৳ {(Number(order.subtotal) * Number(order.coupon_discount || 0)) / 100}
                </span>
              </div>

            <div className="flex justify-between py-1 text-ink-soft">
              <span>Discount</span>
              <span className="text-emerald-600">
                ৳ {Number(discount)}
              </span>
            </div>

            <div className="mt-1 flex justify-between border-t border-border py-2 font-display text-[15px] font-semibold text-ink">

              <span>Total</span>

              <span className="text-blush-deep">
                ৳ {calculatedTotal.toFixed(2)}
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
    </div>
  )
}

export default OrderInvoice