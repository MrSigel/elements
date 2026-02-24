"use client";

import { useState } from "react";
import { OverlayCreateForm } from "@/components/forms/OverlayCreateForm";
import { OverlayTable } from "@/components/forms/OverlayTable";
import { TwitchSuccessBanner } from "@/components/TwitchSuccessBanner";
import { WidgetsTabs } from "@/components/dashboard/WidgetsTabs";

type OverlayRow = {
  id: string;
  name: string;
  is_published: boolean;
  width: number;
  height: number;
  overlay_tokens?: { public_token: string; revoked: boolean }[] | { public_token: string; revoked: boolean } | null;
};

type WidgetRow = {
  id: string;
  kind: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layer_index: number;
  is_enabled: boolean;
  widget_configs?: { config: Record<string, unknown> }[];
  widget_tokens?: { public_token: string; revoked: boolean }[] | { public_token: string; revoked: boolean } | null;
};

type Tab = "overlays" | "widgets";

export function OverlayStudio({
  overlays,
  overlayId,
  widgets,
  plan,
  showTwitchBanner
}: {
  overlays: OverlayRow[];
  overlayId: string | undefined;
  widgets: WidgetRow[];
  plan: string;
  showTwitchBanner: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overlays");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-white/[0.07] mb-6">
        {(["overlays", "widgets"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={
              activeTab === tab
                ? "px-5 pb-2.5 pt-1 text-sm font-semibold text-accent border-b-2 border-accent -mb-px transition-colors"
                : "px-5 pb-2.5 pt-1 text-sm font-medium text-subtle/70 hover:text-text border-b-2 border-transparent -mb-px transition-colors"
            }
          >
            {tab === "overlays" ? "Overlays" : "Widgets"}
          </button>
        ))}
      </div>

      {/* Tab: Overlays */}
      {activeTab === "overlays" && (
        <div className="space-y-6">
          {showTwitchBanner && <TwitchSuccessBanner />}

          <div>
            <h1 className="text-2xl font-black text-text">Overlays</h1>
            <p className="text-sm text-subtle mt-1">
              Create and manage your OBS overlay sources. Each overlay gets a public BrowserSource URL you add to OBS.
            </p>
          </div>

          {/* OBS Setup Guide */}
          <section className="rounded-xl border border-accent/15 bg-accent/5 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-accent flex-shrink-0">
                <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5 12v2M11 12v2M4 14h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">How overlays work in OBS</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: 1, title: "Create an Overlay", body: "Use the form below to create a new overlay. Choose a name and set the resolution (default 1920×1080)." },
                { n: 2, title: "Copy the OBS URL", body: <span>Click <span className="text-text font-medium">Copy OBS URL</span> in the overlay row. This is the unique BrowserSource link for your overlay.</span> },
                { n: 3, title: "Add to OBS", body: <span>In OBS: <span className="text-text font-medium">Sources → + → Browser Source</span>. Paste the URL. Set width/height to match (e.g. 1920 × 1080).</span> },
                { n: 4, title: "Control in Dashboard", body: <span>Switch to the <span className="text-text font-medium">Widgets tab → Live Controls</span>. Changes appear live in OBS instantly.</span> }
              ].map(({ n, title, body }) => (
                <div key={n} className="rounded-lg border border-panelMuted bg-panel/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[11px] font-black flex items-center justify-center flex-shrink-0">{n}</span>
                    <p className="text-xs font-semibold text-text">{title}</p>
                  </div>
                  <p className="text-xs text-subtle leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-subtle/50 leading-relaxed">
              The overlay is a transparent webpage displayed over your stream. It updates in real time via Supabase Realtime — no page reload or OBS interaction required.
            </p>
          </section>

          <OverlayCreateForm />
          <OverlayTable overlays={overlays as never[]} />
        </div>
      )}

      {/* Tab: Widgets */}
      {activeTab === "widgets" && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-black text-text">Widgets</h1>
            <p className="text-sm text-subtle mt-1">
              Add widgets to your overlay and configure their behavior. Use Live Controls to trigger events manually during your stream.
            </p>
          </div>

          {overlayId ? (
            <WidgetsTabs overlayId={overlayId} widgets={widgets} plan={plan} />
          ) : (
            <div className="rounded-lg border border-panelMuted bg-panel p-8 text-center">
              <p className="text-sm font-semibold text-text mb-1">No overlay yet</p>
              <p className="text-xs text-subtle">
                Go to the{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("overlays")}
                  className="text-accent hover:underline"
                >
                  Overlays tab
                </button>{" "}
                and create your first overlay before adding widgets.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
