"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  User,
  Phone,
  Scissors,
  UserCheck,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Receipt,
  Sparkles,
  Loader2,
} from "lucide-react";

export function NewWalkInModal() {
  const { openWalkInModal, setOpenWalkInModal, triggerRefresh, setSelectedVisitForReceipt, user } = useApp();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [visitStatus, setVisitStatus] = useState<string>("waiting");
  const [notes, setNotes] = useState<string>("");

  const [servicesList, setServicesList] = useState<any[]>([]);
  const [barbersList, setBarbersList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch Services & Barbers
  useEffect(() => {
    if (openWalkInModal) {
      async function fetchData() {
        try {
          const [sRes, bRes] = await Promise.all([
            fetch("/api/services"),
            fetch("/api/barbers"),
          ]);
          const sData = await sRes.json();
          const bData = await bRes.json();

          const activeServices = (sData.services || []).filter((s: any) => s.status === "active");
          const activeBarbers = (bData.barbers || []).filter((b: any) => b.status === "active");

          setServicesList(activeServices);
          setBarbersList(activeBarbers);

          if (activeServices.length > 0 && !selectedServiceId) {
            setSelectedServiceId(String(activeServices[0].id));
            setPrice(activeServices[0].price);
          }
          if (activeBarbers.length > 0 && !selectedBarberId) {
            setSelectedBarberId(String(activeBarbers[0].id));
          }
        } catch (err) {
          console.error("Failed to load modal dropdowns:", err);
        }
      }
      fetchData();
    }
  }, [openWalkInModal]);

  // Handle service change to update price
  const handleServiceChange = (sId: string) => {
    setSelectedServiceId(sId);
    const service = servicesList.find((s) => String(s.id) === String(sId));
    if (service) {
      setPrice(service.price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Please enter customer name.");
      return;
    }
    if (!selectedServiceId) {
      setError("Please select a service.");
      return;
    }
    if (!selectedBarberId) {
      setError("Please assign a barber.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          serviceId: selectedServiceId,
          barberId: selectedBarberId,
          customPrice: price,
          paymentMethod,
          visitStatus,
          receptionistName: user?.name || "Receptionist",
          receptionistId: user?.id,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register customer");
      }

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setOpenWalkInModal(false);
      triggerRefresh();

      // Offer immediate receipt view
      if (data.visit) {
        setSelectedVisitForReceipt(data.visit);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!openWalkInModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Walk-in Registration</h2>
              <p className="text-xs text-slate-400">Record customer visit & transaction</p>
            </div>
          </div>
          <button
            onClick={() => setOpenWalkInModal(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. John Mensah"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="e.g. 024 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Service *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {servicesList.map((service) => {
                const isSelected = String(service.id) === String(selectedServiceId);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceChange(String(service.id))}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm font-semibold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{service.name}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? "text-orange-100" : "text-slate-500"}`}>
                      GH₵ {parseFloat(service.price).toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barber Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assign Barber *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {barbersList.map((barber) => {
                const isSelected = String(barber.id) === String(selectedBarberId);
                return (
                  <button
                    key={barber.id}
                    type="button"
                    onClick={() => setSelectedBarberId(String(barber.id))}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 font-semibold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold truncate">{barber.name}</div>
                      <div className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        Comm: {barber.commissionRate}%
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price & Visit Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount Charged (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">GH₵</span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={visitStatus}
                onChange={(e) => setVisitStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
              >
                <option value="waiting">⏳ Waiting in Queue</option>
                <option value="in_progress">💈 In Progress</option>
                <option value="completed">✅ Completed & Paid</option>
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Cash", "Mobile Money", "Card"].map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {method === "Cash" && "💵"}
                    {method === "Mobile Money" && "📱"}
                    {method === "Card" && "💳"}
                    <span>{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenWalkInModal(false)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>REGISTER CUSTOMER</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
