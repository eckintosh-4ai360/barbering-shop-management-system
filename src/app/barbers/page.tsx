"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Scissors,
  DollarSign,
  Percent,
  Phone,
  Loader2,
  X,
} from "lucide-react";

export default function BarbersPage() {
  const { refreshTrigger, triggerRefresh, settings, user } = useApp();

  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingBarber, setEditingBarber] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [commissionRate, setCommissionRate] = useState("40.00");
  const [specialties, setSpecialties] = useState("");
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Barbers with stats
  useEffect(() => {
    async function loadBarbers() {
      try {
        setLoading(true);
        const res = await fetch("/api/barbers");
        const data = await res.json();
        setBarbers(data.barbers || []);
      } catch (err) {
        console.error("Failed to fetch barbers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBarbers();
  }, [refreshTrigger]);

  const openAddModal = () => {
    setEditingBarber(null);
    setName("");
    setPhone("");
    setCommissionRate(settings.defaultCommissionRate || "40.00");
    setSpecialties("");
    setStatus("active");
    setShowModal(true);
  };

  const openEditModal = (barber: any) => {
    setEditingBarber(barber);
    setName(barber.name);
    setPhone(barber.phone);
    setCommissionRate(barber.commissionRate || "40.00");
    setSpecialties(barber.specialties || "");
    setStatus(barber.status || "active");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      setSubmitting(true);
      const url = editingBarber ? `/api/barbers/${editingBarber.id}` : "/api/barbers";
      const method = editingBarber ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, commissionRate, specialties, status }),
      });

      if (res.ok) {
        setShowModal(false);
        triggerRefresh();
      }
    } catch (err) {
      console.error("Save barber error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Barbers Roster & Performance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track individual barber revenue, customer counts, and commission payouts
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={openAddModal}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>+ Add Barber</span>
          </button>
        )}
      </div>

      {/* Barbers Performance Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading barber roster...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {barbers.map((barber) => {
            const isActive = barber.status === "active";
            const netSalonShare = barber.totalRevenue - barber.totalCommission;

            return (
              <div
                key={barber.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-base flex items-center justify-center shadow-md">
                      {barber.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{barber.name}</h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{barber.phone}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Specialty Pill */}
                {barber.specialties && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl font-medium border border-slate-100">
                    ✂️ {barber.specialties}
                  </div>
                )}

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customers Today</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">{barber.todayCustomers}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue Today</span>
                    <div className="text-lg font-black text-emerald-600 mt-0.5">
                      {settings.currencySymbol || "GH₵"} {barber.todayRevenue.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Commission ({barber.commissionRate}%)</span>
                    <div className="text-base font-bold text-purple-600 mt-0.5">
                      {settings.currencySymbol || "GH₵"} {barber.todayCommission.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Served</span>
                    <div className="text-base font-bold text-slate-800 mt-0.5">{barber.totalCustomers}</div>
                  </div>
                </div>

                {/* Total Stats Footer & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Total Revenue Generated: </span>
                    <span className="font-extrabold text-slate-900">
                      {settings.currencySymbol || "GH₵"} {barber.totalRevenue.toFixed(2)}
                    </span>
                  </div>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => openEditModal(barber)}
                      className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                      title="Edit Barber"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Barber Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingBarber ? "Edit Barber Profile" : "Add New Barber"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Michael Mensah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +233 24 555 0101"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-purple-700 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Specialties / Cut Styles
                </label>
                <input
                  type="text"
                  placeholder="e.g. Skin Fade, Beard Trim, Lineup"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  {submitting ? "Saving..." : "Save Barber"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
