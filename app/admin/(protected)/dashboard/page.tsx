import React from 'react'
import Link from "next/link";
import { DollarSign, ShoppingBag, Users, PackageX } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusPill from "@/components/StatusPill";
import ProductThumb from "@/components/ProductThumb";
import SalesChart from "@/components/charts/SalesChart";
import CategoryPie from "@/components/charts/CategoryPie";
import VisitorsBar from "@/components/charts/VisitorsBar";
import { dashboardStats, orders, products } from "@/lib/data";

const Page = () => {
    const recentOrders = orders.slice(0, 5);
  const lowStock = products.filter((p) => p.status !== "In Stock").slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Welcome back, Rima 👋"
        description="Here's how MomAndChild is performing today, July 11, 2026."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue this month"
          value={dashboardStats.revenue.value.toLocaleString()}
          change={dashboardStats.revenue.change}
          icon={DollarSign}
          tone="blush"
          prefix="$"
        />
        <StatCard
          label="Orders this month"
          value={dashboardStats.orders.value.toLocaleString()}
          change={dashboardStats.orders.change}
          icon={ShoppingBag}
          tone="sky"
        />
        <StatCard
          label="Active customers"
          value={dashboardStats.customers.value.toLocaleString()}
          change={dashboardStats.customers.change}
          icon={Users}
          tone="sage"
        />
        <StatCard
          label="Products needing restock"
          value={dashboardStats.lowStock.value.toString()}
          change={dashboardStats.lowStock.change}
          icon={PackageX}
          tone="honey"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[16px] font-semibold text-ink">Revenue overview</h2>
              <p className="text-[13px] text-ink-soft">Monthly sales, last 7 months</p>
            </div>
          </div>
          <div className="mt-2">
            <SalesChart />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-[16px] font-semibold text-ink">Sales by category</h2>
          <p className="text-[13px] text-ink-soft">Share of products sold</p>
          <div className="mt-4">
            <CategoryPie />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[16px] font-semibold text-ink">Recent orders</h2>
            <Link href="/orders" className="text-[13px] font-semibold text-blush-deep hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-border text-ink-soft">
                  <th className="pb-2.5 font-medium">Order</th>
                  <th className="pb-2.5 font-medium">Customer</th>
                  <th className="pb-2.5 font-medium">Total</th>
                  <th className="pb-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium text-ink">{order.id}</td>
                    <td className="py-2.5 text-ink-soft">{order.customer}</td>
                    <td className="py-2.5 text-ink-soft">${order.total.toFixed(2)}</td>
                    <td className="py-2.5">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[16px] font-semibold text-ink">Restock list</h2>
            <Link href="/products" className="text-[13px] font-semibold text-blush-deep hover:underline">
              View all
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                {/* <ProductThumb image={product.image} /> */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">{product.name}</p>
                  <p className="text-[12px] text-ink-soft">{product.stock} left in stock</p>
                </div>
                <StatusPill status={product.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-[16px] font-semibold text-ink">Storefront visitors</h2>
        <p className="text-[13px] text-ink-soft">Traffic over the last 7 days</p>
        <div className="mt-2">
          <VisitorsBar />
        </div>
      </div>
    </div>
  )
}

export default Page