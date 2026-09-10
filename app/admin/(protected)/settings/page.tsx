"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { ShippingRate } from "@/types/order";



export default function SettingsPage() {
  // ============================================================
  // STORE SETTINGS
  // ============================================================

  const [saved, setSaved] = useState(false);

  const [storeName, setStoreName] = useState("MomAndChild");
  const [supportEmail, setSupportEmail] = useState(
    "care@momandchild.com"
  );
  const [currency, setCurrency] = useState("BDT");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [storeAddress, setStoreAddress] = useState(
    "House 12, Road 4, Banani, Dhaka, Bangladesh"
  );

  // ============================================================
  // SHIPPING
  // ============================================================

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);

  const [showShippingForm, setShowShippingForm] =
    useState(false);

  const [editingShippingId, setEditingShippingId] =
    useState<number | null>(null);

  const [shippingName, setShippingName] = useState("");
  const [shippingRate, setShippingRate] = useState("");
  const [shippingStatus, setShippingStatus] =
    useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [shippingSaving, setShippingSaving] =
    useState(false);

  const [shippingMessage, setShippingMessage] =
    useState("");

  // ============================================================
  // FETCH SHIPPING RATES
  // ============================================================
const fetchShippingRates = useCallback(async () => {

     try {
      setShippingLoading(true);

      const response = await fetch(
        "/api/admin/shipping-rates"
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Failed to fetch shipping rates"
        );
      }

      setShippingRates(result.data || []);
    } catch (error) {
      console.error(
        "Fetch shipping rates error:",
        error
      );
    } finally {
      setShippingLoading(false);
    }
  }, []);


   useEffect(() => {
    startTransition(() => {
      fetchShippingRates();
    });
  }, [fetchShippingRates]);
 

  // ============================================================
  // STORE SETTINGS
  // ============================================================

  const handleSaveSettings = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // Your store settings API can go here.

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  // ============================================================
  // RESET SHIPPING FORM
  // ============================================================

  const resetShippingForm = () => {
    setShippingName("");
    setShippingRate("");
    setShippingStatus("ACTIVE");

    setEditingShippingId(null);
    setShowShippingForm(false);
    setShippingMessage("");
  };

  // ============================================================
  // EDIT SHIPPING
  // ============================================================

  const handleEditShipping = (
    shipping: ShippingRate
  ) => {
    setEditingShippingId(shipping.id);

    setShippingName(shipping.name);
    setShippingRate(String(shipping.rate));
    setShippingStatus(shipping.status);

    setShippingMessage("");
    setShowShippingForm(true);
  };

  // ============================================================
  // SAVE SHIPPING
  // ============================================================

  const handleSaveShipping = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!shippingName.trim()) {
      setShippingMessage(
        "Shipping name is required."
      );
      return;
    }

    const numericRate = Number(shippingRate);

    if (
      shippingRate === "" ||
      Number.isNaN(numericRate) ||
      numericRate < 0
    ) {
      setShippingMessage(
        "Please enter a valid shipping rate."
      );
      return;
    }

    try {
      setShippingSaving(true);
      setShippingMessage("");

      const isEditing =
        editingShippingId !== null;

      const url = isEditing
        ? `/api/admin/shipping-rates/${editingShippingId}`
        : "/api/admin/shipping-rates";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: shippingName.trim(),
          rate: numericRate,
          status: shippingStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Failed to save shipping rate"
        );
      }

      await fetchShippingRates();

      resetShippingForm();
    } catch (error) {
      console.error(
        "Save shipping rate error:",
        error
      );

      setShippingMessage(
        error instanceof Error
          ? error.message
          : "Failed to save shipping rate"
      );
    } finally {
      setShippingSaving(false);
    }
  };

  // ============================================================
  // DELETE SHIPPING
  // ============================================================

  const handleDeleteShipping = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this shipping rate?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/shipping-rates/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Failed to delete shipping rate"
        );
      }

      setShippingRates((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete shipping rate error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete shipping rate"
      );
    }
  };

  // ============================================================
  // TOGGLE SHIPPING STATUS
  // ============================================================

  const handleToggleShipping = async (
    shipping: ShippingRate
  ) => {
    try {
      const newStatus =
        shipping.status === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      const response = await fetch(
        `/api/admin/shipping-rates/${shipping.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: shipping.name,
            rate: Number(shipping.rate),
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Failed to update shipping status"
        );
      }

      setShippingRates((prev) =>
        prev.map((item) =>
          item.id === shipping.id
            ? {
              ...item,
              status: newStatus,
            }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Toggle shipping status error:",
        error
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      <PageHeader
        title="Store settings"
        description="Basic information shown to your customers"
      />
<section className="grid grid-cols-1 gap-5 md:grid-cols-2"> 
      {/* ====================================================== */}
      {/* STORE SETTINGS */}
      {/* ====================================================== */}
      <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6">
        <form onSubmit={handleSaveSettings} >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* STORE NAME */}

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink">
                Store name
              </label>

              <input
                value={storeName}
                onChange={(e) =>
                  setStoreName(e.target.value)
                }
                className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-blush-deep"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink">
                Support email
              </label>

              <input
                type="email"
                value={supportEmail}
                onChange={(e) =>
                  setSupportEmail(e.target.value)
                }
                className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-blush-deep"
              />
            </div>

          </div>

          {/* ADDRESS */}

          <div className="mt-4">
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Store address
            </label>

            <textarea
              rows={2}
              value={storeAddress}
              onChange={(e) =>
                setStoreAddress(e.target.value)
              }
              className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-blush-deep"
            />
          </div>

          {/* SAVE */}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-blush-deep px-5 py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
            >
              Save changes
            </button>

            {saved && (
              <span className="text-[13px] font-medium text-sage-deep">
                Settings saved
              </span>
            )}
          </div>
        </form>
      </div>


      {/* ====================================================== */}
      {/* SHIPPING RATES */}
      {/* ====================================================== */}

      <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6">
        {/* HEADER */}

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-[16px] font-semibold text-ink">
              Shipping rates
            </h2>

            <p className="mt-1 text-[12px] text-ink-soft">
              Manage delivery charges based on location.
            </p>
          </div>

          {!showShippingForm && (
            <button
              type="button"
              onClick={() => {
                resetShippingForm();
                setShowShippingForm(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blush-deep px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-blush-deep/90"
            >
              <Plus size={15} />
              Add rate
            </button>
          )}
        </div>

        {/* ==================================================== */}
        {/* SHIPPING FORM */}
        {/* ==================================================== */}

        {showShippingForm && (
          <form
            onSubmit={handleSaveShipping}
            className="mt-5 rounded-xl border border-border bg-cream p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-ink">
                {editingShippingId
                  ? "Edit shipping rate"
                  : "Add shipping rate"}
              </h3>

              <button
                type="button"
                onClick={resetShippingForm}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-surface hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* NAME */}

              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-[12px] font-medium text-ink">
                  Area
                </label>

                <input
                  value={shippingName}
                  onChange={(e) =>
                    setShippingName(
                      e.target.value
                    )
                  }
                  placeholder="Inside Dhaka"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] outline-none focus:border-blush-deep"
                />
              </div>

              {/* RATE */}

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-ink">
                  Shipping cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingRate}
                  onChange={(e) =>
                    setShippingRate(
                      e.target.value
                    )
                  }
                  placeholder="70"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] outline-none focus:border-blush-deep"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-ink">
                  Status
                </label>

                <select
                  value={shippingStatus}
                  onChange={(e) =>
                    setShippingStatus(
                      e.target.value as
                      | "ACTIVE"
                      | "INACTIVE"
                    )
                  }
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] outline-none focus:border-blush-deep"
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            {shippingMessage && (
              <p className="mt-3 text-[12px] font-medium text-red-500">
                {shippingMessage}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetShippingForm}
                className="rounded-xl border border-border px-4 py-2 text-[12px] font-semibold text-ink hover:bg-surface"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={shippingSaving}
                className="rounded-xl bg-blush-deep px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {shippingSaving
                  ? "Saving..."
                  : editingShippingId
                    ? "Update rate"
                    : "Add rate"}
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* SHIPPING LIST */}
        {/* ==================================================== */}

        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          {shippingLoading ? (
            <div className="px-4 py-8 text-center text-[12px] text-ink-soft">
              Loading shipping rates...
            </div>
          ) : shippingRates.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12px] text-ink-soft">
              No shipping rates found.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {shippingRates.map(
                (shipping) => (
                  <div
                    key={shipping.id}
                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                  >
                    {/* INFO */}

                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink">
                        {shipping.name}
                      </p>

                      <p className="mt-0.5 text-[12px] text-ink-soft">
                        Shipping cost: ৳{" "}
                        {Number(
                          shipping.rate
                        ).toFixed(2)}
                      </p>
                    </div>

                    {/* RIGHT */}

                    <div className="flex shrink-0 items-center gap-2">
                      {/* STATUS */}

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleShipping(
                            shipping
                          )
                        }
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${shipping.status ===
                            "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {shipping.status ===
                          "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleEditShipping(
                            shipping
                          )
                        }
                        className="rounded-lg p-2 text-ink-soft hover:bg-sky-deep hover:text-white"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteShipping(
                            shipping.id
                          )
                        }
                        className="rounded-lg p-2 text-ink-soft hover:bg-red-500 hover:text-white"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>


    </section>
     </div>
  );
}