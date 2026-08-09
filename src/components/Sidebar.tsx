"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Scissors,
  Users,
  CreditCard,
  DollarSign,
  BarChart3,
  Lock,
  UserCheck,
  History,
  Settings,
  Store,
  User,
  ShieldAlert,
  Sparkles,
  PlusCircle,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, switchRole, setOpenWalkInModal } = useApp();

  const isAdmin = user?.role === "admin";

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Walk-ins & POS", href: "/pos", icon: Scissors },
    { name: "Barbers", href: "/barbers", icon: Users },
    { name: "Services", href: "/services", icon: Store },
    { name: "Sales", href: "/sales", icon: CreditCard },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Daily Closing", href: "/closing", icon: Lock },
    { name: "Users", href: "/users", icon: UserCheck },
    { name: "Audit Logs", href: "/audit-logs", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const receptionistNavItems = [
    { name: "Walk-ins & POS", href: "/pos", icon: Scissors },
    { name: "Today's Payments", href: "/sales", icon: CreditCard },
    { name: "Barbers Roster", href: "/barbers", icon: Users },
    { name: "Services Catalog", href: "/services", icon: Store },
    { name: "Daily Closing", href: "/closing", icon: Lock },
  ];

  const navItems = isAdmin ? adminNavItems : receptionistNavItems;

  return (
    <aside className="w-64 bg-[#121926] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 overflow-y-auto z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-600/30">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-tight">
              E-Barber
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">
              Salon & POS System
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 px-3">
            MENU
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Quick POS Action */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={() => setOpenWalkInModal(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          + New Walk-in
        </button>
      </div>
    </aside>
  );
}
