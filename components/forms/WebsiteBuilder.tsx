"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Deal = {
  casinoName: string;
  casinoUrl: string;
  wager: string;
  bonusCode: string;
  actionAfterSignup: string;
};

type Social = { label: string; url: string };
type WindowRect = { x: number; y: number; width: number; height: number };

type WebsiteModel = {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  deals: Deal[];
  socials: Social[];
  offersWindow: WindowRect;
  socialsWindow: WindowRect;
};

const STORAGE_KEY = "elements.website.builder.v2";

const DEFAULT_MODEL: WebsiteModel = {
  brandName: "ELEMENTS",
  heroTitle: "Your Stream. Your Casino Hub.",
  heroSubtitle: "Create a clean landing page with your casino deals, bonus codes and stream links.",
  ctaLabel: "Watch Live",
  ctaUrl: "https://twitch.tv/",
  deals: [
    { casinoName: "Casino One", casinoUrl: "https://example.com", wager: "35x", bonusCode: "WELCOME100", actionAfterSignup: "Deposit 20$ to unlock bonus" }
  ],
  socials: [
    { label: "Twitch", url: "https://twitch.tv/" },
    { label: "Kick", url: "https://kick.com/" },
    { label: "Discord", url: "https://discord.com/" }
  ],
  offersWindow: { x: 32, y: 24, width: 860, height: 320 },
  socialsWindow: { x: 32, y: 360, width: 420, height: 140 }
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function DragResizeWindow({
  title,
  rect,
  onChange,
  children
}: {
  title: string;
  rect: WindowRect;
  onChange: (next: WindowRect) => void;
  children: React.ReactNode;
}) {
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; baseW: number; baseH: number } | null>(null);

  function onDragStart(e: React.MouseEvent<HTMLDivElement>) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: rect.x, baseY: rect.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onChange({ ...rect, x: clamp(dragRef.current.baseX + dx, 0, 1200), y: clamp(dragRef.current.baseY + dy, 0, 1200) });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function onResizeStart(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, baseW: rect.width, baseH: rect.height };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = ev.clientX - resizeRef.current.startX;
      const dh = ev.clientY - resizeRef.current.startY;
      onChange({
        ...rect,
        width: clamp(resizeRef.current.baseW + dw, 280, 1200),
        height: clamp(resizeRef.current.baseH + dh, 120, 900)
      });
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      className="absolute rounded-xl border border-[#2a3142] bg-[#111827] shadow-xl overflow-hidden"
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
    >
      <div className="cursor-move select-none border-b border-[#2a3142] bg-[#0b1220] px-3 py-2 text-sm font-semibold" onMouseDown={onDragStart}>
        {title}
      </div>
      <div className="h-[calc(100%-36px)] overflow-auto p-3">{children}</div>
      <div
        className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize rounded-sm bg-amber-300/70"
        onMouseDown={onResizeStart}
      />
    </div>
  );
}

export function WebsiteBuilder() {
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
    <div className="grid gap-6 lg:grid-cols-[520px_1fr]">
      <section className="rounded-xl border border-panelMuted bg-panel p-4 space-y-4">
        <h3 className="text-lg font-semibold">Website Editor</h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-xs text-subtle">Brand Name</label>
            <input value={model.brandName} onChange={(e) => update("brandName", e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-subtle">CTA Label</label>
            <input value={model.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Hero Title</label>
          <input value={model.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">Hero Subtitle</label>
          <textarea value={model.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2 min-h-20" />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-subtle">CTA URL</label>
          <input value={model.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" />
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

      <section className="rounded-xl border border-panelMuted bg-[#0a0d14] overflow-hidden">
        <header className="border-b border-[#2a3142] bg-[#0d1320] px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="font-bold tracking-wide text-white">{model.brandName}</p>
            <nav className="flex gap-4 text-sm text-slate-300">
              <a href="#offers">Offers</a>
              <a href="#stream">Stream</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </header>

        <div className="relative h-[720px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#17101f] via-[#0f1320] to-[#2d0f13]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,.14),transparent_50%)]" />

          <div className="relative z-10 px-8 pt-10">
            <h2 className="text-4xl font-black text-white max-w-3xl">{model.heroTitle}</h2>
            <p className="mt-3 max-w-2xl text-slate-300">{model.heroSubtitle}</p>
            <a href={model.ctaUrl} target="_blank" rel="noreferrer" className="inline-block mt-5 rounded-lg bg-gradient-to-r from-amber-300 to-rose-600 px-6 py-3 font-semibold text-black">
              {model.ctaLabel}
            </a>
          </div>

          <DragResizeWindow title="Current Offers" rect={model.offersWindow} onChange={(next) => update("offersWindow", next)}>
            <div className="overflow-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-left text-slate-300">
                    <th className="pb-2 pr-3">Casino</th>
                    <th className="pb-2 pr-3">Link</th>
                    <th className="pb-2 pr-3">Wager</th>
                    <th className="pb-2 pr-3">Bonus Code</th>
                    <th className="pb-2">After Register</th>
                  </tr>
                </thead>
                <tbody>
                  {model.deals.map((deal, i) => (
                    <tr key={`${deal.casinoName}-${i}`} className="border-t border-[#2a3142] align-top">
                      <td className="py-2 pr-3">{deal.casinoName || "-"}</td>
                      <td className="py-2 pr-3">
                        {deal.casinoUrl ? (
                          <a href={deal.casinoUrl} target="_blank" rel="noreferrer" className="text-amber-300 underline">Open</a>
                        ) : "-"}
                      </td>
                      <td className="py-2 pr-3">{deal.wager || "-"}</td>
                      <td className="py-2 pr-3">{deal.bonusCode || "-"}</td>
                      <td className="py-2">{deal.actionAfterSignup || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DragResizeWindow>

          <DragResizeWindow title="Community Links" rect={model.socialsWindow} onChange={(next) => update("socialsWindow", next)}>
            <div className="flex flex-wrap gap-2">
              {model.socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="rounded border border-[#344055] bg-[#0f1728] px-3 py-2 text-xs text-slate-200">
                  {s.label}
                </a>
              ))}
            </div>
          </DragResizeWindow>
        </div>

        <footer className="border-t border-[#2a3142] bg-[#0d1320] px-6 py-3 text-center text-xs text-slate-400">
          Copyright Elements
        </footer>
      </section>
    </div>
  );
}

