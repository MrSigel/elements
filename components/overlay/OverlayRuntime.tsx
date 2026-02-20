"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Snapshot = {
  widget_instance_id: string | null;
  widget_type: string;
  state: Record<string, unknown>;
};

type Layout = { id: string; x: number; y: number; width: number; height: number; kind: string; name: string };

function WidgetCard({ kind, state }: { kind: string; state: Record<string, unknown> }) {
  if (kind === "wager_bar") {
    const value = Number(state.value ?? 0);
    const pct = Math.max(0, Math.min(100, value));
    return <div className="w-full"><p className="text-xs mb-1">Wager {value}</p><div className="h-2 bg-panelMuted rounded"><div className="h-2 bg-accent rounded" style={{ width: `${pct}%` }} /></div></div>;
  }
  if (kind === "current_playing") return <p className="text-sm">Now Playing: {String(state.game_name ?? state.game ?? "-")}</p>;
  if (kind === "deposit_withdrawal") return <p className="text-sm">{String(state.tx_type ?? "tx")} {String(state.amount ?? "")}</p>;
  if (kind === "tournament") return <p className="text-sm">Leaderboard updated</p>;
  if (kind === "bonushunt") return <p className="text-sm">Bonushunt running</p>;
  if (kind === "slot_battle") return <p className="text-sm">Battle state: {String(state.status ?? "idle")}</p>;
  if (kind === "slot_requests") return <p className="text-sm">Requests open</p>;
  if (kind === "hot_words") return <p className="text-sm">Hot words active</p>;
  if (kind === "wheel") return <p className="text-sm">Wheel result: {String(state.result ?? "-")}</p>;
  if (kind === "personal_bests") return <p className="text-sm">Personal bests</p>;
  if (kind === "quick_guessing") return <p className="text-sm">Guessing {String(state.status ?? "closed")}</p>;
  if (kind === "loyalty") return <p className="text-sm">Loyalty store live</p>;
  if (kind === "points_battle") return <p className="text-sm">Points battle live</p>;
  return <p className="text-sm">{kind}</p>;
}

export function OverlayRuntime({ overlayId, initialSnapshots, layout }: { overlayId: string; initialSnapshots: Snapshot[]; layout: Layout[] }) {
  const [snapshots, setSnapshots] = useState(initialSnapshots);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`overlay:${overlayId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "widget_snapshots", filter: `overlay_id=eq.${overlayId}` }, (payload) => {
        const next = payload.new as Snapshot;
        setSnapshots((curr) => {
          const idx = curr.findIndex((s) => s.widget_instance_id === next.widget_instance_id);
          if (idx === -1) return [...curr, next];
          const copy = [...curr];
          copy[idx] = next;
          return copy;
        });
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [overlayId]);

  const byWidget = useMemo(() => {
    const map = new Map<string, Snapshot>();
    for (const snap of snapshots) if (snap.widget_instance_id) map.set(snap.widget_instance_id, snap);
    return map;
  }, [snapshots]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent">
      {layout.map((item) => {
        const snap = byWidget.get(item.id);
        return (
          <div key={item.id} className="absolute" style={{ left: `${item.x}px`, top: `${item.y}px`, width: `${item.width}px`, height: `${item.height}px` }}>
            <div className="rounded bg-panel/80 border border-panelMuted px-3 py-2 w-full h-full">
              <p className="font-semibold text-xs uppercase tracking-wide mb-1">{item.name}</p>
              <WidgetCard kind={item.kind} state={snap?.state ?? {}} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

