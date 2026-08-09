"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, isLoading, login } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      const target = user.role === "admin" ? "/dashboard" : "/pos";
      router.replace(target);
    }
  }, [user, isLoading, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        const target = res.user.role === "admin" ? "/dashboard" : "/pos";
        router.replace(target);
      } else {
        setError(res.error || "Invalid login credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: "admin" | "receptionist") => {
    const demoEmail = role === "admin" ? "admin@barber.com" : "receptionist@barber.com";
    const demoPassword = role === "admin" ? "admin123" : "receptionist123";

    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setLoading(true);

    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success && res.user) {
        const target = res.user.role === "admin" ? "/dashboard" : "/pos";
        router.replace(target);
      } else {
        setError(res.error || "Quick login failed.");
      }
    } catch (err) {
      setError("Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-[#121926] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8 backdrop-blur-xl">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/25 ring-4 ring-orange-500/10">
            <Scissors className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              E-Barber System
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Executive Lounge & POS Management Portal
            </p>
          </div>
        </div>

        {/* Demo Persona Quick Selectors */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Quick Demo Login</span>
            <span className="text-orange-400 font-semibold">1-Click Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Admin Account</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("receptionist")}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Receptionist</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-start gap-3 text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@barber.com"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/60 pt-4">
          Executive Barber Lounge &bull; Restricted Access System
        </div>
      </div>
    </div>
  );
}
