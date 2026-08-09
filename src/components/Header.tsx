"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Sun, Moon, Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const { user, logout } = useApp();
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Title */}
      <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button className="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-2 right-2 border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || "User"}
            </div>
            <div className="text-[11px] text-slate-500 capitalize font-medium">
              {user?.role === "admin" ? "Superadmin" : "Receptionist"}
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.avatarInitials || "U"}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 py-1.5 px-3 rounded-lg transition-colors ml-1 border border-slate-200 hover:border-red-200"
            title="Logout to login screen"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
