"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MessageSquare, Star, Trash2, Loader2, User } from "lucide-react";

export default function WebsiteReviewsPage() {
  const { refreshTrigger, triggerRefresh } = useApp();

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/storefront/reviews");
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Fetch reviews error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshTrigger]);

  const handleDelete = async (r: any) => {
    if (!confirm(`Remove this review by "${r.customerName}" from the public website?`)) return;
    try {
      const res = await fetch(`/api/storefront/reviews/${r.id}`, { method: "DELETE" });
      if (res.ok) triggerRefresh();
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2) : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Customer Reviews</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Moderate testimonials shown publicly on your barbers page
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span className="text-sm font-black text-slate-900">{avgRating}</span>
          <span className="text-xs text-slate-500">avg · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl space-y-2">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">No reviews yet</h3>
          <p className="text-xs text-slate-400">Customer reviews submitted after their visit will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">{review.customerName}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>

                {review.barberName && (
                  <p className="text-[11px] font-semibold text-orange-600">Served by {review.barberName}</p>
                )}

                <p className="text-xs text-slate-500 italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(review)}
                  className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                  title="Remove review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
