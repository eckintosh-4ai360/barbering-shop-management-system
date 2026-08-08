"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  PlusCircle,
  Store,
  BarChart3,
  Users,
  CreditCard,
  Lock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export function QuickActionsPanel() {
  const { setOpenWalkInModal, user } = useApp();

  const isAdmin = user?.role === "admin";

  const actions = [
    {
      title: "New Walk-in",
      subtitle: "Register customer, select barber & service",
      icon: PlusCircle,
      bg: "bg-orange-50 text-orange-600",
      onClick: () => setOpenWalkInModal(true),
    },
    {
      title: "Services & Catalog",
      subtitle: "Add services, update prices & discounts",
      icon: Store,
      bg: "bg-blue-50 text-blue-600",
      href: "/services",
    },
    {
      title: "Analytics & Reports",
      subtitle: "Review revenue, profit, and barber sales",
      icon: BarChart3,
      bg: "bg-emerald-50 text-emerald-600",
      href: "/analytics",
    },
    {
      title: isAdmin ? "Manage Users & Staff" : "Barbers Roster",
      subtitle: isAdmin ? "Manage staff accounts and permissions" : "View active barbers and customer queue",
      icon: Users,
      bg: "bg-purple-50 text-purple-600",
      href: isAdmin ? "/users" : "/barbers",
    },
    {
      title: "Daily Closing",
      subtitle: "Reconcile cash sales and close day",
      icon: Lock,
      bg: "bg-amber-50 text-amber-600",
      href: "/closing",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
      {/* Panel Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Quick Actions</h3>
          <p className="text-[11px] text-slate-400">Open areas you use most</p>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-2.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          const content = (
            <div className="p-3 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl flex items-center justify-between group transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${act.bg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-orange-600 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
                    {act.subtitle}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          );

          if (act.onClick) {
            return (
              <div key={idx} onClick={act.onClick}>
                {content}
              </div>
            );
          }

          return (
            <Link key={idx} href={act.href || "#"}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
