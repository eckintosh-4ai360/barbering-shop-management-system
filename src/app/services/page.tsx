"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Store,
  Plus,
  Edit2,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Loader2,
  X,
} from "lucide-react";

export default function ServicesPage() {
  const { refreshTrigger, triggerRefresh, settings, user } = useApp();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Haircut");
  const [price, setPrice] = useState("");
  const [durationMin, setDurationMin] = useState("30");
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error("Fetch services error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [refreshTrigger]);

  const openAddModal = () => {
    setEditingService(null);
    setName("");
    setCategory("Haircut");
    setPrice("50.00");
    setDurationMin("30");
    setStatus("active");
    setShowModal(true);
  };

  const openEditModal = (s: any) => {
    setEditingService(s);
    setName(s.name);
    setCategory(s.category || "Haircut");
    setPrice(s.price);
    setDurationMin(String(s.durationMin || 30));
    setStatus(s.status || "active");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      setSubmitting(true);
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      const method = editingService ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, price, durationMin, status }),
      });

      if (res.ok) {
        setShowModal(false);
        triggerRefresh();
      }
    } catch (err) {
      console.error("Save service error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Services & Pricing Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure available grooming services, prices, and standard service durations
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={openAddModal}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>+ Add Service</span>
          </button>
        )}
      </div>

      {/* Services List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading services catalog...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Service Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Est. Duration</th>
                  <th className="p-4">Standard Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => {
                  const isActive = service.status === "active";

                  return (
                    <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <Store className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>{service.name}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 font-semibold text-slate-700 rounded-full text-[11px]">
                          {service.category || "Haircut"}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{service.durationMin} mins</span>
                        </span>
                      </td>

                      <td className="p-4 font-black text-slate-900 text-sm">
                        {settings.currencySymbol || "GH₵"} {parseFloat(service.price).toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        {user?.role === "admin" && (
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors font-semibold flex items-center gap-1 ml-auto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingService ? "Edit Service Offering" : "Create New Service"}
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
                  Service Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haircut + Beard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Haircut">Haircut</option>
                    <option value="Beard">Beard</option>
                    <option value="Combos">Combos</option>
                    <option value="Washing & Treatments">Washing & Treatments</option>
                    <option value="Kids">Kids</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Standard Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                  {submitting ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
