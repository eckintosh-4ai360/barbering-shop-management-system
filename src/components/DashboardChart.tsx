"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface DashboardChartProps {
  data: Array<{
    date: string;
    label: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export function DashboardChart({ data }: DashboardChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-xl"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium border border-dashed rounded-xl">
        No sales or expenses activity recorded for selected timeframe.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `GH₵${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderRadius: "12px",
              border: "none",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(val: any) => [`GH₵ ${parseFloat(val).toFixed(2)}`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            iconType="circle"
          />
          <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
          <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[6, 6, 0, 0]} barSize={24} />
          <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
