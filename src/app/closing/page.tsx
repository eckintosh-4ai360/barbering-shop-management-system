"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Calendar,
  History,
  FileText,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function DailyClosingPage() {
  const { refreshTrigger, triggerRefresh, settings, user } = useApp();

  const [closingDate, setClosingDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [actualCash, setActualCash] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    async function loadClosing() {
      try {
        setLoading(true);
        const res = await fetch(`/api/daily-closing?date=${closingDate}`);
        const result = await res.json();
        setData(result);

        if (result.closing) {
          setActualCash(result.closing.actualCashCounted || "");
          setNotes(result.closing.notes || "");
        } else if (result.liveSummary) {
          setActualCash(String(result.liveSummary.expectedBalance || 0));
        }
      } catch (err) {
        console.error("Fetch closing data error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClosing();
  }, [closingDate, refreshTrigger]);

  const live = data?.liveSummary || {
    totalCustomers: 0,
    cashSales: 0,
    momoSales: 0,
    cardSales: 0,
    totalSales: 0,
    totalExpenses: 0,
    expectedBalance: 0,
  };

  const isClosed = data?.closing?.status === "closed";

  const countedNum = parseFloat(actualCash || "0");
  const discrepancy = countedNum - live.expectedBalance;

  const handleCloseDay = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setSuccessMsg("");

      const res = await fetch("/api/daily-closing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          closingDate,
          actualCashCounted: actualCash,
          notes,
          closedByName: user?.name || "Admin",
          closedById: user?.id,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Day successfully closed and locked! Reconciliation saved.");
        triggerRefresh();
      }
    } catch (err) {
      console.error("Close day error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">End-of-Day Daily Closing</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Reconcile daily cash till, verify MoMo & card totals, and lock daily register
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase">Closing Date:</label>
          <input
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
          />
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Closing Card (Prompt #11 Format) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Reconciled Totals Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">DAILY CLOSING SUMMARY</h3>
                <p className="text-xs text-slate-400">Date: {closingDate}</p>
              </div>
            </div>

            {isClosed ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> CLOSED & LOCKED
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs">
                OPEN REGISTER
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Calculating live closing metrics...</span>
            </div>
          ) : (
            <div className="space-y-4 font-mono text-sm text-slate-800">
              <div className="flex justify-between py-2 border-b border-slate-100 font-sans">
                <span className="text-slate-500">Customers Served Today:</span>
                <span className="font-black text-slate-900 text-base">{live.totalCustomers}</span>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Cash Sales:</span>
                  <span className="font-bold text-slate-900">
                    {settings.currencySymbol || "GH₵"} {live.cashSales.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Mobile Money (MoMo) Sales:</span>
                  <span className="font-bold text-slate-900">
                    {settings.currencySymbol || "GH₵"} {live.momoSales.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Card Sales:</span>
                  <span className="font-bold text-slate-900">
                    {settings.currencySymbol || "GH₵"} {live.cardSales.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-3 border-y-2 border-slate-900 font-bold text-base text-slate-900">
                <span>TOTAL SALES:</span>
                <span className="text-emerald-600">
                  {settings.currencySymbol || "GH₵"} {live.totalSales.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2 text-xs text-orange-600 font-bold">
                <span>Less Operational Expenses:</span>
                <span>- {settings.currencySymbol || "GH₵"} {live.totalExpenses.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-3 bg-slate-900 text-white p-4 rounded-2xl font-bold text-lg">
                <span>EXPECTED BALANCE:</span>
                <span className="text-orange-400">
                  {settings.currencySymbol || "GH₵"} {live.expectedBalance.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Till Reconciliation Form */}
        <form onSubmit={handleCloseDay} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <span>Till Reconciliation</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Actual Cash Counted in Till (GH₵)
            </label>
            <input
              type="number"
              step="0.01"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>

          {/* Discrepancy Indicator */}
          <div className="p-4 rounded-2xl border text-xs font-bold space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Discrepancy / Variance:</span>
              <span
                className={
                  discrepancy === 0
                    ? "text-emerald-600 font-black"
                    : discrepancy > 0
                    ? "text-blue-600 font-black"
                    : "text-red-600 font-black"
                }
              >
                {discrepancy === 0
                  ? "✅ Balance Exact Match"
                  : discrepancy > 0
                  ? `+ ${settings.currencySymbol || "GH₵"} ${discrepancy.toFixed(2)} (Overage)`
                  : `- ${settings.currencySymbol || "GH₵"} ${Math.abs(discrepancy).toFixed(2)} (Shortage)`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Closing Notes / Discrepancy Explanation
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Till balanced. All MoMo payments confirmed by Abena."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>[ CLOSE DAY ]</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Historical Closings Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <History className="w-4 h-4 text-orange-500" />
          <span>Daily Closing Archives</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="p-3 pl-4">Closing Date</th>
                <th className="p-3">Closed By</th>
                <th className="p-3">Customers</th>
                <th className="p-3">Total Sales</th>
                <th className="p-3">Expenses</th>
                <th className="p-3">Expected Balance</th>
                <th className="p-3">Cash Counted</th>
                <th className="p-3 pr-4">Discrepancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.history || []).map((h: any) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 pl-4 font-bold text-slate-900">{h.closingDate}</td>
                  <td className="p-3 text-slate-600">{h.closedByName}</td>
                  <td className="p-3 font-semibold">{h.totalCustomers}</td>
                  <td className="p-3 font-bold text-emerald-600">{settings.currencySymbol || "GH₵"} {parseFloat(h.totalSales).toFixed(2)}</td>
                  <td className="p-3 font-semibold text-orange-600">{settings.currencySymbol || "GH₵"} {parseFloat(h.totalExpenses).toFixed(2)}</td>
                  <td className="p-3 font-bold text-slate-900">{settings.currencySymbol || "GH₵"} {parseFloat(h.expectedBalance).toFixed(2)}</td>
                  <td className="p-3 font-bold">{settings.currencySymbol || "GH₵"} {parseFloat(h.actualCashCounted).toFixed(2)}</td>
                  <td className="p-3 pr-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${parseFloat(h.discrepancy) === 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {settings.currencySymbol || "GH₵"} {parseFloat(h.discrepancy).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
