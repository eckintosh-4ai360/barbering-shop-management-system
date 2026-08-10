"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Camera,
  Upload,
} from "lucide-react";

const CATEGORY_OPTIONS = ["Haircut", "Beard", "Shave", "Combo", "Treatment"];

// ─── Reusable photo picker ─────────────────────────────────────────────────
function PhotoPicker({
  preview,
  onFile,
  onRemove,
  inputId,
}: {
  preview: string | null;
  onFile: (base64: string) => void;
  onRemove: () => void;
  inputId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => onFile(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Photo</label>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {preview ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-300 shadow-md">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
              <Camera className="w-7 h-7 text-slate-400" />
            </div>
          )}
          {preview && (
            <button
              type="button"
              onClick={() => { onRemove(); if (ref.current) ref.current.value = ""; }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex-1">
          <input ref={ref} id={inputId} type="file" accept="image/*" className="hidden" onChange={handleChange} />
          <label
            htmlFor={inputId}
            className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all w-full justify-center"
          >
            <Upload className="w-4 h-4" />
            {preview ? "Change Photo" : "Choose from File"}
          </label>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">JPG, PNG, WEBP · Max 3MB</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function WebsiteServicesPage() {
  const { refreshTrigger, triggerRefresh } = useApp();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [category, setCategory] = useState("Haircut");
  const [otherCategory, setOtherCategory] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/storefront/services");
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setServices(data.services || []);
        }
      } catch (err) {
        console.error("Fetch storefront services error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshTrigger]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDurationMinutes("30");
    setCategory("Haircut");
    setOtherCategory("");
    setImagePreview(null);
    setImageBase64(null);
    setIsActive(true);
    setError("");
  };

  const openAddModal = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (s: any) => {
    setEditing(s);
    setError("");
    setName(s.name);
    setDescription(s.description);
    setPrice((s.price / 100).toFixed(2));
    setDurationMinutes(String(s.durationMinutes || 30));
    if (CATEGORY_OPTIONS.includes(s.category)) {
      setCategory(s.category);
      setOtherCategory("");
    } else {
      setCategory("Other");
      setOtherCategory(s.category || "");
    }
    setImagePreview(s.imageUrl || null);
    setImageBase64(s.imageUrl || null);
    setIsActive(Boolean(s.isActive));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;

    try {
      setSubmitting(true);
      setError("");
      const url = editing ? `/api/storefront/services/${editing.id}` : "/api/storefront/services";
      const method = editing ? "PATCH" : "POST";
      const resolvedCategory = category === "Other" ? otherCategory.trim() || "Other" : category;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          durationMinutes,
          category: resolvedCategory,
          imageUrl: imageBase64 || "",
          isActive,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        triggerRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save service");
      }
    } catch (err) {
      console.error("Save storefront service error:", err);
      setError("Network or server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: any) => {
    if (!confirm(`Remove "${s.name}" from the public services menu? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/storefront/services/${s.id}`, { method: "DELETE" });
      if (res.ok) triggerRefresh();
    } catch (err) {
      console.error("Delete storefront service error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Website Services &amp; Pricing</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage the services, descriptions, and prices customers see on your public booking site
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-orange-400" />
          <span>+ Add Service</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading website services...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Store className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No services on the website yet</h3>
            <p className="text-xs text-slate-400">Add services so customers can browse and book them online.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Service</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => {
                  const active = Boolean(service.isActive);
                  return (
                    <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            {service.imageUrl && (
                              <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{service.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{service.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 font-semibold text-slate-700 rounded-full text-[11px]">
                          {service.category}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {service.durationMinutes} mins
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        GH₵ {(service.price / 100).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {active ? "Live" : "Hidden"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            className="p-1.5 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 my-8">
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">{editing ? "Edit Service" : "Add Website Service"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Photo picker */}
              <PhotoPicker
                inputId="service-image-input"
                preview={imagePreview}
                onFile={(b64) => { setImagePreview(b64); setImageBase64(b64); }}
                onRemove={() => { setImagePreview(null); setImageBase64(null); }}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Fade &amp; Lineup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="What's included in this service"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setOtherCategory(""); }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other...</option>
                  </select>
                  {category === "Other" && (
                    <input
                      type="text"
                      placeholder="Specify category"
                      value={otherCategory}
                      onChange={(e) => setOtherCategory(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                      required
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (GH₵) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="45.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-xs font-bold text-slate-700">
                  Visible on public website
                  <span className="block font-medium text-slate-400 normal-case">
                    Uncheck to hide this service without deleting it
                  </span>
                </span>
              </label>

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
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-60"
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
