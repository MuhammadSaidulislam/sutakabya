"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Search, Eye, FileText, Pencil, TruckIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { TablePage } from "@/components/TablePage";
import { Delivery, Order, OrderDetails } from "@/types/order";
import { Badge } from "@/components/Badge";
import { format } from "date-fns";
import CustomerInvoice from "@/components/CustomerInvoice";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import AddDelivery from "@/components/AddDelivery";


export default function OrdersPage() {

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState<Order[]>([]);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<Delivery | null>(null);


  const fetchOrders = useCallback(async () => {

    if (initialLoading) {
      setLoading(true);
    }

    const start = Date.now();

    try {
      const res = await fetch(
        `/api/admin/order?page=${page}&limit=${limit}&search=${search}`
      );

      const result = await res.json();

      if (result.success) {
        setOrders(result.data);
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
  }, [page, limit, search, invoiceModalOpen, deliveryModalOpen]);
  // User list
  useEffect(() => {
    startTransition(() => {
      fetchOrders();
    });
  }, [fetchOrders]);



  // Edit customer order
  const handleEditOrder = async (orderId: number) => {
    try {
      setOrderLoading(true);
      const res = await fetch(`/api/admin/order/${orderId}`);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch order");
      }


      let shippingAddress = null;

      if (result.data.order.shipping_address) {
        try {
          shippingAddress =
            typeof result.data.order.shipping_address === "string"
              ? JSON.parse(result.data.order.shipping_address)
              : result.data.order.shipping_address;
        } catch (error) {
          console.error("Invalid shipping address:", error);
          shippingAddress = null;
        }
      }

      // ============================================
      // Add shippingAddress to selected order
      // ============================================

      setSelectedOrder({
        ...result.data,
        shippingAddress,
      });

      setInvoiceModalOpen(true);

    } catch (error) {
      console.error("Get order error:", error);
      setSelectedOrder(null);
    } finally {
      setOrderLoading(false);
    }
  };

  // download pdf
  const handleDownload = async (orderId: number) => {
    try {

      const res = await fetch(`/api/admin/order/${orderId}`);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch order");
      }


      let shippingAddress = null;

      if (result.data.order.shipping_address) {
        try {
          shippingAddress =
            typeof result.data.order.shipping_address === "string"
              ? JSON.parse(result.data.order.shipping_address)
              : result.data.order.shipping_address;
        } catch (error) {
          console.error("Invalid shipping address:", error);
          shippingAddress = null;
        }
      }

      generateInvoicePDF({
        data: result.data,
        shippingAddress: shippingAddress || {},
      });

    } catch (error) {
      console.error("Get order error:", error);
      setSelectedOrder(null);
    } finally {
      setOrderLoading(false);
    }

  };

  // Delivery modal
  const handleDelivery = async (order: Order) => {
    setOrderId(order.order_no);
    setDeliveryModalOpen(true);
    setOrderLoading(true);

    try {
      const res = await fetch(`/api/admin/deliveries/${order.id}`);

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

  return (
    <div>
      <PageHeader title="Orders" description={`${orders.length} orders placed by customers`} />

      <div className="space-y-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU…"
              className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-ink-soft/50"
            />
          </div>

        </div>
        <TablePage title="Product categories" subtitle="Categories organizing your products" addLabel="Add category"
          headers={["ID", "User", "Items", "Quantity", "Amount", "Date", "Payment", "Order Status", "Actions"]}
          page={page}
          onAddClick={() => { }}
          setSearch={setSearch}
          search={search}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          rows={orders && orders.map(order => (
            <tr key={order.id} className="border-t border-border whitespace-nowrap">
              <td className="font-medium text-ink w-px whitespace-nowrap">{order.order_no}</td>
              <td className="w-px whitespace-nowrap">
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-semibold text-ink">{order.customer_name}</p>
                  <p className="text-[12.5px] text-ink-soft">{order.phone ? order.phone : order.email}</p>
                </div>
              </td>
              <td className="font-medium">{order.total_products}</td>
              <td className="font-medium">{order.total_qty}</td>
              <td className="font-medium text-ink text-nowrap">৳ {order.total}</td>
              <td>{order?.ordered_at ? format(new Date(order.ordered_at), "dd-MM-yyyy") : "N/A"}</td>
              <td><Badge status={order.payment_status} /></td>
              <td><Badge status={order.order_status} /></td>
              <td className="text-nowrap">
                <button onClick={() => handleEditOrder(order.id)} className="cursor-pointer rounded-lg p-2 text-ink-soft hover:bg-sky-deep hover:text-white">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleEditOrder(order.id)} className="cursor-pointer rounded-lg p-2 text-ink-soft hover:bg-sky-deep hover:text-white">
                  <Eye size={16} />
                </button>
                <button onClick={() => handleDownload(order.id)} className="cursor-pointer rounded-lg p-2 text-ink-400 hover:bg-sky-deep hover:text-white">
                  <FileText size={15} />
                </button>
                <button onClick={() => handleDelivery(order)} className="cursor-pointer rounded-lg p-2 text-ink-400 hover:bg-sky-deep hover:text-white">
                  <TruckIcon size={15} />
                </button>
              </td>
            </tr>
          ))}
        />
      </div>


      {invoiceModalOpen && <CustomerInvoice key={selectedOrder?.order.id ?? "none"} selectedOrder={selectedOrder} onClose={() => { setSelectedOrder(null); setInvoiceModalOpen(false); }} />}
      {deliveryModalOpen && <AddDelivery key={deliveryInfo?.id ?? `new-${orderId}`} orderId={orderId} delivery={deliveryInfo} onClose={() => { setDeliveryInfo(null); setDeliveryModalOpen(false); }} />}

    </div>
  );
}
