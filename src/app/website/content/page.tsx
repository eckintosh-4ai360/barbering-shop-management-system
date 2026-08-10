"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Save,
  CheckCircle2,
  Loader2,
  Store,
  Image as ImageIcon,
  BarChart3,
  Sparkles,
  Layout,
  MapPin,
  Search,
  Upload,
  Camera,
  X,
} from "lucide-react";

type FieldDef = { key: string; label: string; hint?: string; type?: "text" | "textarea" | "url" | "image"; span?: 2 };

const SECTIONS: { title: string; description: string; icon: React.ElementType; fields: FieldDef[] }[] = [
  {
    title: "Brand & Announcement",
    description: "Your shop name shown in the navbar, footer, and browser tab",
    icon: Store,
    fields: [
      { key: "shopName", label: "Shop Name" },
      { key: "tagline", label: "Tagline" },
      { key: "announcementText", label: "Top Announcement Bar Text", span: 2 },
    ],
  },
  {
    title: "Homepage Hero Section",
    description: "The large banner at the top of your homepage",
    icon: ImageIcon,
    fields: [
      { key: "heroBadgeText", label: "Badge Text (above headline)", span: 2 },
      { key: "heroHeading", label: "Headline — Line 1" },
      { key: "heroHeadingAccent", label: "Headline — Line 2 (highlighted)" },
      { key: "heroSubtext", label: "Subheading Paragraph", type: "textarea", span: 2 },
      { key: "heroImageUrl", label: "Hero Image", type: "image", span: 2 },
    ],
  },
  {
    title: "Stat Highlights",
    description: "The three numbers shown under the hero text",
    icon: BarChart3,
    fields: [
      { key: "statValue1", label: "Stat 1 Value" },
      { key: "statLabel1", label: "Stat 1 Label" },
      { key: "statValue2", label: "Stat 2 Value" },
      { key: "statLabel2", label: "Stat 2 Label" },
      { key: "statValue3", label: "Stat 3 Value" },
      { key: "statLabel3", label: "Stat 3 Label" },
    ],
  },
  {
    title: '"Why Choose Us" Cards',
    description: "Three highlight cards shown near the bottom of your homepage",
    icon: Sparkles,
    fields: [
      { key: "whyTitle1", label: "Card 1 Title" },
      { key: "whyText1", label: "Card 1 Text", type: "textarea" },
      { key: "whyTitle2", label: "Card 2 Title" },
      { key: "whyText2", label: "Card 2 Text", type: "textarea" },
      { key: "whyTitle3", label: "Card 3 Title" },
      { key: "whyText3", label: "Card 3 Text", type: "textarea" },
    ],
  },
  {
    title: "Footer, Hours & Contact",
    description: "Shown in the site footer on every page",
    icon: MapPin,
    fields: [
      { key: "footerDescription", label: "Footer Description", type: "textarea", span: 2 },
      { key: "footerBadgeText", label: "Footer Award/Badge Text", span: 2 },
      { key: "hoursWeekday", label: "Hours — Monday to Friday" },
      { key: "hoursSaturday", label: "Hours — Saturday" },
      { key: "hoursSunday", label: "Hours — Sunday" },
      { key: "contactPhone", label: "Contact Phone" },
      { key: "contactEmail", label: "Contact Email" },
      { key: "contactAddress", label: "Shop Address", span: 2 },
    ],
  },
  {
    title: "Search Engine (SEO)",
    description: "How your site appears in Google and browser tabs",
    icon: Search,
    fields: [
      { key: "seoTitle", label: "Page Title", span: 2 },
      { key: "seoDescription", label: "Meta Description", type: "textarea", span: 2 },
    ],
  },
];

export default function WebsiteContentPage() {
  const { refreshTrigger, triggerRefresh } = useApp();

  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const handleHeroFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateField("heroImageUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/storefront/settings");
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.settings) setForm(data.settings);
        }
      } catch (err) {
        console.error("Fetch website content error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshTrigger]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSaved(false);
      const res = await fetch("/api/storefront/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        triggerRefresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save website content error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-100">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading website content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Website Content & Branding</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit the wording, hero section, and contact info shown across your public website
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Website content updated — changes are now live on your site!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-1">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-800">{section.title}</h2>
                  <p className="text-[11px] text-slate-400">{section.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        rows={2}
                        value={form[field.key] ?? ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : field.type === "image" ? (
                      <div className="space-y-3">
                        {/* Preview */}
                        {form[field.key] && (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-40 bg-slate-100">
                            <img src={form[field.key]} alt="Hero preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => { updateField(field.key, ""); if (heroFileRef.current) heroFileRef.current.value = ""; }}
                              className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {/* File picker */}
                        <div className="flex items-center gap-3">
                          <input
                            ref={heroFileRef}
                            id="hero-image-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleHeroFile}
                          />
                          <label
                            htmlFor="hero-image-file"
                            className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            {form[field.key] ? "Change Image" : "Choose from File"}
                          </label>
                          <span className="text-[10px] text-slate-400">JPG, PNG, WEBP · Max 5MB</span>
                        </div>
                        {/* URL fallback */}
                        <input
                          type="url"
                          placeholder="Or paste an image URL..."
                          value={form[field.key]?.startsWith("data:") ? "" : (form[field.key] ?? "")}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type === "url" ? "url" : "text"}
                        value={form[field.key] ?? ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    )}
                  </div>
                ))}
              </div>


            </div>
          );
        })}

        <div className="sticky bottom-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Website Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
