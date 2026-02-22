"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Snapshot = {
  widget_instance_id: string | null;
  widget_type: string;
  state: Record<string, unknown>;
};

type Layout = { id: string; x: number; y: number; width: number; height: number; kind: string; name: string };

function asNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return fallback;
}

function money(value: unknown) { return String(asNumber(value, 0)) + "$"; }

function WidgetCard({ kind, state }: { kind: string; state: Record<string, unknown> }) {
  if (kind === "wager_bar") {
    const value = Number(state.value ?? 0);
    const pct = Math.max(0, Math.min(100, value));
    return <div className="w-full"><p className="text-xs mb-1">Wager {value}</p><div className="h-2 bg-panelMuted rounded"><div className="h-2 bg-accent rounded" style={{ width: `${pct}%` }} /></div></div>;
  }

  if (kind === "current_playing") {
    return (
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 text-white">
        <div>
          <p className="text-xs text-accent font-semibold">Current Game</p>
          <p className="text-sm font-bold">{asString(state.game_name)}</p>
          <p className="text-xs text-subtle mt-1">{asString(state.provider)}</p>
        </div>
        <div>
          <p className="text-xs text-accent font-semibold">Info</p>
          <p className="text-sm">Potential {asString(state.potential, "5000x")}</p>
          <p className="text-sm">RTP {asString(state.rtp, "96.50%")}</p>
          <p className="text-sm">Volatility {asString(state.volatility, "High")}</p>
        </div>
        <div>
          <p className="text-xs text-accent font-semibold">Personal Record</p>
          <p className="text-sm">Win {money(state.best_win)}</p>
          <p className="text-sm">X {asString(state.best_x, "0x")}</p>
          <p className="text-sm">Avg-Win {money(state.avg_win)}</p>
        </div>
      </div>
    );
  }

  if (kind === "deposit_withdrawal") {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded bg-panelMuted/50 p-2">
            <p className="text-xs text-subtle">Deposits</p>
            <p className="font-semibold text-green-400">{money(state.total_deposits)}</p>
          </div>
          <div className="rounded bg-panelMuted/50 p-2">
            <p className="text-xs text-subtle">Withdrawals</p>
            <p className="font-semibold text-red-400">{money(state.total_withdrawals)}</p>
          </div>
          <div className="rounded bg-panelMuted/50 p-2">
            <p className="text-xs text-subtle">Balance</p>
            <p className="font-semibold">{money(state.balance)}</p>
          </div>
        </div>
        {state.tx_type ? <p className="text-xs text-subtle">Last: {asString(state.tx_type)} {money(state.amount)}</p> : null}
      </div>
    );
  }

  if (kind === "tournament") {
    const rows = Array.isArray(state.standings) ? state.standings as Record<string, unknown>[] : [];
    return (
      <div className="space-y-1 text-sm">
        {rows.length === 0 ? <p className="text-subtle">No tournament scores yet.</p> : rows.slice(0, 8).map((r, i) => (
          <div key={String(r.participant ?? i)} className="flex justify-between"><span>{i + 1}. {asString(r.participant, "Player")}</span><span className="font-semibold">{asNumber(r.score, 0)}</span></div>
        ))}
      </div>
    );
  }

  if (kind === "bonushunt") {
    const entries = Array.isArray(state.entries) ? state.entries as Record<string, unknown>[] : [];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-accent">{asString(state.title, "Bonus Hunt")}</span>
          <span>{asNumber(state.opened, 0)}/{asNumber(state.total, entries.length)}</span>
        </div>
        <div className="grid grid-cols-4 text-sm border border-panelMuted rounded overflow-hidden">
          <div className="p-2 text-center">{money(state.total_buyins)}</div>
          <div className="p-2 text-center border-l border-panelMuted">{money(state.total_win)}</div>
          <div className="p-2 text-center border-l border-panelMuted">{asNumber(state.best_x, 0)}x</div>
          <div className="p-2 text-center border-l border-panelMuted">{money(state.biggest_win)}</div>
        </div>
        <div className="space-y-1 max-h-28 overflow-auto text-xs">
          {entries.length === 0 ? <p className="text-subtle">No entries yet.</p> : entries.slice(0, 10).map((e, i) => (
            <div key={String(e.slot_name ?? i)} className="flex justify-between border-b border-panelMuted/50 pb-1">
              <span>{i + 1}. {asString(e.slot_name, "Unknown")} ({money(e.bet)})</span>
              <span>{money(e.win)} ({asNumber(e.multiplier, 0)}x)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "slot_battle") {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs uppercase text-subtle">
          <span>{asString(state.stage, "Stage 1")}</span>
          <span>Round {asNumber(state.round, 1)} · {asString(state.status, "idle")}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
          <div className="rounded bg-panelMuted/50 p-2 text-center">
            <p className="font-semibold">{asString(state.slot_a, "Slot A")}</p>
            <p className="text-accent font-black text-lg">{asNumber(state.score_a, 0)}</p>
          </div>
          <div className="font-black">VS</div>
          <div className="rounded bg-panelMuted/50 p-2 text-center">
            <p className="font-semibold">{asString(state.slot_b, "Slot B")}</p>
            <p className="text-accent font-black text-lg">{asNumber(state.score_b, 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "slot_requests") {
    const requests = Array.isArray(state.requests) ? state.requests as Record<string, unknown>[] : [];
    const winner = state.winner as Record<string, unknown> | null | undefined;
    return (
      <div className="space-y-2 text-sm">
        {winner ? (
          <div className="rounded border border-accent/30 bg-accent/10 p-2">
            Winner: {asString(winner.slot_name)} by {asString(winner.username, "viewer")}
          </div>
        ) : null}
        <div className="space-y-1">
          {requests.length === 0 ? <p className="text-subtle">No requests yet.</p> : requests.slice(0, 8).map((r, i) => (
            <div key={String(r.slot_name ?? i)} className="flex justify-between">
              <span>{asString(r.slot_name)}</span>
              <span className="text-subtle">{asString(r.username, "viewer")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "hot_words") {
    const words = Array.isArray(state.words) ? state.words as Record<string, unknown>[] : [];
    return (
      <div className="space-y-1">
        {words.length === 0 ? <p className="text-subtle text-sm">No hot words yet.</p> : words.slice(0, 8).map((w, i) => (
          <div key={String(w.phrase ?? i)} className="flex justify-between text-sm">
            <span className="font-semibold">{asString(w.phrase)}</span>
            <span className="text-accent">{asNumber(w.count, 0)} hits</span>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "wheel") {
    const segments = Array.isArray(state.segments) ? state.segments as string[] : [];
    const result = typeof state.result === "string" ? state.result : null;
    const resultIndex = typeof state.result_index === "number" ? state.result_index : -1;
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {segments.length === 0 ? (
            <p className="text-subtle text-sm">No segments configured.</p>
          ) : (
            segments.map((s, i) => (
              <span key={i} className={`rounded px-2 py-1 text-xs font-semibold ${i === resultIndex ? "bg-accent text-black" : "bg-panelMuted"}`}>{s}</span>
            ))
          )}
        </div>
        {result ? (
          <div className="rounded border border-accent/40 bg-accent/10 p-2 text-center">
            <p className="text-xs uppercase text-accent">Last Result</p>
            <p className="text-lg font-black">{result}</p>
          </div>
        ) : <p className="text-sm text-subtle">No spin yet.</p>}
      </div>
    );
  }

  if (kind === "personal_bests") {
    const bests = Array.isArray(state.metrics) ? state.metrics as Record<string, unknown>[] : [];
    return (
      <div className="space-y-1 text-sm">
        {bests.length === 0 ? <p className="text-subtle">No personal records yet.</p> : bests.slice(0, 6).map((b, i) => (
          <div key={String(b.metric_key ?? i)} className="flex justify-between">
            <span>{asString(b.metric_key)}</span>
            <span className="font-semibold">{asNumber(b.metric_value, 0)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "quick_guessing") {
    const messages = Array.isArray(state.messages) ? state.messages as Record<string, unknown>[] : [];
    const open = Boolean(state.open);
    return (
      <div className="space-y-1 text-sm">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${open ? "bg-green-500/20 text-green-400" : "bg-panelMuted text-subtle"}`}>
          {open ? "Open" : "Closed"}
        </span>
        {messages.length === 0 ? <p className="text-subtle mt-1">Waiting for chat guesses.</p> : messages.slice(0, 10).map((m, i) => (
          <p key={String(m.user ?? i)}><span className="font-semibold text-accent">{asString(m.user, "Viewer")}:</span> {asString(m.text)}</p>
        ))}
      </div>
    );
  }

  if (kind === "loyalty") {
    const items = Array.isArray(state.store_items) ? state.store_items as Record<string, unknown>[] : [];
    const redemptions = Array.isArray(state.recent_redemptions) ? state.recent_redemptions as Record<string, unknown>[] : [];
    return (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-xs">
          <span className="text-accent font-semibold">Store</span>
          <span className="text-subtle">{asNumber(state.total_points_granted, 0)} pts granted</span>
        </div>
        {items.length === 0 ? <p className="text-subtle">No store items yet.</p> : items.slice(0, 4).map((item, i) => (
          <div key={String(item.name ?? i)} className="flex justify-between">
            <span>{asString(item.name)}</span>
            <span className="text-accent">{asNumber(item.cost, 0)} pts</span>
          </div>
        ))}
        {redemptions.length > 0 && (
          <div className="border-t border-panelMuted pt-1 space-y-1">
            {redemptions.slice(0, 3).map((r, i) => (
              <p key={i} className="text-xs text-subtle">{asString(r.user)} redeemed {asString(r.item)}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (kind === "points_battle") {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-xs uppercase text-subtle">
          <span>{asString(state.status, "idle")}</span>
          <span>{asNumber(state.entry_cost, 0)} pts/entry</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="rounded bg-panelMuted/50 p-2 text-center">
            <p className="font-semibold">{asString(state.team_a, "Team A")}</p>
            <p className="text-accent text-lg font-black">{asNumber(state.score_a, 0)}</p>
            <p className="text-xs text-subtle">{asNumber(state.count_a, 0)} members</p>
          </div>
          <div className="font-black text-xs">VS</div>
          <div className="rounded bg-panelMuted/50 p-2 text-center">
            <p className="font-semibold">{asString(state.team_b, "Team B")}</p>
            <p className="text-accent text-lg font-black">{asNumber(state.score_b, 0)}</p>
            <p className="text-xs text-subtle">{asNumber(state.count_b, 0)} members</p>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="rounded-xl bg-panel/90 border border-panelMuted px-3 py-2 w-full h-full shadow-lg">
              <p className="font-semibold text-xs uppercase tracking-wide mb-1">{item.name}</p>
              <WidgetCard kind={item.kind} state={snap?.state ?? {}} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
