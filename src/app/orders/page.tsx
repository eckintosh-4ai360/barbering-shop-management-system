"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Globe,
  Search,
  Loader2,
  Calendar,
  ShoppingBag,
  Clock,
} from "lucide-react";

interface OrderItem {
  id: number;
  itemType: string;
  itemName: string;
  price: number;
  quantity: number;
}

interface OnlineOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  totalAmount: number;
  tipAmount: number;
  status: string;
  paymentStatus: string;
  beveragePreference: string | null;
  specialNotes: string | null;
  barber?: { name: string; title: string } | null;
  items: OrderItem[];
}

const STATUS_OPTIONS = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OnlineOrdersPage() {
  const { user, settings, refreshTrigger, triggerRefresh } = useApp();

  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch online orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search, refreshTrigger]);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, updatedByName: user?.name, userId: user?.id }),
      });
      if (res.ok) {
        triggerRefresh();

        // Fire SMS & Email notification to customer for status updates
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, trigger: status }),
        }).catch((err) => console.error("Auto notify error:", err));
      }
    } catch (err) {
      console.error("Update order status error:", err);
    }
  };

  const currency = settings.currencySymbol || "GH₵";
  const money = (cents: number) => `${currency} ${(cents / 100).toFixed(2)}`;

  const activeCount = orders.filter((o) => o.status === "confirmed" || o.status === "in_progress").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.totalAmount : 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-500" />
            Online Orders
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bookings and purchases placed through the client website, synced live from the shared database.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</div>
          <div className="text-xl font-black text-slate-900 mt-1">{orders.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Active Bookings</div>
          <div className="text-xl font-black text-blue-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Completed</div>
          <div className="text-xl font-black text-emerald-600 mt-1">{completedCount}</div>
        </div>
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md">
          <div className="text-[11px] font-bold text-orange-400 uppercase">Total Revenue</div>
          <div className="text-2xl font-black text-white mt-1">{money(totalRevenue)}</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, order code, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading online orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No online orders found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Order Code</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Appointment</th>
                  <th className="p-4">Barber</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors align-top">
                    <td className="p-4 pl-6 font-bold text-slate-900 font-mono">#{o.orderCode}</td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400">{o.customerPhone}</div>
                      <div className="text-[10px] text-slate-400">{o.customerEmail}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {o.appointmentDate}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {o.appointmentTime}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {o.barber ? o.barber.name : "Any Available"}
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1 mb-0.5 text-[10px] text-slate-400">
                        <ShoppingBag className="w-3 h-3" />
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </div>
                      {o.items.map((it) => (
                        <div key={it.id} className="text-[11px]">
                          {it.itemName} {it.quantity > 1 ? `×${it.quantity}` : ""}
                        </div>
                      ))}
                    </td>

                    <td className="p-4 font-black text-slate-900 text-sm">{money(o.totalAmount)}</td>

                    <td className="p-4 pr-6">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border outline-none capitalize ${
                          STATUS_COLORS[o.status] || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
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
