"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { categorySplit } from "@/lib/data";

export default function CategoryPie() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <ResponsiveContainer width="100%" height={200} className="sm:!w-[180px]">
        <PieChart>
          <Pie
            data={categorySplit}
            dataKey="value"
            nameKey="name"
            innerRadius={54}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
          >
            {categorySplit.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} products`, name]}
            contentStyle={{ borderRadius: 12, border: "1px solid #ece4d8", fontSize: 12.5 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="grid w-full grid-cols-1 gap-2.5 sm:w-auto">
        {categorySplit.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-[13px] text-ink-soft">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-ink">{entry.name}</span>
            <span className="ml-auto font-medium text-ink-soft sm:ml-2">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
