"use client";

import { useState } from "react";
import { WidgetInstanceManager } from "@/components/forms/WidgetInstanceManager";
import { WidgetControlDeck } from "@/components/forms/WidgetControlDeck";
import { LayoutEditor } from "@/components/dashboard/LayoutEditor";

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

const tabs = [
  { id: "widgets", label: "Widgets" },
  { id: "layout", label: "Layout" },
  { id: "live", label: "Live Controls" },
  { id: "preview", label: "Preview" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export function WidgetsTabs({ overlayId, widgets }: { overlayId: string; widgets: WidgetRow[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("widgets");
  const [openHelp, setOpenHelp] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-3 py-2 text-sm ${activeTab === tab.id ? "bg-accent text-black" : "bg-panelMuted text-text"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "widgets" ? (
        <section className="space-y-3">
          <div className="rounded-lg border border-panelMuted bg-panel p-3">
            <button
              type="button"
              onClick={() => setOpenHelp((v) => !v)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-panelMuted bg-panelMuted text-sm font-bold"
              aria-label="Widget help"
            >
              ?
            </button>
            {openHelp ? (
              <div className="mt-3 space-y-2 text-sm text-subtle">
                <p><span className="text-text font-medium">How it works:</span> add widgets here, edit each JSON config, then place them in the Layout tab.</p>
                <p><span className="text-text font-medium">Automatic data flow:</span> widget data is sent through API events and ingest jobs (extension/bot/webhooks), then stored and rendered live in overlays.</p>
                <p><span className="text-text font-medium">Manual fallback:</span> you can always trigger updates in the Live Controls tab if no external event arrived yet.</p>
              </div>
            ) : null}
          </div>
          <WidgetInstanceManager overlayId={overlayId} widgets={widgets} />
        </section>
      ) : null}

      {activeTab === "layout" ? <LayoutEditor overlayId={overlayId} initial={widgets} /> : null}
      {activeTab === "live" ? <WidgetControlDeck overlayId={overlayId} /> : null}
      {activeTab === "preview" ? (
        <div className="space-y-2">
          <iframe
            src={`/overlay-preview/${overlayId}`}
            className="w-full rounded-lg border border-panelMuted bg-bg-deep"
            style={{ height: "500px" }}
          />
          <a
            href={`/overlay-preview/${overlayId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-accent hover:underline"
          >
            Open fullscreen →
          </a>
        </div>
      ) : null}
    </div>
  );
}

