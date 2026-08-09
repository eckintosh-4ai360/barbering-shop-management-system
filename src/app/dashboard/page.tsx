"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/StatCard";
import { QuickActionsPanel } from "@/components/QuickActionsPanel";
import { DashboardChart } from "@/components/DashboardChart";
import {
  Users,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  PlusCircle,
  Receipt,
  Eye,
  Calendar,
  DollarSign,
  BarChart3,
  Scissors,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { refreshTrigger, setOpenWalkInModal, setSelectedVisitForReceipt, user, settings } = useApp();

  const [range, setRange] = useState<string>("today");
  const [stats, setStats] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Dashboard Stats & Recent Visits
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsRes, visitsRes] = await Promise.all([
          fetch(`/api/dashboard/stats?range=${range}`),
          fetch(`/api/visits?date=${range === "today" ? "today" : "all"}&limit=10`),
        ]);

        const statsData = statsRes.ok ? await statsRes.json().catch(() => ({})) : {};
        const visitsData = visitsRes.ok ? await visitsRes.json().catch(() => ({})) : {};

        setStats(statsData);
        setRecentVisits((visitsData.visits || []).slice(0, 8));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [range, refreshTrigger]);

  const summary = stats?.summary || {
    totalCustomers: 0,
    completedCount: 0,
    waitingCount: 0,
    inProgressCount: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  };

  const paymentBreakdown = stats?.paymentBreakdown || {
    cash: 0,
    momo: 0,
    card: 0,
    total: 0,
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-[#182232] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5" />
              Good day, {user?.name || "E-Shop Barbers"}!
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back to your dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Here&apos;s what&apos;s happening with your barbershop operations today.
            </p>
          </div>

          <button
            onClick={() => setOpenWalkInModal(true)}
            className="self-start md:self-auto bg-white hover:bg-slate-100 text-slate-900 font-bold px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>+ New Walk-in</span>
          </button>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Timeframe Filter Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="text-xs font-bold text-slate-600 px-3 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Filter Timeframe:
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
            { id: "last_month", label: "Last Month" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                range === t.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Cards Grid (Replicating exact colors and style from uploaded image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Customers */}
        <StatCard
          title="Total Walk-ins"
          value={loading ? "..." : summary.totalCustomers}
          subtitle={`${summary.waitingCount} waiting • ${summary.completedCount} completed`}
          icon={Users}
          variant="blue"
        />

        {/* Card 2: Completed Sales */}
        <StatCard
          title="Completed Services"
          value={loading ? "..." : summary.completedCount}
          subtitle={`Out of ${summary.totalCustomers} visits recorded`}
          icon={ShoppingBag}
          variant="emerald"
        />

        {/* Card 3: Revenue */}
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : `${settings.currencySymbol || "GH₵"} ${summary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle="Gross revenue collected"
          icon={CreditCard}
          variant="purple"
        />

        {/* Card 4: Net Profit */}
        <StatCard
          title="Net Profit"
          value={loading ? "..." : `${settings.currencySymbol || "GH₵"} ${summary.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`Revenue (${settings.currencySymbol} ${summary.totalRevenue}) - Expenses (${settings.currencySymbol} ${summary.totalExpenses})`}
          icon={TrendingUp}
          variant="orange"
        />
      </div>

      {/* Main Grid: 2-Column Split (Left 70% / Right 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Walk-ins & Transactions Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Recent Walk-ins & Sales</h3>
                <p className="text-xs text-slate-400">Latest customer activity and status</p>
              </div>

              <Link
                href="/sales"
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View all</span>
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading recent sales...</span>
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recent visits recorded. Click <strong>+ New Walk-in</strong> to register a customer.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentVisits.map((visit) => {
                  const statusColors: Record<string, string> = {
                    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    waiting: "bg-amber-50 text-amber-700 border-amber-200",
                    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
                    cancelled: "bg-red-50 text-red-700 border-red-200",
                  };

                  const statusLabels: Record<string, string> = {
                    completed: "Paid",
                    waiting: "Waiting",
                    in_progress: "In Progress",
                    cancelled: "Cancelled",
                  };

                  return (
                    <div
                      key={visit.id}
                      onClick={() => setSelectedVisitForReceipt(visit)}
                      className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                          <Receipt className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-800">
                              {visit.customerName}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              #{visit.visitNumber}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {visit.serviceName} • Barber: <span className="text-slate-700 font-semibold">{visit.barberName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            statusColors[visit.visitStatus] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {statusLabels[visit.visitStatus] || visit.visitStatus}
                        </span>

                        <div className="text-right">
                          <div className="font-extrabold text-sm text-slate-900">
                            {settings.currencySymbol || "GH₵"} {parseFloat(visit.amount).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {visit.paymentMethod}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Revenue vs Expenses vs Profit Visual Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Financial Overview</h3>
                <p className="text-xs text-slate-400">Revenue, Expenses and Net Profit breakdown</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span> Revenue
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 ml-2"></span> Expenses
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2"></span> Net Profit
              </div>
            </div>

            <DashboardChart data={stats?.chartData || []} />
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <QuickActionsPanel />

          {/* Payment Methods Breakdown Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Payment Methods Today</h3>
              <span className="text-[11px] text-slate-400 font-semibold">Reconciliation</span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Cash Sales", amount: paymentBreakdown.cash, color: "bg-emerald-500", icon: "💵" },
                { label: "Mobile Money (MoMo)", amount: paymentBreakdown.momo, color: "bg-blue-500", icon: "📱" },
                { label: "Card Sales", amount: paymentBreakdown.card, color: "bg-purple-500", icon: "💳" },
              ].map((pm) => {
                const total = paymentBreakdown.total || 1;
                const pct = Math.min(100, Math.round((pm.amount / total) * 100));

                return (
                  <div key={pm.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>{pm.icon}</span>
                        <span>{pm.label}</span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {settings.currencySymbol || "GH₵"} {pm.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pm.color} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">Total Collected:</span>
              <span className="text-slate-900 text-sm">
                {settings.currencySymbol || "GH₵"} {paymentBreakdown.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
