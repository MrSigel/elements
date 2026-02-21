"use client";

import { useEffect, useMemo, useState } from "react";

type Deal = {
  casinoName: string;
  casinoUrl: string;
  wager: string;
  bonusCode: string;
  actionAfterSignup: string;
};

type Social = { label: string; url: string };

type WebsiteModel = {
  brandName: string;
  deals: Deal[];
  socials: Social[];
};

const STORAGE_KEY = "elements.website.builder.v2";

const DEFAULT_MODEL: WebsiteModel = {
  brandName: "ELEMENTS",
  deals: [
    { casinoName: "Casino One", casinoUrl: "https://example.com", wager: "35x", bonusCode: "WELCOME100", actionAfterSignup: "Deposit 20$ to unlock bonus" }
  ],
  socials: [
    { label: "Twitch", url: "https://twitch.tv/" },
    { label: "Kick", url: "https://kick.com/" },
    { label: "Discord", url: "https://discord.com/" }
  ]
};

export function WebsiteBuilder({ publicUrl }: { publicUrl?: string }) {
  const [model, setModel] = useState<WebsiteModel>(DEFAULT_MODEL);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WebsiteModel;
      if (parsed && typeof parsed === "object") setModel(parsed);
    } catch {
      // Keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
  }, [model]);

  function update<K extends keyof WebsiteModel>(key: K, value: WebsiteModel[K]) {
    setModel((prev) => ({ ...prev, [key]: value }));
  }

  function updateDeal(index: number, key: keyof Deal, value: string) {
    const next = [...model.deals];
    next[index] = { ...next[index], [key]: value };
    update("deals", next);
  }

  function addDeal() {
    update("deals", [...model.deals, { casinoName: "", casinoUrl: "", wager: "", bonusCode: "", actionAfterSignup: "" }]);
  }

  function removeDeal(index: number) {
    update("deals", model.deals.filter((_, i) => i !== index));
  }

  const exportJson = useMemo(() => JSON.stringify(model, null, 2), [model]);

  return (
    <div className="rounded-xl border border-panelMuted bg-panel p-4 space-y-4">
        <h3 className="text-lg font-semibold">Website Editor</h3>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Brand Name</label>
          <input value={model.brandName} onChange={(e) => update("brandName", e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" />
        </div>

        {publicUrl ? (
          <div className="rounded border border-panelMuted bg-panelMuted/40 p-3">
            <p className="text-xs text-subtle mb-1">Your landing page link</p>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-accent underline break-all">
              {publicUrl}
            </a>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-xs text-subtle">Navigation Links (Label|URL, one per line)</label>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-subtle">Current Offers Table</label>
            <button onClick={addDeal} className="rounded bg-accent px-2 py-1 text-xs text-black">Add Deal</button>
          </div>
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {model.deals.map((d, i) => (
              <div key={`${i}-${d.casinoName}`} className="rounded border border-panelMuted bg-panelMuted/40 p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Casino Name" value={d.casinoName} onChange={(e) => updateDeal(i, "casinoName", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
                  <input placeholder="Casino Link" value={d.casinoUrl} onChange={(e) => updateDeal(i, "casinoUrl", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Wager (e.g. 35x)" value={d.wager} onChange={(e) => updateDeal(i, "wager", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
                  <input placeholder="Bonus Code" value={d.bonusCode} onChange={(e) => updateDeal(i, "bonusCode", e.target.value)} className="rounded bg-panelMuted px-2 py-1" />
                </div>
                <input placeholder="Action after registration" value={d.actionAfterSignup} onChange={(e) => updateDeal(i, "actionAfterSignup", e.target.value)} className="w-full rounded bg-panelMuted px-2 py-1" />
                <button onClick={() => removeDeal(i)} className="rounded bg-danger/20 px-2 py-1 text-xs text-danger">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <details className="rounded border border-panelMuted bg-panelMuted/40 p-2">
          <summary className="cursor-pointer text-sm font-medium">Export JSON</summary>
          <pre className="mt-2 text-xs overflow-auto">{exportJson}</pre>
        </details>
    </div>
  );
}
