"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Settings, Save, CheckCircle2, Store, Phone, MapPin, CreditCard, FileText, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { settings, refreshTrigger, triggerRefresh } = useApp();

  const [shopName, setShopName] = useState(settings.shopName || "Executive Barber Lounge");
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || "GH₵");
  const [phone, setPhone] = useState(settings.phone || "+233 24 123 4567");
  const [address, setAddress] = useState(settings.address || "Airport Residential Area, Accra, Ghana");
  const [momoNumber, setMomoNumber] = useState(settings.momoNumber || "024 123 4567 (MTN MoMo)");
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || "Thank you for grooming with us!");
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(settings.defaultCommissionRate || "40.00");

  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setShopName(settings.shopName || "Executive Barber Lounge");
      setCurrencySymbol(settings.currencySymbol || "GH₵");
      setPhone(settings.phone || "+233 24 123 4567");
      setAddress(settings.address || "Airport Residential Area, Accra, Ghana");
      setMomoNumber(settings.momoNumber || "024 123 4567 (MTN MoMo)");
      setReceiptFooter(settings.receiptFooter || "Thank you for grooming with us!");
      setDefaultCommissionRate(settings.defaultCommissionRate || "40.00");
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setSaved(false);

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          currencySymbol,
          phone,
          address,
          momoNumber,
          receiptFooter,
          defaultCommissionRate,
        }),
      });

      if (res.ok) {
        setSaved(true);
        triggerRefresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Barbershop Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure shop profile, contact info, payment receipt footers, and currency defaults
          </p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Shop configuration settings updated successfully!</span>
        </div>
      )}

      {/* Settings Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Barbershop Name *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Currency Symbol *
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Shop Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Mobile Money Payment Number
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Physical Location / Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Receipt Footer Greeting Message
            </label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Default Barber Commission Rate (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={defaultCommissionRate}
              onChange={(e) => setDefaultCommissionRate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-purple-700 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
