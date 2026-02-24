"use client";

import { useState } from "react";
import type { WebsiteConfig, WebsiteDeal, WebsiteGiveaway, WebsiteTemplate } from "@/lib/website-config";

type Props = {
  publicUrl?: string;
  channelSlug?: string;
  initialConfig?: WebsiteConfig;
};

const EMPTY_DEAL: WebsiteDeal = { casinoName: "", casinoUrl: "", wager: "", bonusCode: "", actionAfterSignup: "" };
const EMPTY_GIVEAWAY: WebsiteGiveaway = { title: "", description: "", endAt: "" };

const TEMPLATES: { id: WebsiteTemplate; label: string; desc: string }[] = [
  { id: "dark", label: "Dark", desc: "Deep dark background with gold accents" },
  { id: "lite", label: "Lite", desc: "Clean white background with blue accents" }
];

export function WebsiteBuilder({ publicUrl, channelSlug, initialConfig }: Props) {
  const [config, setConfig] = useState<WebsiteConfig>(initialConfig ?? { navBrand: "Pulseframelabs", deals: [], giveaways: [], template: "dark" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "ok" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateDeal(index: number, key: keyof WebsiteDeal, value: string) {
    setConfig((prev) => {
      const nextDeals = [...prev.deals];
      nextDeals[index] = { ...nextDeals[index], [key]: value };
      return { ...prev, deals: nextDeals };
    });
  }

  function addDeal() {
    setConfig((prev) => ({ ...prev, deals: [...prev.deals, { ...EMPTY_DEAL }] }));
  }

  function removeDeal(index: number) {
    setConfig((prev) => ({ ...prev, deals: prev.deals.filter((_, i) => i !== index) }));
  }

  function updateGiveaway(index: number, key: keyof WebsiteGiveaway, value: string) {
    setConfig((prev) => {
      const next = [...prev.giveaways];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, giveaways: next };
    });
  }

  function addGiveaway() {
    setConfig((prev) => ({ ...prev, giveaways: [...prev.giveaways, { ...EMPTY_GIVEAWAY }] }));
  }

  function removeGiveaway(index: number) {
    setConfig((prev) => ({ ...prev, giveaways: prev.giveaways.filter((_, i) => i !== index) }));
  }

  async function saveConfig() {
    setIsSaving(true);
    setSaveState("idle");
    setSaveError(null);
    try {
      const res = await fetch("/api/website/config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "save_failed");
      }
      setSaveState("ok");
      setTimeout(() => setSaveState("idle"), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "save_failed");
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  const activeTemplate = config.template ?? "dark";

  return (
    <div className="space-y-6">
      {/* Public URL banner */}
      {publicUrl && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-subtle font-medium mb-0.5">Your public landing page</p>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline break-all">
              {publicUrl}
            </a>
          </div>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/25 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors flex-shrink-0"
          >
            Open ↗
          </a>
        </div>
      )}

      {/* Template selector */}
      <div className="rounded-xl border border-panelMuted bg-panel p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-text">Template</p>
          <p className="text-xs text-subtle mt-0.5">Choose the visual style for your public landing page. You can switch at any time.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => {
            const isActive = activeTemplate === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, template: t.id }))}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  isActive
                    ? "border-accent bg-accent/5"
                    : "border-panelMuted bg-panelMuted/20 hover:border-accent/40"
                }`}
              >
                {/* Mini preview */}
                {t.id === "dark" ? (
                  <div className="w-full h-20 rounded-lg overflow-hidden mb-2.5" style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="h-5 flex items-center px-2.5 gap-1.5" style={{ background: "rgba(10,13,20,0.9)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-10 h-1.5 rounded-full" style={{ background: "#f5c451" }} />
                      <div className="ml-auto flex gap-1">
                        <div className="w-5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                        <div className="w-5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                      </div>
                    </div>
                    <div className="px-2.5 pt-2 space-y-1.5">
                      <div className="flex gap-1 items-center">
                        <div className="w-0.5 h-3 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg,#f5c451,#b22234)" }} />
                        <div className="w-14 h-1.5 rounded-full" style={{ background: "#f5c451" }} />
                      </div>
                      <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <div className="w-4/5 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-20 rounded-lg overflow-hidden mb-2.5" style={{ background: "#f5f7fb", border: "1px solid #e2e8f0" }}>
                    <div className="h-5 flex items-center px-2.5 gap-1.5" style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
                      <div className="w-10 h-1.5 rounded-full" style={{ background: "#2563eb" }} />
                      <div className="ml-auto flex gap-1">
                        <div className="w-5 h-1.5 rounded-full" style={{ background: "#cbd5e1" }} />
                        <div className="w-5 h-1.5 rounded-full" style={{ background: "#cbd5e1" }} />
                      </div>
                    </div>
                    <div className="px-2.5 pt-2 space-y-1.5">
                      <div className="flex gap-1 items-center">
                        <div className="w-0.5 h-3 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg,#2563eb,#16a34a)" }} />
                        <div className="w-14 h-1.5 rounded-full" style={{ background: "#1e293b" }} />
                      </div>
                      <div className="w-full h-1 rounded-full" style={{ background: "#e2e8f0" }} />
                      <div className="w-4/5 h-1 rounded-full" style={{ background: "#e2e8f0" }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? "text-accent" : "text-text"}`}>{t.label}</p>
                    <p className="text-[11px] text-subtle mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                  {isActive && (
                    <span className="w-4 h-4 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ml-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l1.5 1.5 3.5-3" stroke="#000" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Site title */}
      <div className="rounded-xl border border-panelMuted bg-panel p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-text">Navigation</p>
          <p className="text-xs text-subtle mt-0.5">The name shown in your landing page&apos;s top navigation bar.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-subtle">Site Title</label>
          <input
            value={config.navBrand}
            onChange={(e) => setConfig((prev) => ({ ...prev, navBrand: e.target.value }))}
            className="w-full rounded bg-panelMuted px-3 py-2 text-sm"
            placeholder="Your Channel Name"
          />
        </div>
      </div>

      {/* Casino Deals */}
      <div className="rounded-xl border border-panelMuted bg-panel p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Casino Deals</p>
            <p className="text-xs text-subtle mt-0.5">Displayed as a table on the Home tab of your landing page.</p>
          </div>
          <button
            type="button"
            onClick={addDeal}
            className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-accent/90 transition-colors flex-shrink-0"
          >
            + Add Deal
          </button>
        </div>
        <div className="space-y-3">
          {config.deals.length === 0 ? (
            <p className="text-xs text-subtle/60 py-2">No deals yet — click &quot;+ Add Deal&quot; to add your first casino offer.</p>
          ) : null}
          {config.deals.map((d, i) => (
            <div key={`${i}-${d.casinoName}`} className="rounded-lg border border-panelMuted bg-panelMuted/30 p-3 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">Casino Name</label>
                  <input placeholder="e.g. Stake" value={d.casinoName} onChange={(e) => updateDeal(i, "casinoName", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">Casino URL</label>
                  <input placeholder="https://…" value={d.casinoUrl} onChange={(e) => updateDeal(i, "casinoUrl", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">Wagering Requirement</label>
                  <input placeholder="e.g. 35x" value={d.wager} onChange={(e) => updateDeal(i, "wager", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">Bonus Code</label>
                  <input placeholder="e.g. STREAM100" value={d.bonusCode} onChange={(e) => updateDeal(i, "bonusCode", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">What to do after signing up</label>
                <input placeholder="e.g. Make a first deposit to activate the bonus" value={d.actionAfterSignup} onChange={(e) => updateDeal(i, "actionAfterSignup", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
              </div>
              <button type="button" onClick={() => removeDeal(i)} className="rounded bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20 transition-colors">
                Remove deal
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Giveaways */}
      <div className="rounded-xl border border-panelMuted bg-panel p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Giveaways</p>
            <p className="text-xs text-subtle mt-0.5">Shown as cards on the Giveaways tab of your landing page.</p>
          </div>
          <button
            type="button"
            onClick={addGiveaway}
            className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-accent/90 transition-colors flex-shrink-0"
          >
            + Add Giveaway
          </button>
        </div>
        <div className="space-y-3">
          {config.giveaways.length === 0 ? (
            <p className="text-xs text-subtle/60 py-2">No giveaways yet — click &quot;+ Add Giveaway&quot; to add one.</p>
          ) : null}
          {config.giveaways.map((g, i) => (
            <div key={`${i}-${g.title}`} className="rounded-lg border border-panelMuted bg-panelMuted/30 p-3 space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">Title</label>
                <input placeholder="e.g. €500 Steam Gift Card" value={g.title} onChange={(e) => updateGiveaway(i, "title", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">Description</label>
                <input placeholder="How to enter, conditions, etc." value={g.description} onChange={(e) => updateGiveaway(i, "description", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-subtle/70 uppercase tracking-wide">End Date (optional)</label>
                <input placeholder="e.g. 31 Dec 2025" value={g.endAt ?? ""} onChange={(e) => updateGiveaway(i, "endAt", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1.5 text-sm" />
              </div>
              <button type="button" onClick={() => removeGiveaway(i)} className="rounded bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20 transition-colors">
                Remove giveaway
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isSaving}
          onClick={saveConfig}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-70 hover:bg-accent/90 transition-colors"
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
        {saveState === "ok" && (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Saved
          </span>
        )}
        {saveState === "error" && (
          <span className="text-xs text-danger">{saveError ?? "Save failed — try again"}</span>
        )}
      </div>
    </div>
  );
}
