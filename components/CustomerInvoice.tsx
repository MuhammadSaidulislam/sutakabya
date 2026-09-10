"use client";

import React, { useState } from "react";
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

const CustomerInvoice = ({ selectedOrder, onClose }: OrderProps) => {
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

  const [shippingRate, setShippingRate] = useState(
    () => Number(selectedOrder?.order.shipping_rate || 0)
  );

  const [discount, setDiscount] = useState(
    () => Number(selectedOrder?.order.discount || 0)
  );

  const [paymentStatus, setPaymentStatus] = useState(
    () => selectedOrder?.order.payment_status || "PENDING"
  );

  const [deliveryOption, setDeliveryOption] = useState(
    () => selectedOrder?.order.order_status || "PROCESSING"
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

  // ============================================================
  // DATE
  // ============================================================

  const formattedDateTime = order.ordered_at
    ? new Date(order.ordered_at).toLocaleString(
      "en-BD",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )
    : "N/A";

  // ============================================================
  // QUANTITY CHANGE
  // ============================================================

  const handleQuantityChange = (
    orderItemId: number,
    value: number
  ) => {
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
  // deliberate admin action and will be sent to the API on Save.

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

  const calculatedSubtotal = products.reduce(
    (total, item) => {
      if (cancelledItems.has(item.order_item_id)) {
        return total;
      }

      const qty =
        quantities[item.order_item_id] ??
        Number(item.qty);

      return (
        total +
        Number(item.price) * qty
      );
    },
    0
  );

  // ============================================================
  // TOTAL
  // ============================================================

  // const calculatedTotal =  calculatedSubtotal +  Number(shippingRate) -  Number(discount);
const calculatedTotal = calculatedSubtotal + Number(shippingRate) -  Number(discount) - (calculatedSubtotal * Number(selectedOrder.order.coupon_discount || 0)) / 100;
  // ============================================================
  // ADDRESS CHANGE
  // ============================================================

  const updateAddress = (
    field: keyof ShippingAddress,
    value: string
  ) => {
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

    const initialQuantities: Record<
      number,
      number
    > = {};

    selectedOrder.products.forEach((item) => {
      initialQuantities[
        item.order_item_id
      ] = Number(item.qty);
    });

    setQuantities(initialQuantities);

    const cancelled = new Set<number>();

    selectedOrder.products.forEach((item) => {
      if (
        item.status?.toUpperCase() === "CANCELLED" ||
        item.product.status === "CANCELLED"
      ) {
        cancelled.add(
          item.order_item_id
        );
      }
    });

    setCancelledItems(cancelled);

    setShippingRate(
      Number(selectedOrder.order.shipping_rate || 0)
    );

    setDiscount(
      Number(selectedOrder.order.discount || 0)
    );

    setPaymentStatus(
      selectedOrder.order.payment_status ||
      "PENDING"
    );

    setDeliveryOption(
      selectedOrder.order.order_status ||
      "PROCESSING"
    );

    let address: ShippingAddress | null =
      null;

    try {
      if (
        selectedOrder.order.shipping_address
      ) {
        address =
          typeof selectedOrder.order
            .shipping_address === "string"
            ? JSON.parse(
              selectedOrder.order
                .shipping_address
            )
            : selectedOrder.order
              .shipping_address;
      }
    } catch {
      address = null;
    }

    setShippingAddress(address);

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

        qty:
          quantities[
          item.order_item_id
          ] ?? Number(item.qty),

        status: cancelledItems.has(item.order_item_id)
          ? "CANCELLED"
          : "ACTIVE",
      }));

      const payload = {
        items,

        shipping_rate: Number(shippingRate),

        discount: Number(discount),

        payment_status: paymentStatus,

        order_status: deliveryOption,

        shipping_address: shippingAddress,
      };

      const response = await fetch(
        `/api/admin/order/${order.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Failed to update order"
        );
      }

      setEditing(false);

      // Better than window.location.reload()
      // if parent supports refresh:
      //   window.location.reload();

    } catch (error) {
      console.error(
        "Save order error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl">

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-display text-[18px] font-semibold text-ink">
              Order Invoice
            </h2>

            <p className="mt-0.5 text-[11px] text-ink-soft">
              {order.order_no}
            </p>
          </div>

          {!editing ? (
            <div className="flex gap-2">

              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-rose-500 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
              >
                Exit
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                className="rounded-full border border-ink-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
              >
                Edit Order
              </button>

            </div>
          ) : (
            <div className="flex gap-2">

              <button
                type="button"
                onClick={
                  handleCancelEditing
                }
                disabled={saving}
                className="rounded-full border border-ink-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveChanges
                }
                disabled={saving}
                className="rounded-full bg-brand-pink px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}
        </div>

        {/* ====================================================== */}
        {/* CUSTOMER + ADDRESS */}
        {/* ====================================================== */}

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {/* CUSTOMER */}

          <div className="rounded-2xl border border-border p-4">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Customer
            </p>

            <p className="mt-2 text-sm font-medium text-ink">
              {customer.name}
            </p>

            {customer.email && (
              <p className="text-xs text-ink-soft">
                {customer.email}
              </p>
            )}

            {customer.phone && (
              <p className="text-xs text-ink-soft">
                {customer.phone}
              </p>
            )}

            {formattedDateTime && (
              <p className="text-xs text-ink-soft">
                Order Date: {formattedDateTime}
              </p>
            )}

          </div>

          {/* SHIPPING ADDRESS */}

          <div className="rounded-2xl border border-border p-4">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Shipping Address
            </p>

            {editing ? (

              <div className="mt-2 grid gap-2">

                <input
                  value={
                    shippingAddress?.name || ""
                  }
                  onChange={(e) =>
                    updateAddress(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Name"
                  className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-brand-pink"
                />

                <input
                  value={
                    shippingAddress?.phone ||
                    ""
                  }
                  onChange={(e) =>
                    updateAddress(
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="Phone"
                  className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-brand-pink"
                />

                <input
                  value={
                    shippingAddress?.address ||
                    ""
                  }
                  onChange={(e) =>
                    updateAddress(
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="Address"
                  className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-brand-pink"
                />

                <div className="grid grid-cols-2 gap-2">

                  <input
                    value={
                      shippingAddress?.city ||
                      ""
                    }
                    onChange={(e) =>
                      updateAddress(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City"
                    className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-brand-pink"
                  />

                  <input
                    value={
                      shippingAddress?.zip ||
                      ""
                    }
                    onChange={(e) =>
                      updateAddress(
                        "zip",
                        e.target.value
                      )
                    }
                    placeholder="ZIP"
                    className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-brand-pink"
                  />

                </div>

              </div>

            ) : (

              <div className="mt-2 text-xs leading-5 text-ink-soft">

                <p>
                  {shippingAddress?.name}
                </p>

                <p>
                  {shippingAddress?.phone}
                </p>

                <p>
                  {shippingAddress?.address}
                </p>

                <p>
                  {shippingAddress?.city}
                  {shippingAddress?.zip &&
                    ` - ${shippingAddress.zip}`}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* ====================================================== */}
        {/* ORDER OPTIONS */}
        {/* ====================================================== */}

        <div className="mt-4 grid gap-3 sm:grid-cols-4">

          {/* PAYMENT */}

          <div className="rounded-xl border border-border p-3">

            <label className="text-[10px] font-semibold uppercase text-ink-soft">
              Payment Status
            </label>

            {editing ? (
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border border-border px-2 py-2 text-xs"
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="REFUNDED">
                  Refunded
                </option>
              </select>
            ) : (
              <p className="mt-2 text-xs font-medium">
                {paymentStatus}
              </p>
            )}

          </div>

          {/* DELIVERY */}

          <div className="rounded-xl border border-border p-3">

            <label className="text-[10px] font-semibold uppercase text-ink-soft">
              Delivery Option
            </label>

            {editing ? (
              <select
                value={deliveryOption}
                onChange={(e) =>
                  setDeliveryOption(
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border border-border px-2 py-2 text-xs"
              >
                 <option value="PENDING">
                  Pending
                </option>
                <option value="CANCELLED">
                  Cancelled
                </option>
                <option value="RETURN">
                  Return
                </option>
                 <option value="SHIPPED">
                  Shipped
                </option>
                <option value="PROCESSING">
                  Processing
                </option>
                <option value="DELIVERED">
                  Delivered
                </option>
              </select>
            ) : (
              <p className="mt-2 text-xs font-medium">
                {deliveryOption}
              </p>
            )}

          </div>

          {/* SHIPPING COST */}

          <div className="rounded-xl border border-border p-3">

            <label className="text-[10px] font-semibold uppercase text-ink-soft">
              Shipping Cost
            </label>

            {editing ? (
              <input
                type="number"
                min="0"
                step="0.01"
                value={shippingRate}
                onChange={(e) =>
                  setShippingRate(
                    Number(e.target.value)
                  )
                }
                className="mt-2 w-full rounded-lg border border-border px-2 py-2 text-xs"
              />
            ) : (
              <p className="mt-2 text-xs font-medium">
                ৳ {shippingRate.toFixed(2)}
              </p>
            )}

          </div>

          {/* DISCOUNT */}
          <div className="rounded-xl border border-border p-3">

            <label className="text-[10px] font-semibold uppercase text-ink-soft">
              Discount
            </label>

            {editing ? (
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    Number(e.target.value)
                  )
                }
                className="mt-2 w-full rounded-lg border border-border px-2 py-2 text-xs"
              />
            ) : (
              <p className="mt-2 text-xs font-medium">
                ৳ {discount.toFixed(2)}
              </p>
            )}

          </div>

        </div>

        {/* ====================================================== */}
        {/* PRODUCTS */}
        {/* ====================================================== */}

        <div className="mt-5 overflow-x-auto rounded-xl border border-border">

          <table className="w-full min-w-[700px] text-left text-xs">

            <thead className="bg-ink/5">

              <tr>
                <th className="px-3 py-3">
                  Product
                </th>

                <th className="px-3 py-3">
                  SKU
                </th>

                <th className="px-3 py-3 text-center">
                  Qty
                </th>

                <th className="px-3 py-3 text-right">
                  Price
                </th>

                <th className="px-3 py-3 text-right">
                  Amount
                </th>

                {editing && (
                  <th className="px-3 py-3 text-right">
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
                const productCancelled =
                  item.product.status === "CANCELLED";

                const qty =
                  quantities[item.order_item_id] ?? Number(item.qty);

                const amount =
                  Number(item.price) * qty;

                return (
                  <tr
                    key={item.order_item_id}
                    className={`border-t border-border ${
                      cancelled ? "bg-red-50/50" : ""
                    }`}
                  >
                    {/* Product */}
                    <td
                      className={`px-3 py-3 font-medium ${
                        cancelled
                          ? "text-red-500 line-through"
                          : ""
                      }`}
                    >
                      {item.product.name}

                      {cancelled && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-[9px] text-red-600">
                          {productCancelled
                            ? "Discontinued"
                            : "Cancelled"}
                        </span>
                      )}
                    </td>

                    {/* SKU */}
                    <td className="px-3 py-3 text-ink-soft">
                      {item.product.sku || "-"}
                    </td>

                    {/* Quantity */}
                    <td className="px-3 py-3 text-center">
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

                    {/* Unit Price */}
                    <td
                      className={`px-3 py-3 text-right ${
                        cancelled
                          ? "text-red-400 line-through"
                          : ""
                      }`}
                    >
                      ৳ {Number(item.price).toFixed(2)}
                    </td>

                    {/* Amount */}
                    <td
                      className={`px-3 py-3 text-right font-semibold ${
                        cancelled
                          ? "text-red-400 line-through"
                          : ""
                      }`}
                    >
                      ৳ {cancelled ? "0.00" : amount.toFixed(2)}
                    </td>

                    {/* Cancel / Restore */}
                    {editing && (
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleCancelItem(item.order_item_id)
                          }
                          title={
                            productCancelled && cancelled
                              ? "Restoring will mark this line item active again, even though the product is discontinued in the catalog"
                              : undefined
                          }
                          className={`rounded-full px-3 py-1 text-[9px] font-semibold ${
                            cancelled
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

        {/* ====================================================== */}
        {/* SUMMARY */}
        {/* ====================================================== */}

        <div className="mt-5 flex justify-end">

          <div className="w-full max-w-xs text-sm">

            <div className="flex justify-between py-1 text-ink-soft">
              <span>
                Subtotal
              </span>

              <span>
                ৳{" "}
                {calculatedSubtotal.toFixed(
                  2
                )}
              </span>
            </div>

            <div className="flex justify-between py-1 text-ink-soft">
              <span>
                Shipping
              </span>

              <span>
                ৳{" "}
                {Number(
                  shippingRate
                ).toFixed(2)}
              </span>
            </div>

             <div className="flex justify-between py-1 text-ink-soft">
              <span>
                Coupon Discount
              </span>

              <span className="text-emerald-600">
                ৳ {(Number(calculatedSubtotal) * Number(selectedOrder.order.coupon_discount || 0)) / 100}
              </span>
            </div>

            <div className="flex justify-between py-1 text-ink-soft">
              <span>
                Discount
              </span>

              <span className="text-emerald-600">
                 ৳{" "}{Number(discount)}
              </span>
            </div>

            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">

              <span>
                Total
              </span>

              <span className="text-brand-pink">
                ৳{" "}
                {calculatedTotal.toFixed(
                  2
                )}
              </span>

            </div>

          </div>

        </div>

        {/* ====================================================== */}
        {/* FOOTER */}
        {/* ====================================================== */}

        <div className="mt-6 border-t border-border pt-4 text-center">

          <p className="text-xs text-ink-soft">
            Thank you for shopping with
            MomAndChild!
          </p>

          <p className="mt-1 text-[10px] text-ink-soft/70">
            Order {order.order_no} •{" "}
            {formattedDateTime}
          </p>

        </div>

      </div>
    </div>
  );
};

export default CustomerInvoice;