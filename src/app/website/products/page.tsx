"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Package,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";

const CATEGORY_OPTIONS = ["Styling", "Beard Care", "Shave", "Scalp"];

export default function WebsiteProductsPage() {
  const { refreshTrigger, triggerRefresh } = useApp();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("25");
  const [category, setCategory] = useState("Styling");
  const [otherCategory, setOtherCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/storefront/products");
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Fetch products error:", err);
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
    setStock("25");
    setCategory("Styling");
    setOtherCategory("");
    setImageUrl("");
    setIsActive(true);
    setError("");
  };

  const openAddModal = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditing(p);
    setError("");
    setName(p.name);
    setDescription(p.description);
    setPrice((p.price / 100).toFixed(2));
    setStock(String(p.stock ?? 0));
    if (CATEGORY_OPTIONS.includes(p.category)) {
      setCategory(p.category);
      setOtherCategory("");
    } else {
      setCategory("Other");
      setOtherCategory(p.category || "");
    }
    setImageUrl(p.imageUrl);
    setIsActive(Boolean(p.isActive));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !category) return;

    try {
      setSubmitting(true);
      setError("");
      const url = editing ? `/api/storefront/products/${editing.id}` : "/api/storefront/products";
      const method = editing ? "PATCH" : "POST";
      const resolvedCategory = category === "Other" ? otherCategory.trim() || "Other" : category;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price, stock, category: resolvedCategory, imageUrl, isActive }),
      });

      if (res.ok) {
        setShowModal(false);
        triggerRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save product");
      }
    } catch (err) {
      console.error("Save product error:", err);
      setError("Network or server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Remove "${p.name}" from the shop? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/storefront/products/${p.id}`, { method: "DELETE" });
      if (res.ok) triggerRefresh();
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Website Shop Products</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage the grooming products, prices, and stock levels sold in your online shop
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-orange-400" />
          <span>+ Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading shop products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No products in the shop yet</h3>
            <p className="text-xs text-slate-400">Add grooming products for customers to purchase online.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const active = Boolean(product.isActive);
                  const lowStock = product.stock <= 5;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            {product.imageUrl && (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{product.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 font-semibold text-slate-700 rounded-full text-[11px]">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1 font-bold ${lowStock ? "text-red-600" : "text-slate-600"}`}>
                          <Package className="w-3.5 h-3.5" />
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        GH₵ {(product.price / 100).toFixed(2)}
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
                            onClick={() => openEditModal(product)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
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
              <h3 className="font-bold text-base">{editing ? "Edit Product" : "Add Shop Product"}</h3>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Matte Craft Hair Clay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  rows={2}
                  placeholder="Short product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  required
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
                    placeholder="24.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Photo URL</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
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
                    Uncheck to hide this product without deleting it
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
                  {submitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
