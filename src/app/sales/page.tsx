"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  CreditCard,
  Search,
  Filter,
  Receipt,
  Download,
  Printer,
  User,
  Scissors,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function SalesPage() {
  const { setSelectedVisitForReceipt, refreshTrigger, settings } = useApp();

  const [dateFilter, setDateFilter] = useState<string>("today");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        setLoading(true);
        const res = await fetch(`/api/visits?date=${dateFilter}`);
        const data = await res.json();
        setVisits(data.visits || []);
      } catch (err) {
        console.error("Fetch sales error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, [dateFilter, refreshTrigger]);

  const filteredVisits = visits.filter((v) => {
    const matchesMethod = methodFilter === "all" || v.paymentMethod === methodFilter;
    const matchesSearch =
      !searchTerm ||
      v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.barberName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  // Calculate Payment Method Breakdown
  let cashTotal = 0;
  let momoTotal = 0;
  let cardTotal = 0;

  visits.forEach((v) => {
    if (v.visitStatus === "cancelled") return;
    const amt = parseFloat(v.amount || "0");
    if (v.paymentMethod === "Cash") cashTotal += amt;
    else if (v.paymentMethod === "Mobile Money") momoTotal += amt;
    else if (v.paymentMethod === "Card") cardTotal += amt;
  });

  const grandTotal = cashTotal + momoTotal + cardTotal;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Sales & Payment Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full transaction history, payment breakdown, and printable receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Payment Methods Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Cash Sales</div>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {settings.currencySymbol || "GH₵"} {cashTotal.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Mobile Money (MoMo)</div>
          <div className="text-xl font-black text-blue-600 mt-1">
            {settings.currencySymbol || "GH₵"} {momoTotal.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Card Sales</div>
          <div className="text-xl font-black text-purple-600 mt-1">
            {settings.currencySymbol || "GH₵"} {cardTotal.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md">
          <div className="text-[11px] font-bold text-orange-400 uppercase">Total Sales</div>
          <div className="text-2xl font-black text-white mt-1">
            {settings.currencySymbol || "GH₵"} {grandTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
          >
            <option value="today">Today</option>
            <option value="all">All Time</option>
          </select>

          {/* Payment Method Filter */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {["all", "Cash", "Mobile Money", "Card"].map((method) => (
              <button
                key={method}
                onClick={() => setMethodFilter(method)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  methodFilter === method
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {method === "all" ? "All Methods" : method}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, receipt #, barber..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading sales records...</span>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No sales transactions found for selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Receipt #</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Barber</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 pr-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 font-mono">
                      {v.visitNumber}
                    </td>

                    <td className="p-4 text-slate-500">
                      {new Date(v.createdAt).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{v.customerName}</div>
                      <div className="text-[10px] text-slate-400">{v.customerPhone || "N/A"}</div>
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {v.serviceName}
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {v.barberName}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-full text-[10px]">
                        {v.paymentMethod}
                      </span>
                    </td>

                    <td className="p-4 font-black text-slate-900 text-sm">
                      {settings.currencySymbol || "GH₵"} {parseFloat(v.amount).toFixed(2)}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => setSelectedVisitForReceipt(v)}
                        className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
