"use client";

import { useState } from "react";

const kinds = ["wager_bar","deposit_withdrawal","current_playing","bonushunt","tournament","slot_battle","slot_requests","hot_words","wheel","personal_bests","quick_guessing","loyalty","points_battle"];

type Widget = { id: string; kind: string; name: string; x: number; y: number; width: number; height: number; is_enabled: boolean; widget_configs?: { config: Record<string, unknown> }[] };

export function WidgetInstanceManager({ overlayId, widgets }: { overlayId: string; widgets: Widget[] }) {
  const [name, setName] = useState("New Widget");
  const [kind, setKind] = useState(kinds[0]);

  async function createWidget() {
    await fetch("/api/widget-instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overlayId, kind, name, x: 0, y: 0, width: 300, height: 180 })
    });
    location.reload();
  }

  async function toggle(id: string, current: boolean) {
    await fetch(`/api/widget-instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_enabled: !current })
    });
    location.reload();
  }

  async function remove(id: string) {
    await fetch(`/api/widget-instances/${id}`, { method: "DELETE" });
    location.reload();
  }

  async function saveConfig(id: string, next: string) {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(next);
    } catch {
      return;
    }

    await fetch(`/api/widget-instances/${id}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: parsed })
    });
    location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-panelMuted bg-panel p-3 flex gap-2">
        <select className="rounded bg-panelMuted px-3 py-2" value={kind} onChange={(e) => setKind(e.target.value)}>
          {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input className="rounded bg-panelMuted px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={createWidget} className="rounded bg-accent text-black px-3 py-2">Add Widget</button>
      </div>
      {widgets.map((w) => (
        <div key={w.id} className="rounded-lg border border-panelMuted bg-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium capitalize">{w.name} ({w.kind})</p>
            <div className="flex gap-2">
              <button onClick={() => toggle(w.id, w.is_enabled)} className="rounded bg-panelMuted px-2 py-1 text-sm">{w.is_enabled ? "Disable" : "Enable"}</button>
              <button onClick={() => remove(w.id)} className="rounded bg-danger/20 text-danger px-2 py-1 text-sm">Delete</button>
            </div>
          </div>
          <textarea
            defaultValue={JSON.stringify(w.widget_configs?.[0]?.config ?? {}, null, 2)}
            className="w-full min-h-28 rounded bg-panelMuted p-2 font-mono text-xs"
            onBlur={(e) => saveConfig(w.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

