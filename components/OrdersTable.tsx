import { Order, OrderDetails } from '@/types/order';
import React, { useState } from 'react';
import { Badge } from './Badge';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatPrice';
import InvoiceModal from './InvoiceModal';
import OrderInvoice from './OrderInvoice';

interface OrdersTableProps {
    search: string;
    status: string;
     setSearch: React.Dispatch<React.SetStateAction<string>>;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    setPage: React.Dispatch<React.SetStateAction<number>>;
    page: number;
    limit: number;
    orders: Order[];
    handleViewOrder: (id: number) => void;
}

const OrdersTable = ({ search, setSearch,status, setStatus, pagination, setPage, page, limit, orders, handleViewOrder }: OrdersTableProps) => {


    return (
        <div className="divide-y divide-cream">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative w-full sm:max-w-sm">
                    <svg
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" strokeLinecap="round" />
                    </svg>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search order number..."
                        className="
        h-11 w-full rounded-full
        border border-ink-200
        bg-white
        pl-11 pr-10
        text-sm text-brand-ink
        placeholder:text-ink-400
        outline-none
        transition-all duration-200
        focus:border-brand-ink
        focus:ring-1 focus:ring-brand-ink/10
      "
                    />

                    {/* Clear */}
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setPage(1);
                            }}
                            className="
          absolute right-3 top-1/2
          flex h-7 w-7
          -translate-y-1/2
          items-center justify-center
          rounded-full
          text-ink-400
          transition-colors
          hover:bg-cream
          hover:text-brand-ink
        "
                            aria-label="Clear search"
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path
                                    d="M6 6l12 12M18 6 6 18"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Status */}
                <div className="relative w-full sm:w-48">
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="
        h-11 w-full
        appearance-none
        rounded-full
        border border-ink-200
        bg-white
        px-4 pr-10
        text-xs
        font-medium
        uppercase
        tracking-[0.12em]
        text-brand-ink
        outline-none
        transition-all duration-200
        focus:border-brand-ink
        focus:ring-1 focus:ring-brand-ink/10
      "
                    >
                        <option value="All">All Orders</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="RETURN">Return</option>
                    </select>

                    <svg
                        className="
        pointer-events-none
        absolute right-4 top-1/2
        h-3.5 w-3.5
        -translate-y-1/2
        text-ink-400
      "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            d="m6 9 6 6 6-6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
            {orders.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg
                    viewBox="0 0 200 200"
                    className="h-36 w-36"
                    fill="none"
                >
                    <path
                        d="M28 140c10-30 30-45 55-48"
                        stroke="#C6A15B"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.55"
                    />
                    <path
                        d="M172 140c-10-30-30-45-55-48"
                        stroke="#C6A15B"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.55"
                    />
                    <path
                        d="M40 70l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
                        fill="#F16C8B"
                        opacity="0.5"
                    />
                    <path
                        d="M162 60l2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5z"
                        fill="#C6A15B"
                        opacity="0.6"
                    />
                    <path
                        d="M150 130l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
                        fill="#F16C8B"
                        opacity="0.4"
                    />
                    <path
                        d="M75 78v-8c0-14 11-25 25-25s25 11 25 25v8"
                        stroke="#C6A15B"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M62 78h76l7 88a6 6 0 0 1-6 6H61a6 6 0 0 1-6-6l7-88z"
                        fill="#FBF3EC"
                        stroke="#C6A15B"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M100 140c-14-10-22-18-22-28a13 13 0 0 1 22-9 13 13 0 0 1 22 9c0 10-8 18-22 28z"
                        fill="#F16C8B"
                    />
                </svg>

                <h3 className="mt-5 font-display text-lg font-semibold text-brand-ink">
                    Your orders await
                </h3>

                <p className="mt-1 text-sm text-brand-muted">
                    You haven&apos;t placed an order yet.
                </p>
            </div> : <>
            {orders.map((order, index) => (
                <div
                    key={order.id}
                    className="group relative py-3 first:pt-2 last:pb-2"
                >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        {/* Number */}
                        <div className="hidden w-10 shrink-0 sm:block">
                            <span className="font-serif text-xs text-ink-300">
                                {String((page - 1) * limit + index + 1).padStart(2, "0")}
                            </span>
                        </div>

                        {/* Order */}
                        <div className="flex-1">
                            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-ink-400">
                                Order Number
                            </p>

                            <p className="mt-1 font-display text-base font-semibold tracking-wide text-brand-ink">
                                #{order.order_no}
                            </p>

                            <p className="mt-1 text-xs text-brand-muted">
                                {order.items_total}{" "}
                                {Number(order.items_total) === 1 ? "item" : "items"}
                            </p>
                        </div>

                        {/* Date */}
                        <div className="sm:w-32">
                            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-ink-400">
                                Date
                            </p>

                            <p className="mt-1 text-sm text-ink-600">
                                {new Date(order.ordered_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="sm:w-32">
                            <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-ink-400">
                                Status
                            </p>

                            <Badge status={order.order_status} />
                        </div>

                        {/* Price */}
                        <div className="sm:w-28 sm:text-right">
                            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-ink-400">
                                Total
                            </p>

                            <p className="mt-1 font-display text-sm font-semibold text-brand-ink">
                                {formatPrice(Number(order.total))}
                            </p>
                        </div>

                        {/* Action */}
                        <button
                            onClick={() => handleViewOrder(order.id)}
                            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-ink transition-colors hover:text-coral-500 sm:ml-4"
                        >
                            Details

                            <span
                                className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-ink-200
              transition-all duration-300
              group-hover:border-coral-300
              group-hover:bg-coral-50
            "
                            >
                                <svg
                                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        d="M5 12h14M13 6l6 6-6 6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            ))}

            {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-cream pt-5">
                    <button
                        disabled={!pagination.hasPrev}
                        onClick={() => setPage((prev) => prev - 1)}
                        className="text-xs font-medium uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Previous
                    </button>

                    <span className="text-xs text-brand-muted">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                        disabled={!pagination.hasNext}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="text-xs font-medium uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            )}
            </>}
            
        </div>
    );
};

export default OrdersTable;