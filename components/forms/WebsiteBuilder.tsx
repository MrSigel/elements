"use client";

import { useEffect, useMemo, useState } from "react";

type WebsiteModel = {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  offers: string[];
  features: string[];
  socials: { label: string; url: string }[];
};

const STORAGE_KEY = "elements.website.builder.v1";

const DEFAULT_MODEL: WebsiteModel = {
  brandName: "DIEGAWINOS STYLE",
  heroTitle: "Casino Streaming, Elevated.",
  heroSubtitle: "Build your public page with offers, social links, and live stream highlights in one place.",
  ctaLabel: "Join The Stream",
  ctaUrl: "https://twitch.tv/",
  offers: ["100% Welcome Bonus", "Daily Reload", "Free Spins Weekend"],
  features: [
    "Bonushunt frontpage with live stats",
    "Current playing auto-tracked",
    "Slot requests and raffle interactions",
    "Hotwords and viewer engagement tools"
  ],
  socials: [
    { label: "Twitch", url: "https://twitch.tv/" },
    { label: "Kick", url: "https://kick.com/" },
    { label: "Discord", url: "https://discord.com/" }
  ]
};

export function WebsiteBuilder() {
  const [model, setModel] = useState<WebsiteModel>(DEFAULT_MODEL);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WebsiteModel;
      if (!parsed || typeof parsed !== "object") return;
      setModel(parsed);
    } catch {
      // Ignore broken local state and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
  }, [model]);

  function update<K extends keyof WebsiteModel>(key: K, value: WebsiteModel[K]) {
    setModel((prev) => ({ ...prev, [key]: value }));
  }

  const exportJson = useMemo(() => JSON.stringify(model, null, 2), [model]);

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-xl border border-panelMuted bg-panel p-4 space-y-4">
        <h3 className="text-lg font-semibold">Website Editor</h3>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Brand Name</label>
          <input
            value={model.brandName}
            onChange={(e) => update("brandName", e.target.value)}
            className="w-full rounded bg-panelMuted px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Hero Title</label>
          <input
            value={model.heroTitle}
            onChange={(e) => update("heroTitle", e.target.value)}
            className="w-full rounded bg-panelMuted px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Hero Subtitle</label>
          <textarea
            value={model.heroSubtitle}
            onChange={(e) => update("heroSubtitle", e.target.value)}
            className="w-full rounded bg-panelMuted px-3 py-2 min-h-20"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-xs text-subtle">CTA Label</label>
            <input
              value={model.ctaLabel}
              onChange={(e) => update("ctaLabel", e.target.value)}
              className="w-full rounded bg-panelMuted px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-subtle">CTA URL</label>
            <input
              value={model.ctaUrl}
              onChange={(e) => update("ctaUrl", e.target.value)}
              className="w-full rounded bg-panelMuted px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Offers (one per line)</label>
          <textarea
            value={model.offers.join("\n")}
            onChange={(e) => update("offers", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
            className="w-full rounded bg-panelMuted px-3 py-2 min-h-20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Feature Bullets (one per line)</label>
          <textarea
            value={model.features.join("\n")}
            onChange={(e) => update("features", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
            className="w-full rounded bg-panelMuted px-3 py-2 min-h-24"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Social Links (Label|URL, one per line)</label>
          <textarea
            value={model.socials.map((s) => `${s.label}|${s.url}`).join("\n")}
            onChange={(e) => {
              const next = e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [label, url] = line.split("|");
                  return { label: (label ?? "").trim(), url: (url ?? "").trim() };
                })
                .filter((s) => s.label && s.url);
              update("socials", next);
            }}
            className="w-full rounded bg-panelMuted px-3 py-2 min-h-20"
          />
        </div>

        <details className="rounded border border-panelMuted bg-panelMuted/40 p-2">
          <summary className="cursor-pointer text-sm font-medium">Export JSON</summary>
          <pre className="mt-2 text-xs overflow-auto">{exportJson}</pre>
        </details>
      </section>

      <section className="rounded-xl border border-panelMuted bg-[#0a0d14] p-0 overflow-hidden">
        <div className="relative px-6 py-10 md:px-10 bg-gradient-to-br from-[#17101f] via-[#0f1320] to-[#2d0f13]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,.15),transparent_45%)]" />
          <div className="relative z-10">
            <p className="text-xs tracking-[0.2em] uppercase text-amber-300">{model.brandName}</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-black leading-tight text-white max-w-3xl">{model.heroTitle}</h2>
            <p className="mt-4 text-sm md:text-base text-slate-300 max-w-2xl">{model.heroSubtitle}</p>
            <a href={model.ctaUrl} target="_blank" rel="noreferrer" className="inline-block mt-6 rounded-lg bg-gradient-to-r from-amber-300 to-rose-600 px-6 py-3 font-semibold text-black">
              {model.ctaLabel}
            </a>
          </div>
        </div>

        <div className="p-6 md:p-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#2a3142] bg-[#111827] p-4">
            <h3 className="text-lg font-semibold mb-3">Current Offers</h3>
            <div className="space-y-2">
              {model.offers.map((o, i) => (
                <div key={`${o}-${i}`} className="rounded-md border border-[#2a3142] bg-[#0b1220] px-3 py-2 text-sm">
                  {o}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#2a3142] bg-[#111827] p-4">
            <h3 className="text-lg font-semibold mb-3">Why Viewers Stay</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {model.features.map((f, i) => (
                <li key={`${f}-${i}`}>- {f}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a3142] px-6 py-4 md:px-8">
          <p className="text-xs text-slate-400 mb-2">Community Links</p>
          <div className="flex flex-wrap gap-2">
            {model.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="rounded border border-[#344055] bg-[#0f1728] px-3 py-2 text-xs text-slate-200">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

