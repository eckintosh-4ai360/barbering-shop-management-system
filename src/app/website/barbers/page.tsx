"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Star,
  Loader2,
  X,
  Phone,
  CheckCircle,
  XCircle,
  Camera,
  Upload,
} from "lucide-react";

// ─── Reusable photo picker UI ────────────────────────────────────────────────
function PhotoPicker({
  preview,
  onFile,
  onRemove,
  error,
  inputId,
}: {
  preview: string | null;
  onFile: (base64: string) => void;
  onRemove: () => void;
  error: string | null;
  inputId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => onFile(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
        Photo
      </label>
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
              title="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={ref}
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
          <label
            htmlFor={inputId}
            className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all w-full justify-center"
          >
            <Upload className="w-4 h-4" />
            {preview ? "Change Photo" : "Choose from File"}
          </label>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            JPG, PNG, WEBP · Max 3MB
          </p>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium mt-1.5">{error}</p>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function WebsiteBarbersPage() {
  const { refreshTrigger, triggerRefresh } = useApp();

  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [rating, setRating] = useState("5.00");
  const [yearsExperience, setYearsExperience] = useState("5");
  const [specialties, setSpecialties] = useState("");
  const [phone, setPhone] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/storefront/barbers");
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setBarbers(data.barbers || []);
        }
      } catch (err) {
        console.error("Fetch storefront barbers error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshTrigger]);

  const openAddModal = () => {
    setEditing(null);
    setError("");
    setName("");
    setTitle("");
    setBio("");
    setAvatarPreview(null);
    setAvatarBase64(null);
    setPhotoError(null);
    setRating("5.00");
    setYearsExperience("5");
    setSpecialties("");
    setPhone("");
    setIsAvailable(true);
    setShowModal(true);
  };

  const openEditModal = (b: any) => {
    setEditing(b);
    setError("");
    setName(b.name);
    setTitle(b.title);
    setBio(b.bio);
    setAvatarPreview(b.avatarUrl || null);
    setAvatarBase64(b.avatarUrl || null);
    setPhotoError(null);
    setRating(String(b.rating ?? "5.00"));
    setYearsExperience(String(b.yearsExperience ?? 5));
    setSpecialties(b.specialties || "");
    setPhone(b.phone || "");
    setIsAvailable(Boolean(b.isAvailable));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title) return;

    try {
      setSubmitting(true);
      setError("");
      const url = editing ? `/api/storefront/barbers/${editing.id}` : "/api/storefront/barbers";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          bio,
          avatarUrl: avatarBase64 || "",
          rating,
          yearsExperience,
          specialties,
          phone,
          isAvailable,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        triggerRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save barber");
      }
    } catch (err) {
      console.error("Save storefront barber error:", err);
      setError("Network or server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (b: any) => {
    if (!confirm(`Remove "${b.name}" from the public website? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/storefront/barbers/${b.id}`, { method: "DELETE" });
      if (res.ok) triggerRefresh();
    } catch (err) {
      console.error("Delete storefront barber error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Website Barbers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage the barber profiles shown to customers on your public booking site
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-orange-400" />
          <span>+ Add Barber</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading website barbers...</span>
        </div>
      ) : barbers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">No barbers on the website yet</h3>
          <p className="text-xs text-slate-400">Add your team so customers can browse and book them online.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <div className="relative h-44 bg-slate-100">
                {barber.avatarUrl && (
                  <img src={barber.avatarUrl} alt={barber.name} className="w-full h-full object-cover" />
                )}
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    barber.isAvailable
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {barber.isAvailable ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {barber.isAvailable ? "Live" : "Hidden"}
                </span>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">{barber.name}</h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {barber.rating}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-orange-600">{barber.title}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{barber.bio}</p>
                  {barber.phone && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                      <Phone className="w-3 h-3" /> {barber.phone}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{barber.yearsExperience} yrs experience</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(barber)}
                      className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(barber)}
                      className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 my-8">
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">{editing ? "Edit Barber Profile" : "Add Website Barber"}</h3>
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
                inputId="barber-avatar-input"
                preview={avatarPreview}
                onFile={(b64) => { setAvatarPreview(b64); setAvatarBase64(b64); setPhotoError(null); }}
                onRemove={() => { setAvatarPreview(null); setAvatarBase64(null); }}
                error={photoError}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Barber"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bio</label>
                <textarea
                  rows={3}
                  placeholder="Short bio shown on their public profile card"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Years Exp.</label>
                  <input
                    type="number"
                    min="0"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Specialties (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Skin Fades, Hot Towel Shave, Beard Design"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-xs font-bold text-slate-700">
                  Visible on public website
                  <span className="block font-medium text-slate-400 normal-case">
                    Uncheck to hide this barber without deleting their profile
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
