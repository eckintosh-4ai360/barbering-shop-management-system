"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "receptionist";

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

export interface ShopSettings {
  shopName: string;
  currencySymbol: string;
  phone: string;
  address: string;
  momoNumber: string;
  receiptFooter: string;
  defaultCommissionRate: string;
}

interface AppContextType {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  isLoading: boolean;
  settings: ShopSettings;
  refreshTrigger: number;
  triggerRefresh: () => void;
  openWalkInModal: boolean;
  setOpenWalkInModal: (open: boolean) => void;
  selectedVisitForReceipt: any | null;
  setSelectedVisitForReceipt: (visit: any | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: UserSession; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const defaultSettings: ShopSettings = {
  shopName: "Executive Barber Lounge",
  currencySymbol: "GH₵",
  phone: "+233 24 123 4567",
  address: "Airport Residential Area, Accra, Ghana",
  momoNumber: "024 123 4567 (MTN MoMo)",
  receiptFooter: "Thank you for grooming with us! Please visit us again.",
  defaultCommissionRate: "40.00",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [openWalkInModal, setOpenWalkInModal] = useState<boolean>(false);
  const [selectedVisitForReceipt, setSelectedVisitForReceipt] = useState<any | null>(null);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Fetch Current User & Shop Settings
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        // Ensure db is seeded if needed
        await fetch("/api/seed", { method: "POST" }).catch(() => {});

        const meRes = await fetch("/api/auth/me");
        const meData = meRes.ok ? await meRes.json().catch(() => null) : null;

        if (meData?.user) {
          setUser(meData.user);
        } else {
          setUser(null);
        }

        const setRes = await fetch("/api/settings");
        const setData = setRes.ok ? await setRes.json().catch(() => null) : null;
        if (setData?.settings) {
          setSettings(setData.settings);
        }
      } catch (err) {
        console.error("Failed to initialize app state:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        triggerRefresh();
        return { success: true, user: data.user as UserSession };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (err) {
      return { success: false, error: "Network or server error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    const email = newRole === "admin" ? "admin@barber.com" : "receptionist@barber.com";
    const password = newRole === "admin" ? "admin123" : "receptionist123";

    await login(email, password);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        settings,
        refreshTrigger,
        triggerRefresh,
        openWalkInModal,
        setOpenWalkInModal,
        selectedVisitForReceipt,
        setSelectedVisitForReceipt,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
