
"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Search, TruckIcon } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { TablePage } from "@/components/TablePage";
import { Badge } from "@/components/Badge";
import { format } from "date-fns";
import AddDelivery from "@/components/AddDelivery";
import { Delivery } from "@/types/order";

type DeliveryStatus =
  | "PREPARING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";


const statuses: DeliveryStatus[] = [
  "PREPARING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED"
];


const formatStatus = (
  status: DeliveryStatus
) => {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};


export default function DeliveryPage() {
  // ============================================================
  // STATE
  // ============================================================

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [orderLoading, setOrderLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<Delivery | null>(null);
  // ============================================================
  // FETCH DELIVERIES
  // ============================================================

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));

      params.set("limit", String(limit));

      if (search.trim()) { params.set("search", search.trim()); }

      if (statusFilter !== "All") {
        params.set("delivery_status", statusFilter);
      }

      const response = await fetch(`/api/admin/deliveries?${params.toString()}`);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch deliveries");
      }

      setDeliveries(result.data || []);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);

    } catch (error) {
      console.error(
        "Get deliveries error:",
        error
      );

      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, deliveryModalOpen]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    startTransition(() => {
      fetchDeliveries();
    });
  }, [fetchDeliveries]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const handleStatusFilter = (
    value: string
  ) => {
    setStatusFilter(value);
    setPage(1);
  };



  // Delivery modal
  const handleDelivery = async (delivery: Delivery) => {
    setOrderId(delivery.order_no);
    setDeliveryModalOpen(true);
    setOrderLoading(true);

    try {
      const res = await fetch(`/api/admin/deliveries/${delivery.order_id}`);

      const result = await res.json();

      if (!res.ok || !result.success) {
        setDeliveryInfo(null);
        return;
      }

      setDeliveryInfo(result.data);
    } catch (error) {
      console.error("Get delivery error:", error);
      setDeliveryInfo(null);
    } finally {
      setOrderLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      <PageHeader title="Delivery tracking" description={`${totalItems} shipments currently on the board`} />

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
          <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by order ID or courier…" className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-ink-soft/50 outline-none" />
        </div>

        {/* Status */}
        <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)} className="rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[13.5px] text-ink outline-none sm:w-52"   >
          <option value="All">
            All statuses
          </option>

          {statuses.map(
            (status) => (
              <option key={status} value={status}  >
                {formatStatus(status)}
              </option>
            ))}
        </select>
      </div>


      {/* Delivery Cards */}

      <TablePage title="Deliveries List" subtitle="All the deliveries list" addLabel="Add category"
        headers={["Order No", "Customer", "Courier name", "Sub total", "Shipping rate", "Delivery date", "Payment", "Order Status", "Actions"]}
        page={page}
        onAddClick={() => { }}
        setSearch={setSearch}
        search={search}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        rows={deliveries && deliveries.map(delivery => (
          <tr key={delivery.id} className="border-t border-border whitespace-nowrap">
            <td className="font-medium text-ink w-px whitespace-nowrap">{delivery.order_no || `#${delivery.order_id}`}</td>
            <td className="w-px whitespace-nowrap">
              <div className="min-w-0">
                <p className="truncate font-display text-[15px] font-semibold text-ink">{delivery.customer_name}</p>
                <p className="text-[12.5px] text-ink-soft">{delivery.customer_phone}</p>
              </div>
            </td>
            <td className="font-medium">{delivery.courier_company || "Courier not assigned"}</td>
            <td className="font-medium">৳ {delivery.subtotal}</td>
            <td className="font-medium">৳ {delivery.shipping_rate}</td>
            <td>{delivery.delivery_date ? format(new Date(delivery.delivery_date), "dd-MM-yyyy") : "N/A"}</td>
            <td><Badge status={delivery.payment_status} /></td>
            <td><Badge status={delivery.order_status} /></td>
            <td>
              <button onClick={() => handleDelivery(delivery)} className="cursor-pointer rounded-lg p-2 text-ink-400 hover:bg-sky-deep hover:text-white">
                <TruckIcon size={15} />
              </button>
            </td>
          </tr>
        ))}
      />

      {deliveryModalOpen && <AddDelivery key={deliveryInfo?.id ?? `new-${orderId}`} orderId={orderId} delivery={deliveryInfo} onClose={() => { setDeliveryInfo(null); setDeliveryModalOpen(false); }} />}

    </div>
  );
}
