"use client";

import { useState } from "react";

type LayoutItem = { id: string; x: number; y: number; width: number; height: number; layer_index: number };

export function LayoutEditor({ initial, overlayId }: { initial: LayoutItem[]; overlayId: string }) {
  const [items, setItems] = useState(initial);

  async function persist() {
    await fetch("/api/widgets/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overlayId,
        widgetType: "wager_bar",
        eventType: "layout_updated",
        payload: { layout: items }
      })
    });
  }

  return (
    <div className="space-y-2">
      <button onClick={persist} className="rounded bg-accent text-black px-3 py-2">Persist layout</button>
      <pre className="text-xs bg-panel border border-panelMuted rounded p-3">{JSON.stringify(items, null, 2)}</pre>
    </div>
  );
}

