"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { monthlySales } from "@/lib/data";

export default function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={monthlySales} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97f7f" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#d97f7f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#ece4d8" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#58635f", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#58635f", fontSize: 12 }}
          tickFormatter={(v) => `$${v / 1000}k`}
        />
        <Tooltip
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #ece4d8",
            fontSize: 12.5,
          }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#d97f7f"
          strokeWidth={2.5}
          fill="url(#salesFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
