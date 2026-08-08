"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { X, Printer, Scissors, Check, Copy, Sparkles } from "lucide-react";

export function ReceiptModal() {
  const { selectedVisitForReceipt, setSelectedVisitForReceipt, settings } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!selectedVisitForReceipt) return null;

  const visit = selectedVisitForReceipt;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `
=== ${settings.shopName || "EXECUTIVE BARBER LOUNGE"} ===
Receipt #: ${visit.visitNumber}
Date: ${new Date(visit.createdAt).toLocaleString()}
Customer: ${visit.customerName} (${visit.customerPhone || "N/A"})
Service: ${visit.serviceName}
Barber: ${visit.barberName}
Payment: ${visit.paymentMethod}
----------------------------
Total Paid: ${settings.currencySymbol || "GH₵"} ${parseFloat(visit.amount).toFixed(2)}
----------------------------
${settings.receiptFooter || "Thank you for grooming with us!"}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 print:shadow-none print:border-none">
        {/* Printable Area */}
        <div className="p-6 font-mono text-xs text-slate-800 space-y-4 print:p-0">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto mb-2 font-bold">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base uppercase tracking-tight text-slate-900">
              {settings.shopName || "EXECUTIVE BARBER LOUNGE"}
            </h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">{settings.address}</p>
            <p className="text-[11px] text-slate-500 font-sans">Tel: {settings.phone}</p>
          </div>

          {/* Details */}
          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-bold text-slate-900">{visit.visitNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span>{new Date(visit.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{visit.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Barber:</span>
              <span className="font-semibold text-slate-800">{visit.barberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {visit.paymentMethod}
              </span>
            </div>
          </div>

          {/* Itemized Line */}
          <div className="py-2 border-y border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between font-bold text-slate-900 text-xs">
              <span>{visit.serviceName}</span>
              <span>{settings.currencySymbol || "GH₵"} {parseFloat(visit.amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1">
            <span>TOTAL PAID</span>
            <span className="text-base text-orange-600">
              {settings.currencySymbol || "GH₵"} {parseFloat(visit.amount).toFixed(2)}
            </span>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-sans space-y-1">
            <p>{settings.receiptFooter || "Thank you for grooming with us!"}</p>
            <p className="font-semibold text-slate-700">MoMo Pay: {settings.momoNumber}</p>
          </div>
        </div>

        {/* Modal Action Buttons (hidden during print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2 print:hidden">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedVisitForReceipt(null)}
              className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
