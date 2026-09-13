"use client"
import React, { useState, useEffect } from 'react'
import Link from "next/link";
import { DollarSign, ShoppingBag, Users, PackageX } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusPill from "@/components/StatusPill";
import SalesChart from "@/components/charts/SalesChart";
import CategoryPie from "@/components/charts/CategoryPie";
import { dashboardStats, orders, products } from "@/lib/data";
import { Badge } from '@/components/Badge';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}
interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}
interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  customers: Customer[];
  monthlySales: { month: string; sales: number; orders: number }[];
  recentOrders: { id: number; customer: string; total: number; orderNo: string; paymentStatus: string; orderStatus: string }[];
  message?: string;
}

const Page = () => {

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true); setError("");
        const response = await fetch("/api/admin/dashboard", { method: "GET", cache: "no-store", });
        const result: DashboardResponse = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load dashboard");
        }
        setData(result);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setError(error instanceof Error ? error.message : "Failed to load dashboard");
      }
      finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <PageHeader title="Welcome back, Admin 👋" description={`Here's how MomAndChild is performing today, ${new Date().toLocaleDateString("en-US",  { month: "long",   day: "numeric",    year: "numeric",  }  )}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue this month"
          value={data?.stats.monthlyRevenue.toLocaleString()}
          change={dashboardStats.revenue.change}
          icon={DollarSign}
          tone="blush"
          prefix="$"
        />
        <StatCard
          label="Orders this month"
          value={data?.stats.monthlyOrders.toLocaleString()}
          change={dashboardStats.orders.change}
          icon={ShoppingBag}
          tone="sky"
        />
        <StatCard
          label="Total customers"
          value={data?.stats.totalCustomers.toLocaleString()}
          change={dashboardStats.customers.change}
          icon={Users}
          tone="sage"
        />
        <StatCard
          label="Products needing restock"
          value={data?.stats.totalProducts.toLocaleString()}
          change={dashboardStats.lowStock.change}
          icon={PackageX}
          tone="honey"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5 ">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[16px] font-semibold text-ink">Revenue overview</h2>
              <p className="text-[13px] text-ink-soft">Monthly sales, last 7 months</p>
            </div>
          </div>
          <div className="mt-2">
           {data?.monthlySales && <SalesChart monthlySales={data.monthlySales} />} 
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 ">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[16px] font-semibold text-ink">Recent orders</h2>
            <Link href="/admin/orders" className="text-[13px] font-semibold text-blush-deep hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-border text-ink-soft">
                  <th className="pb-2.5 font-medium">Order</th>
                  <th className="pb-2.5 font-medium">Total</th>
                  <th className="pb-2.5 font-medium">Payment</th>
                  <th className="pb-2.5 font-medium">Order</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium text-ink">{order.orderNo}</td>
                    <td className="py-2.5 text-ink-soft">{order.total}</td>
                    <td className="py-2.5 text-ink-soft"><Badge status={order.paymentStatus} /></td>
                    <td className="py-2.5"><Badge status={order.orderStatus} /> </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>
  )
}

export default Page