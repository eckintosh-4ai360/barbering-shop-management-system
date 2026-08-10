"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  Save,
  CheckCircle2,
  Store,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  MessageSquare,
  Mail,
  Send,
  Bell,
  AlertCircle,
  Key,
  Smartphone,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, triggerRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<"general" | "notifications">("general");

  // General Settings State 
  const [shopName, setShopName] = useState(settings?.shopName || "Executive Barber Lounge");
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || "GH₵");
  const [phone, setPhone] = useState(settings?.phone || "+233 24 123 4567");
  const [address, setAddress] = useState(settings?.address || "Airport Residential Area, Accra, Ghana");
  const [momoNumber, setMomoNumber] = useState(settings?.momoNumber || "024 123 4567 (MTN MoMo)");
  const [receiptFooter, setReceiptFooter] = useState(settings?.receiptFooter || "Thank you for grooming with us!");
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(settings?.defaultCommissionRate || "40.00");
  const [submittingGeneral, setSubmittingGeneral] = useState(false);
  const [savedGeneral, setSavedGeneral] = useState(false);

  // --- Notification Settings State ---
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [mnotifyApiKey, setMnotifyApiKey] = useState("");
  const [smsSenderId, setSmsSenderId] = useState("BARBERSHOP");

  const [smsOnBooking, setSmsOnBooking] = useState("");
  const [smsOnConfirmed, setSmsOnConfirmed] = useState("");
  const [smsOnInProgress, setSmsOnInProgress] = useState("");
  const [smsOnCompleted, setSmsOnCompleted] = useState("");
  const [smsOnCancelled, setSmsOnCancelled] = useState("");

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [emailFromName, setEmailFromName] = useState("Eckintosh Barbers");

  const [emailSubjectOnBooking, setEmailSubjectOnBooking] = useState("");
  const [emailBodyOnBooking, setEmailBodyOnBooking] = useState("");
  const [emailSubjectOnConfirmed, setEmailSubjectOnConfirmed] = useState("");
  const [emailBodyOnConfirmed, setEmailBodyOnConfirmed] = useState("");
  const [emailSubjectOnInProgress, setEmailSubjectOnInProgress] = useState("");
  const [emailBodyOnInProgress, setEmailBodyOnInProgress] = useState("");
  const [emailSubjectOnCompleted, setEmailSubjectOnCompleted] = useState("");
  const [emailBodyOnCompleted, setEmailBodyOnCompleted] = useState("");
  const [emailSubjectOnCancelled, setEmailSubjectOnCancelled] = useState("");
  const [emailBodyOnCancelled, setEmailBodyOnCancelled] = useState("");

  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [submittingNotifications, setSubmittingNotifications] = useState(false);
  const [savedNotifications, setSavedNotifications] = useState(false);

  // Test send state
  const [testPhone, setTestPhone] = useState("");
  const [testingSms, setTestingSms] = useState(false);
  const [smsTestFeedback, setSmsTestFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestFeedback, setEmailTestFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setShopName(settings.shopName || "Executive Barber Lounge");
      setCurrencySymbol(settings.currencySymbol || "GH₵");
      setPhone(settings.phone || "+233 24 123 4567");
      setAddress(settings.address || "Airport Residential Area, Accra, Ghana");
      setMomoNumber(settings.momoNumber || "024 123 4567 (MTN MoMo)");
      setReceiptFooter(settings.receiptFooter || "Thank you for grooming with us!");
      setDefaultCommissionRate(settings.defaultCommissionRate || "40.00");
    }
  }, [settings]);

  const fetchNotificationSettings = async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch("/api/notification-settings");
      const data = await res.json();
      if (data.settings) {
        const s = data.settings;
        setSmsEnabled(Boolean(s.smsEnabled));
        setMnotifyApiKey(s.mnotifyApiKey || "");
        setSmsSenderId(s.smsSenderId || "BARBERSHOP");

        setSmsOnBooking(s.smsOnBooking || "");
        setSmsOnConfirmed(s.smsOnConfirmed || "");
        setSmsOnInProgress(s.smsOnInProgress || "");
        setSmsOnCompleted(s.smsOnCompleted || "");
        setSmsOnCancelled(s.smsOnCancelled || "");

        setEmailEnabled(Boolean(s.emailEnabled));
        setGmailUser(s.gmailUser || "");
        setGmailAppPassword(s.gmailAppPassword || "");
        setEmailFromName(s.emailFromName || "Eckintosh Barbers");

        setEmailSubjectOnBooking(s.emailSubjectOnBooking || "");
        setEmailBodyOnBooking(s.emailBodyOnBooking || "");
        setEmailSubjectOnConfirmed(s.emailSubjectOnConfirmed || "");
        setEmailBodyOnConfirmed(s.emailBodyOnConfirmed || "");
        setEmailSubjectOnInProgress(s.emailSubjectOnInProgress || "");
        setEmailBodyOnInProgress(s.emailBodyOnInProgress || "");
        setEmailSubjectOnCompleted(s.emailSubjectOnCompleted || "");
        setEmailBodyOnCompleted(s.emailBodyOnCompleted || "");
        setEmailSubjectOnCancelled(s.emailSubjectOnCancelled || "");
        setEmailBodyOnCancelled(s.emailBodyOnCancelled || "");
      }
    } catch (err) {
      console.error("Failed to load notification settings:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingGeneral(true);
      setSavedGeneral(false);

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          currencySymbol,
          phone,
          address,
          momoNumber,
          receiptFooter,
          defaultCommissionRate,
        }),
      });

      if (res.ok) {
        setSavedGeneral(true);
        triggerRefresh();
        setTimeout(() => setSavedGeneral(false), 3000);
      }
    } catch (err) {
      console.error("Save general settings error:", err);
    } finally {
      setSubmittingGeneral(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingNotifications(true);
      setSavedNotifications(false);

      const res = await fetch("/api/notification-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smsEnabled,
          mnotifyApiKey,
          smsSenderId,
          smsOnBooking,
          smsOnConfirmed,
          smsOnInProgress,
          smsOnCompleted,
          smsOnCancelled,
          emailEnabled,
          gmailUser,
          gmailAppPassword,
          emailFromName,
          emailSubjectOnBooking,
          emailBodyOnBooking,
          emailSubjectOnConfirmed,
          emailBodyOnConfirmed,
          emailSubjectOnInProgress,
          emailBodyOnInProgress,
          emailSubjectOnCompleted,
          emailBodyOnCompleted,
          emailSubjectOnCancelled,
          emailBodyOnCancelled,
        }),
      });

      if (res.ok) {
        setSavedNotifications(true);
        setTimeout(() => setSavedNotifications(false), 3000);
      }
    } catch (err) {
      console.error("Save notification settings error:", err);
    } finally {
      setSubmittingNotifications(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone) return;
    try {
      setTestingSms(true);
      setSmsTestFeedback(null);
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "test_sms", phone: testPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmsTestFeedback({ success: true, msg: "Test SMS sent successfully! Check your phone." });
      } else {
        setSmsTestFeedback({ success: false, msg: data.error || "Test SMS failed to send." });
      }
    } catch (err: any) {
      setSmsTestFeedback({ success: false, msg: err.message || "Failed to send test SMS" });
    } finally {
      setTestingSms(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    try {
      setTestingEmail(true);
      setEmailTestFeedback(null);
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "test_email", email: testEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailTestFeedback({ success: true, msg: "Test Email sent successfully! Check your inbox." });
      } else {
        setEmailTestFeedback({ success: false, msg: data.error || "Test Email failed to send." });
      }
    } catch (err: any) {
      setEmailTestFeedback({ success: false, msg: err.message || "Failed to send test email" });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            Barbershop Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage profile settings, mobile money receipts, and SMS/Email booking confirmations.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "general" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Store className="w-4 h-4" />
            General Profile
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "notifications" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bell className="w-4 h-4 text-orange-500" />
            SMS & Email Alerts
          </button>
        </div>
      </div>

      {/*  TAB 1: GENERAL PROFILE SETTINGS  */}
    
      {activeTab === "general" && (
        <div className="space-y-6">
          {savedGeneral && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Shop configuration settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleGeneralSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Barbershop Name *</label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Currency Symbol *</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Shop Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mobile Money Payment Number</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Physical Location / Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Receipt Footer Greeting Message</label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Default Barber Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultCommissionRate}
                  onChange={(e) => setDefaultCommissionRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-purple-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submittingGeneral}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                {submittingGeneral ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Shop Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 2: SMS & EMAIL NOTIFICATION SETTINGS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          {loadingNotifications ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 bg-white rounded-3xl border border-slate-100">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading notification templates and settings...</span>
            </div>
          ) : (
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              {savedNotifications && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>SMS and Email notification configurations updated successfully!</span>
                </div>
              )}

              {/* Template Placeholders Info Box */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <Info className="w-5 h-5" />
                  <span>Dynamic Message Placeholders</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You can use these placeholders in any SMS or Email body. They are automatically replaced with real booking details when sent:
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    "{{customerName}}",
                    "{{orderCode}}",
                    "{{date}}",
                    "{{time}}",
                    "{{barber}}",
                    "{{items}}",
                    "{{total}}",
                    "{{shopName}}",
                    "{{clientUrl}}",
                  ].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-white/10 text-orange-300 rounded-lg font-mono text-[11px] font-bold border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION A: SMS SETTINGS (mNotify) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">SMS Booking Notifications (mNotify)</h2>
                      <p className="text-xs text-slate-400">Send automated SMS text messages via mNotify Ghana API gateway.</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    <span className="ml-3 text-xs font-bold text-slate-800">{smsEnabled ? "SMS Enabled" : "SMS Disabled"}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">mNotify API Key</label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Paste your mNotify API key here..."
                        value={mnotifyApiKey}
                        onChange={(e) => setMnotifyApiKey(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">SMS Sender ID</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="e.g. BARBERSHOP"
                        value={smsSenderId}
                        onChange={(e) => setSmsSenderId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Max 11 alphanumeric characters (e.g. O2TRIMS or ECKINTOSH)</p>
                  </div>
                </div>

                {/* SMS Test Component */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-orange-500" />
                    Test mNotify Integration
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter phone number (e.g. 0241234567)"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestSms}
                      disabled={testingSms || !testPhone}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {testingSms ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Test SMS"}
                    </button>
                  </div>
                  {smsTestFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${smsTestFeedback.success ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      {smsTestFeedback.msg}
                    </div>
                  )}
                </div>

                {/* SMS Message Templates */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">SMS Message Templates</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">1. On Initial Booking (Order Placed)</label>
                    <textarea
                      rows={2}
                      value={smsOnBooking}
                      onChange={(e) => setSmsOnBooking(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">2. On Status Changed to "Confirmed"</label>
                    <textarea
                      rows={2}
                      value={smsOnConfirmed}
                      onChange={(e) => setSmsOnConfirmed(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3. On Status Changed to "In Progress"</label>
                    <textarea
                      rows={2}
                      value={smsOnInProgress}
                      onChange={(e) => setSmsOnInProgress(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">4. On Status Changed to "Completed"</label>
                    <textarea
                      rows={2}
                      value={smsOnCompleted}
                      onChange={(e) => setSmsOnCompleted(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">5. On Status Changed to "Cancelled"</label>
                    <textarea
                      rows={2}
                      value={smsOnCancelled}
                      onChange={(e) => setSmsOnCancelled(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: EMAIL SETTINGS (Gmail SMTP) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">Email Confirmation Alerts (Gmail SMTP)</h2>
                      <p className="text-xs text-slate-400">Send detailed HTML/Text emails using your Gmail account & App Password.</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-xs font-bold text-slate-800">{emailEnabled ? "Email Enabled" : "Email Disabled"}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Gmail Address</label>
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={gmailUser}
                      onChange={(e) => setGmailUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Gmail App Password</label>
                    <input
                      type="password"
                      placeholder="16-character app password"
                      value={gmailAppPassword}
                      onChange={(e) => setGmailAppPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sender From Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Eckintosh Barbering Co."
                      value={emailFromName}
                      onChange={(e) => setEmailFromName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email Test Component */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    Test Gmail SMTP Connection
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter recipient email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testingEmail || !testEmail}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Test Email"}
                    </button>
                  </div>
                  {emailTestFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${emailTestFeedback.success ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      {emailTestFeedback.msg}
                    </div>
                  )}
                </div>

                {/* Email Templates */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Email Message Templates</h3>

                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-900">1. On Initial Booking (Order Placed)</div>
                    <input
                      type="text"
                      placeholder="Subject line"
                      value={emailSubjectOnBooking}
                      onChange={(e) => setEmailSubjectOnBooking(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                    <textarea
                      rows={4}
                      value={emailBodyOnBooking}
                      onChange={(e) => setEmailBodyOnBooking(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-900">2. On Status Changed to "Confirmed"</div>
                    <input
                      type="text"
                      placeholder="Subject line"
                      value={emailSubjectOnConfirmed}
                      onChange={(e) => setEmailSubjectOnConfirmed(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                    <textarea
                      rows={4}
                      value={emailBodyOnConfirmed}
                      onChange={(e) => setEmailBodyOnConfirmed(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-900">3. On Status Changed to "Completed"</div>
                    <input
                      type="text"
                      placeholder="Subject line"
                      value={emailSubjectOnCompleted}
                      onChange={(e) => setEmailSubjectOnCompleted(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                    <textarea
                      rows={4}
                      value={emailBodyOnCompleted}
                      onChange={(e) => setEmailBodyOnCompleted(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-900">4. On Status Changed to "Cancelled"</div>
                    <input
                      type="text"
                      placeholder="Subject line"
                      value={emailSubjectOnCancelled}
                      onChange={(e) => setEmailSubjectOnCancelled(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                    <textarea
                      rows={4}
                      value={emailBodyOnCancelled}
                      onChange={(e) => setEmailBodyOnCancelled(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button for Notification Settings */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNotifications}
                  className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {submittingNotifications ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Notification Templates & Config</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
