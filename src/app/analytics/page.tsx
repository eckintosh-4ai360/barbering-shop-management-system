"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  PieChart,
  Loader2,
  Printer,
} from "lucide-react";

export default function AnalyticsPage() {
  const { refreshTrigger, settings } = useApp();

  const [range, setRange] = useState<string>("month");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await fetch(`/api/reports?range=${range}`);
        const reportData = await res.json();
        setData(reportData);
      } catch (err) {
        console.error("Fetch report error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [range, refreshTrigger]);

  const financials = data?.financials || {
    totalRevenue: 0,
    totalExpenses: 0,
    totalCommissions: 0,
    netProfit: 0,
    shopNetProfit: 0,
    totalVisitsCount: 0,
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value (GH₵)"],
      ["Total Gross Revenue", financials.totalRevenue],
      ["Total Operational Expenses", financials.totalExpenses],
      ["Barber Commissions Paid", financials.totalCommissions],
      ["Salon Net Profit", financials.shopNetProfit],
      [],
      ["Service Name", "Count", "Revenue (GH₵)"],
      ...(data.servicesReport || []).map((s: any) => [s.serviceName, s.count, s.revenue]),
      [],
      ["Barber Name", "Clients Served", "Revenue", "Commission"],
      ...(data.barbersReport || []).map((b: any) => [b.barberName, b.count, b.revenue, b.commission]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Barber_Report_${range}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Analytics & Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Financial P&L statements, service popularity, barber commissions, and sales breakdowns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Timeframe Switcher */}
      <div className="flex items-center gap-1 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs w-fit">
        {[
          { id: "today", label: "Today" },
          { id: "week", label: "This Week" },
          { id: "month", label: "This Month" },
          { id: "year", label: "This Year" },
          { id: "all", label: "All Time" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setRange(t.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              range === t.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Financial P&L Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {settings.currencySymbol || "GH₵"} {financials.totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{financials.totalVisitsCount} visits recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Barber Commissions</span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {settings.currencySymbol || "GH₵"} {financials.totalCommissions.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Barber payouts share</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Operational Expenses</span>
          <div className="text-2xl font-black text-orange-600 mt-1">
            {settings.currencySymbol || "GH₵"} {financials.totalExpenses.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Rent, electricity, supplies</span>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md">
          <span className="text-xs font-bold text-orange-400 uppercase">Net Salon Profit</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {settings.currencySymbol || "GH₵"} {financials.shopNetProfit.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-300 mt-1 block">Revenue - Commissions - Expenses</span>
        </div>
      </div>

      {/* Breakdown Tables (Services Popularity & Barber Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Popularity Report */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Scissors className="w-4 h-4 text-orange-500" />
            <span>Most Popular Services</span>
          </h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading services report...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-3">Service Name</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.servicesReport || []).map((s: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{s.serviceName}</td>
                      <td className="p-3 font-semibold text-slate-600">{s.count} haircuts</td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {settings.currencySymbol || "GH₵"} {s.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Barber Performance Report */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Barber Sales & Commission Report</span>
          </h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading barber report...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-3">Barber</th>
                    <th className="p-3">Clients</th>
                    <th className="p-3">Revenue</th>
                    <th className="p-3 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.barbersReport || []).map((b: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{b.barberName}</td>
                      <td className="p-3 font-semibold text-slate-600">{b.count}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {settings.currencySymbol || "GH₵"} {b.revenue.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-black text-purple-600">
                        {settings.currencySymbol || "GH₵"} {b.commission.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
