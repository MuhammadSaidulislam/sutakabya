"use client";

import { useState } from "react";
import { X, Truck, Loader2, CalendarDays } from "lucide-react";
import { Delivery, DeliveryStatus } from "@/types/order";

interface AddDeliveryProps {
  orderId: string;
  delivery?: Delivery | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddDelivery({
  orderId,
  delivery,
  onClose,
}: AddDeliveryProps) {
  const isEdit = !!delivery;
 console.log("delivery",delivery,isEdit)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [courierCompany, setCourierCompany] = useState(
    delivery?.courier_company || ""
  );

  const [deliveryDate, setDeliveryDate] = useState(
    delivery?.delivery_date
      ? delivery.delivery_date.split("T")[0]
      : ""
  );

  const [status, setStatus] = useState<DeliveryStatus>(
    delivery?.order_status || "PREPARING"
  );

  const handleSubmit = async () => {
    setError("");

    if (!courierCompany.trim()) {
      setError("Courier company is required");
      return;
    }

    if (!deliveryDate) {
      setError("Delivery date is required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        isEdit
          ? `/api/admin/deliveries/${delivery?.id}`
          : "/api/admin/deliveries",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(isEdit ? {} : { order_id: orderId }),
            courier_company: courierCompany.trim(),
            delivery_date: deliveryDate,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Failed to ${isEdit ? "update" : "create"} delivery`
        );
      }

      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck size={19} className="text-gray-700" />

              <h2 className="text-lg font-semibold text-gray-900">
                {isEdit ? "Edit Delivery" : "Add Delivery"}
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Order #{orderId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 px-6 py-5">

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Courier Company */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Courier Company
            </label>

            <div className="relative">
              <Truck
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={courierCompany}
                onChange={(e) =>
                  setCourierCompany(e.target.value)
                }
                placeholder="e.g. Steadfast"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Delivery Date
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                value={deliveryDate}
                onChange={(e) =>
                  setDeliveryDate(e.target.value)
                }
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Delivery Status
            </label>

            <select value={status}  onChange={(e) =>  setStatus(  e.target.value as DeliveryStatus )  }  disabled={loading}  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100">
              <option value="PREPARING">
                Preparing
              </option>

              <option value="SHIPPED">
                Shipped
              </option>

              <option value="OUT_FOR_DELIVERY">
                Out for Delivery
              </option>

              <option value="DELIVERED">
                Delivered
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Delivery"
              : "Create Delivery"}
          </button>
        </div>
      </div>
    </div>
  );
}