"use client";

import { useState } from "react";
import type { WebsiteConfig, WebsiteDeal, WebsiteGiveaway } from "@/lib/website-config";

type Props = {
  publicUrl?: string;
  channelSlug?: string;
  initialConfig?: WebsiteConfig;
};

const EMPTY_DEAL: WebsiteDeal = { casinoName: "", casinoUrl: "", wager: "", bonusCode: "", actionAfterSignup: "" };
const EMPTY_GIVEAWAY: WebsiteGiveaway = { title: "", description: "", endAt: "" };

export function WebsiteBuilder({ publicUrl, channelSlug, initialConfig }: Props) {
  const [config, setConfig] = useState<WebsiteConfig>(initialConfig ?? { navBrand: "Elements", deals: [], giveaways: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "ok" | "error">("idle");

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
    try {
      const res = await fetch("/api/website/config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config })
      });
      if (!res.ok) throw new Error("save_failed");
      setSaveState("ok");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-panelMuted bg-panel p-4 space-y-4">
      <h3 className="text-lg font-semibold">Website Editor</h3>

      <div className="space-y-2">
        <label className="text-xs text-subtle">Navigation Name</label>
        <input
          value={config.navBrand}
          onChange={(e) => setConfig((prev) => ({ ...prev, navBrand: e.target.value }))}
          className="w-full rounded bg-panelMuted px-3 py-2"
          placeholder="Your Channel Name"
        />
      </div>

      {publicUrl ? (
        <div className="rounded border border-panelMuted bg-panelMuted/40 p-3">
          <p className="text-xs text-subtle mb-1">Your landing page link</p>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-accent underline break-all">
            {publicUrl}
          </a>
          {channelSlug ? <p className="mt-1 text-xs text-subtle">Slug: {channelSlug}</p> : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-subtle">Casino Deals</label>
          <button type="button" onClick={addDeal} className="rounded bg-accent px-2 py-1 text-xs text-black">Add Deal</button>
        </div>
        <div className="space-y-3 max-h-80 overflow-auto pr-1">
          {config.deals.length === 0 ? <p className="text-xs text-subtle">No deals yet.</p> : null}
          {config.deals.map((d, i) => (
            <div key={`${i}-${d.casinoName}`} className="rounded border border-panelMuted bg-panelMuted/40 p-2 space-y-2">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input placeholder="Casino Name" value={d.casinoName} onChange={(e) => updateDeal(i, "casinoName", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
                <input placeholder="Casino Link" value={d.casinoUrl} onChange={(e) => updateDeal(i, "casinoUrl", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input placeholder="Wager (e.g. 35x)" value={d.wager} onChange={(e) => updateDeal(i, "wager", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
                <input placeholder="Bonus Code" value={d.bonusCode} onChange={(e) => updateDeal(i, "bonusCode", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
              </div>
              <input placeholder="Bonus action after registration" value={d.actionAfterSignup} onChange={(e) => updateDeal(i, "actionAfterSignup", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1" />
              <button type="button" onClick={() => removeDeal(i)} className="rounded bg-danger/20 px-2 py-1 text-xs text-danger">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-subtle">Giveaways</label>
          <button type="button" onClick={addGiveaway} className="rounded bg-accent px-2 py-1 text-xs text-black">Add Giveaway</button>
        </div>
        <div className="space-y-3 max-h-80 overflow-auto pr-1">
          {config.giveaways.length === 0 ? <p className="text-xs text-subtle">No giveaways yet.</p> : null}
          {config.giveaways.map((g, i) => (
            <div key={`${i}-${g.title}`} className="rounded border border-panelMuted bg-panelMuted/40 p-2 space-y-2">
              <input placeholder="Title" value={g.title} onChange={(e) => updateGiveaway(i, "title", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1" />
              <input placeholder="Description" value={g.description} onChange={(e) => updateGiveaway(i, "description", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1" />
              <input placeholder="End date/time (optional)" value={g.endAt ?? ""} onChange={(e) => updateGiveaway(i, "endAt", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1" />
              <button type="button" onClick={() => removeGiveaway(i)} className="rounded bg-danger/20 px-2 py-1 text-xs text-danger">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" disabled={isSaving} onClick={saveConfig} className="rounded bg-accent px-3 py-2 text-sm font-semibold text-black disabled:opacity-70">
          {isSaving ? "Saving..." : "Save Website"}
        </button>
        {saveState === "ok" ? <p className="text-xs text-emerald-400">Saved.</p> : null}
        {saveState === "error" ? <p className="text-xs text-danger">Save failed.</p> : null}
      </div>
    </div>
  );
}
