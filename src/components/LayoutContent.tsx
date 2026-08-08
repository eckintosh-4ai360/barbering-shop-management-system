"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { NewWalkInModal } from "@/components/NewWalkInModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { usePathname } from "next/navigation";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
        return "Dashboard";
    }
  };

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
