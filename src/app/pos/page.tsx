"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Scissors,
  PlusCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  Receipt,
  UserCheck,
  AlertCircle,
  Loader2,
  Play,
} from "lucide-react";

export default function POSPage() {
  const { setOpenWalkInModal, setSelectedVisitForReceipt, refreshTrigger, settings } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch Today's Visits
  useEffect(() => {
    async function fetchVisits() {
      try {
        setLoading(true);
        const res = await fetch("/api/visits?date=today");
        const data = await res.json();
        setVisits(data.visits || []);
      } catch (err) {
        console.error("Failed to fetch visits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisits();
  }, [refreshTrigger]);

  // Handle Visit Status Update
  const handleUpdateStatus = async (visitId: number, newStatus: string) => {
    try {
      setUpdatingId(visitId);
      const res = await fetch(`/api/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitStatus: newStatus }),
      });

      if (res.ok) {
        setVisits((prev) =>
          prev.map((v) => (v.id === visitId ? { ...v, visitStatus: newStatus } : v))
        );
      }
    } catch (err) {
      console.error("Failed to update visit status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculations
  const totalToday = visits.length;
  const completedCount = visits.filter((v) => v.visitStatus === "completed").length;
  const waitingCount = visits.filter((v) => v.visitStatus === "waiting").length;
  const inProgressCount = visits.filter((v) => v.visitStatus === "in_progress").length;

  const totalRevenueToday = visits
    .filter((v) => v.visitStatus !== "cancelled")
    .reduce((sum, v) => sum + parseFloat(v.amount || "0"), 0);

  // Filtered List
  const filteredVisits = visits.filter((v) => {
    const matchesStatus = filterStatus === "all" || v.visitStatus === filterStatus;
    const matchesSearch =
      !searchTerm ||
      v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.customerPhone.includes(searchTerm) ||
      v.visitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Walk-ins & Front Desk Queue</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Register incoming walk-in clients, assign barbers, and issue receipts
          </p>
        </div>

        <button
          onClick={() => setOpenWalkInModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Walk-in</span>
        </button>
      </div>

      {/* Today's Summary Metric Bar (Prompt #3 requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customers Today</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalToday}</div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{completedCount}</div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Waiting in Queue</span>
          <div className="text-2xl font-black text-amber-800 mt-1">{waitingCount}</div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-black text-blue-800 mt-1">{inProgressCount}</div>
        </div>

        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Revenue Today</span>
          <div className="text-xl font-black text-purple-900 mt-1">
            {settings.currencySymbol || "GH₵"} {totalRevenueToday.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `All (${totalToday})` },
            { id: "waiting", label: `Waiting (${waitingCount})` },
            { id: "in_progress", label: `In Progress (${inProgressCount})` },
            { id: "completed", label: `Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, receipt #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Customer Queue & Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading walk-in Queue...</span>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No walk-in records matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Customer</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Barber</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map((visit) => {
                  const isUpdating = updatingId === visit.id;

                  return (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Customer */}
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900 text-sm">{visit.customerName}</div>
                        <div className="text-[11px] text-slate-400">
                          {visit.customerPhone || "No Phone"} • {visit.visitNumber}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{visit.serviceName}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(visit.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Barber */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{visit.barberName}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-slate-900 text-sm">
                        {settings.currencySymbol || "GH₵"} {parseFloat(visit.amount).toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 font-semibold text-slate-700 rounded text-[11px]">
                          {visit.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {visit.visitStatus === "waiting" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Waiting
                          </span>
                        )}
                        {visit.visitStatus === "in_progress" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                            <Scissors className="w-3 h-3" /> In Progress
                          </span>
                        )}
                        {visit.visitStatus === "completed" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {visit.visitStatus === "cancelled" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {visit.visitStatus === "waiting" && (
                            <button
                              onClick={() => handleUpdateStatus(visit.id, "in_progress")}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Play className="w-3 h-3" /> Start
                            </button>
                          )}

                          {(visit.visitStatus === "waiting" || visit.visitStatus === "in_progress") && (
                            <button
                              onClick={() => handleUpdateStatus(visit.id, "completed")}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedVisitForReceipt(visit)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Receipt className="w-3 h-3" /> Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
