"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { NewWalkInModal } from "@/components/NewWalkInModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";

const ADMIN_ONLY_ROUTES = [
  "/dashboard",
  "/analytics",
  "/expenses",
  "/users",
  "/audit-logs",
  "/settings",
];

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useApp();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "receptionist" && ADMIN_ONLY_ROUTES.includes(pathname)) {
        router.replace("/pos");
      }
    }
  }, [user, isLoading, isLoginPage, pathname, router]);

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/pos":
        return "Walk-ins & POS";
      case "/barbers":
        return "Barbers Roster & Performance";
      case "/services":
        return "Services & Prices Catalog";
      case "/sales":
        return "Sales & Payment Records";
      case "/expenses":
        return "Operational Expenses";
      case "/analytics":
        return "Analytics & Financial Reports";
      case "/closing":
        return "End-of-Day Daily Closing";
      case "/users":
        return "User & Staff Accounts";
      case "/audit-logs":
        return "System Audit Logs";
      case "/settings":
        return "Barbershop Settings";
      default:
        return "Barbershop Management";
    }
  };

  // If on login page, render full-screen login layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If app session is loading, display loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // If not logged in, block view while router redirects to /login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // If receptionist tries accessing admin page, block view while router redirects to /pos
  if (user.role === "receptionist" && ADMIN_ONLY_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100/90 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getPageTitle(pathname)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <NewWalkInModal />
      <ReceiptModal />
    </div>
  );
}
