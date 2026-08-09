"use client";

import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "receptionist") {
        router.replace("/pos");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );
}
