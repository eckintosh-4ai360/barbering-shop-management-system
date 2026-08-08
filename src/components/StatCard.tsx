"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: "blue" | "emerald" | "purple" | "orange";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "blue",
}: StatCardProps) {
  const variantStyles = {
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-500 text-white",
    purple: "bg-purple-600 text-white",
    orange: "bg-orange-500 text-white",
  };

  return (
    <div
      className={`rounded-2xl p-5 relative overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md ${variantStyles[variant]}`}
    >
      {/* Floating Translucent Icon Circle */}
      <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex flex-col justify-between h-full pt-1">
        <span className="text-xs font-semibold tracking-wide text-white/90 uppercase">
          {title}
        </span>

        <div className="mt-4 mb-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-none">
            {value}
          </h2>
        </div>

        <span className="text-[11px] font-medium text-white/80">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
