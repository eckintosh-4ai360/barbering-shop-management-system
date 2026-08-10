"use client";

import React, { useState } from "react";
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
  Globe,
  Layout,
  ShoppingBag,
  Star,
  ChevronDown,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, switchRole, setOpenWalkInModal } = useApp();

  const isAdmin = user?.role === "admin";

  const isWebsiteRoute = pathname.startsWith("/website");
  // Lazy initializer covers direct loads/refreshes on a /website/* route; once
  // mounted the user's manual expand/collapse takes over (no effect needed).
  const [websiteMenuOpen, setWebsiteMenuOpen] = useState(() => isWebsiteRoute);

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Walk-ins & POS", href: "/pos", icon: Scissors },
    { name: "Online Orders", href: "/orders", icon: Globe },
    { name: "Barbers", href: "/barbers", icon: Users },
    { name: "Services", href: "/services", icon: Store },
    { name: "Sales", href: "/sales", icon: CreditCard },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Daily Closing", href: "/closing", icon: Lock },
  ];

  const adminConfigNavItems = [
    { name: "Users", href: "/users", icon: UserCheck },
    { name: "Audit Logs", href: "/audit-logs", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Client-app ("Website Content") management — grouped in a submenu, admin-only,
  // since this is the surface the shop owner uses to run their own site after handover.
  const websiteNavItems = [
    { name: "Branding & Homepage", href: "/website/content", icon: Layout },
    { name: "Barbers", href: "/website/barbers", icon: Users },
    { name: "Services & Pricing", href: "/website/services", icon: Store },
    { name: "Shop Products", href: "/website/products", icon: ShoppingBag },
    { name: "Customer Reviews", href: "/website/reviews", icon: Star },
  ];

  const receptionistNavItems = [
    { name: "Walk-ins & POS", href: "/pos", icon: Scissors },
    { name: "Online Orders", href: "/orders", icon: Globe },
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

            {isAdmin && (
              <div>
                <button
                  type="button"
                  onClick={() => setWebsiteMenuOpen((v) => !v)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isWebsiteRoute && !websiteMenuOpen
                      ? "bg-slate-800/60 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Layout className={`w-4 h-4 ${isWebsiteRoute ? "text-orange-400" : "text-slate-400"}`} />
                  <span className="flex-1 text-left">Website Content</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                      websiteMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {websiteMenuOpen && (
                  <div className="mt-1 ml-[18px] pl-3 border-l border-slate-800 space-y-1">
                    {websiteNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-[13px] transition-all duration-150 ${
                            isActive
                              ? "bg-white text-slate-900 shadow-sm font-semibold"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-slate-900" : "text-slate-500"}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <>
                <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mt-4 mb-2 px-3 pt-3 border-t border-slate-800/60">
                  Configuration
                </div>
                {adminConfigNavItems.map((item) => {
                  const isActive = pathname === item.href;
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
              </>
            )}
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
