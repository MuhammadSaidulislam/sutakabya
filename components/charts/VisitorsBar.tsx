"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { weeklyVisitors } from "@/lib/data";

export default function VisitorsBar() {
  const max = Math.max(...weeklyVisitors.map((d) => d.visitors));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={weeklyVisitors} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#ece4d8" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#58635f", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#58635f", fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [Number(value).toLocaleString(), "Visitors"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #ece4d8", fontSize: 12.5 }}
        />
        <Bar dataKey="visitors" radius={[8, 8, 8, 8]}>
          {weeklyVisitors.map((entry) => (
            <Cell key={entry.day} fill={entry.visitors === max ? "#d97f7f" : "#e8dfd1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
