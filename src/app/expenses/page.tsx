"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";

export default function ExpensesPage() {
  const { refreshTrigger, triggerRefresh, settings, user } = useApp();

  const [dateFilter, setDateFilter] = useState<string>("today");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [category, setCategory] = useState("Electricity");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true);
        const res = await fetch(`/api/expenses?date=${dateFilter}`);
        const data = await res.json();
        setExpenses(data.expenses || []);
      } catch (err) {
        console.error("Fetch expenses error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, [dateFilter, refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description || !amount) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          amount,
          expenseDate,
          recordedByName: user?.name || "Admin",
          recordedById: user?.id,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setDescription("");
        setAmount("");
        triggerRefresh();
      }
    } catch (err) {
      console.error("Add expense error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerRefresh();
      }
    } catch (err) {
      console.error("Delete expense error:", err);
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Operational Expenses</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track utilities, products, rent, maintenance and shop overheads
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Expense</span>
        </button>
      </div>

      {/* Expense Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Filtered Total Expenses</span>
          <div className="text-2xl font-black text-orange-600 mt-1">
            {settings.currencySymbol || "GH₵"} {totalExpenseSum.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Entries</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{expenses.length}</div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Expense Filter</span>
            <div className="text-sm font-extrabold text-orange-400 mt-1 capitalize">{dateFilter}</div>
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 outline-none"
          >
            <option value="today">Today</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Expenses List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading operational expenses...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No expense records found for selected period. Click <strong>+ Record Expense</strong> to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Recorded By</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="px-2.5 py-1 bg-orange-50 text-orange-700 font-bold rounded-full text-[11px] border border-orange-200">
                        {exp.category}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-slate-800 text-sm">
                      {exp.description}
                    </td>

                    <td className="p-4 text-slate-500 font-medium">
                      {exp.expenseDate}
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {exp.recordedByName || "Admin"}
                    </td>

                    <td className="p-4 font-black text-slate-900 text-sm">
                      {settings.currencySymbol || "GH₵"} {parseFloat(exp.amount).toFixed(2)}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">Record Salon Expense</h3>
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
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Rent">Rent</option>
                  <option value="Cleaning supplies">Cleaning supplies</option>
                  <option value="Hair products">Hair products</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Staff expenses">Staff expenses</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. August electricity utility bill"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="350.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-orange-600 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
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
                  {submitting ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
