"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { History, Search, Shield, Clock, Loader2 } from "lucide-react";

export default function AuditLogsPage() {
  const { refreshTrigger } = useApp();

  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await fetch(`/api/audit-logs?search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error("Fetch audit logs error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [searchTerm, refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">System Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Security audit trail of all transactions, price edits, expense additions, and system actions
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action or staff name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading audit log entries...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit log entries matching query.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 px-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{log.action}</span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        By: {log.userName || "System"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{log.details}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0 ml-4">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
