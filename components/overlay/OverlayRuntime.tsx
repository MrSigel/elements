"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Snapshot = {
  widget_instance_id: string | null;
  widget_type: string;
  state: Record<string, unknown>;
};

type Layout = { id: string; x: number; y: number; width: number; height: number; kind: string; name: string; config?: Record<string, unknown> };

function hexToRgb(hex: string): string | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const moneyFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function asNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return fallback;
}

function money(value: unknown) {
  return `${moneyFormatter.format(asNumber(value, 0))}$`;
}

function formatKind(kind: string) {
  return kind.replace(/_/g, " ");
}

function StatTile({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "accent" | "success" | "danger";
}) {
  return (
    <div className={`ovr-stat-tile ${tone !== "default" ? `ovr-stat-tile--${tone}` : ""}`}>
      <p className="ovr-stat-label">{label}</p>
      <p className="ovr-stat-value">{value}</p>
    </div>
  );
}

function ListRow({
  left,
  right,
  index
}: {
  left: string;
  right: string;
  index: number;
}) {
  return (
    <div className="ovr-list-row" style={{ animationDelay: `${index * 40}ms` }}>
      <span className="ovr-list-left">{left}</span>
      <span className="ovr-list-right">{right}</span>
    </div>
  );
}

function WidgetCard({ kind, state }: { kind: string; state: Record<string, unknown> }) {
  if (kind === "wager_bar") {
    const value = asNumber(state.value, 0);
    const pct = Math.max(0, Math.min(100, value));
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="ovr-label">Wager Progress</p>
          <p className="ovr-value">{pct.toFixed(0)}%</p>
        </div>
        <div className="ovr-progress">
          <div className="ovr-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="ovr-subtle">Current value: {value.toFixed(2)}</p>
      </div>
    );
  }

  if (kind === "current_playing") {
    return (
      <div className="ovr-metric-grid-3">
        <StatTile label="Current Game" value={asString(state.game_name)} tone="accent" />
        <StatTile label="Provider" value={asString(state.provider)} />
        <StatTile label="Best Win" value={money(state.best_win)} />
        <StatTile label="Best X" value={`${asNumber(state.best_x, 0)}x`} />
        <StatTile label="Potential" value={asString(state.potential, "5000x")} />
        <StatTile label="RTP" value={asString(state.rtp, "96.50%")} />
      </div>
    );
  }

  if (kind === "deposit_withdrawal") {
    return (
      <div className="space-y-2">
        <div className="ovr-metric-grid-3">
          <StatTile label="Deposits" value={money(state.total_deposits)} tone="success" />
          <StatTile label="Withdrawals" value={money(state.total_withdrawals)} tone="danger" />
          <StatTile label="Balance" value={money(state.balance)} tone="accent" />
        </div>
        {state.tx_type ? (
          <p className="ovr-subtle">Last transaction: {asString(state.tx_type)} {money(state.amount)}</p>
        ) : null}
      </div>
    );
  }

  if (kind === "tournament") {
    const rows = Array.isArray(state.standings) ? (state.standings as Record<string, unknown>[]) : [];
    return (
      <div className="ovr-scroll">
        {rows.length === 0 ? (
          <p className="ovr-subtle">No tournament scores yet.</p>
        ) : (
          rows.slice(0, 8).map((r, i) => (
            <ListRow
              key={`${String(r.participant ?? "player")}-${i}`}
              left={`${i + 1}. ${asString(r.participant, "Player")}`}
              right={String(asNumber(r.score, 0))}
              index={i}
            />
          ))
        )}
      </div>
    );
  }

  if (kind === "bonushunt") {
    const entries = Array.isArray(state.entries) ? (state.entries as Record<string, unknown>[]) : [];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="ovr-label">{asString(state.title, "Bonus Hunt")}</p>
          <span className="ovr-chip">{asNumber(state.opened, 0)}/{asNumber(state.total, entries.length)} opened</span>
        </div>
        <div className="ovr-metric-grid-4">
          <StatTile label="Buyins" value={money(state.total_buyins)} />
          <StatTile label="Total Win" value={money(state.total_win)} tone="success" />
          <StatTile label="Best X" value={`${asNumber(state.best_x, 0)}x`} tone="accent" />
          <StatTile label="Biggest Win" value={money(state.biggest_win)} />
        </div>
        <div className="ovr-scroll">
          {entries.length === 0 ? (
            <p className="ovr-subtle">No entries yet.</p>
          ) : (
            entries.slice(0, 10).map((e, i) => (
              <ListRow
                key={`${String(e.slot_name ?? "slot")}-${i}`}
                left={`${i + 1}. ${asString(e.slot_name, "Unknown")} (${money(e.bet)})`}
                right={`${money(e.win)} (${asNumber(e.multiplier, 0)}x)`}
                index={i}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  if (kind === "slot_battle") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="ovr-chip">{asString(state.stage, "Stage 1")}</span>
          <p className="ovr-subtle">Round {asNumber(state.round, 1)} - {asString(state.status, "idle")}</p>
        </div>
        <div className="ovr-vs-grid">
          <div className="ovr-team-card">
            <p className="ovr-team-name">{asString(state.slot_a, "Slot A")}</p>
            <p className="ovr-team-score">{asNumber(state.score_a, 0)}</p>
          </div>
          <div className="ovr-vs-badge">VS</div>
          <div className="ovr-team-card">
            <p className="ovr-team-name">{asString(state.slot_b, "Slot B")}</p>
            <p className="ovr-team-score">{asNumber(state.score_b, 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "slot_requests") {
    const requests = Array.isArray(state.requests) ? (state.requests as Record<string, unknown>[]) : [];
    const winner = state.winner as Record<string, unknown> | null | undefined;
    return (
      <div className="space-y-2">
        {winner ? (
          <div className="ovr-winner-banner">
            Winner: {asString(winner.slot_name)} by {asString(winner.username, "viewer")}
          </div>
        ) : null}
        <div className="ovr-scroll">
          {requests.length === 0 ? (
            <p className="ovr-subtle">No requests yet.</p>
          ) : (
            requests.slice(0, 8).map((r, i) => (
              <ListRow
                key={`${String(r.slot_name ?? "slot")}-${i}`}
                left={asString(r.slot_name)}
                right={asString(r.username, "viewer")}
                index={i}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  if (kind === "hot_words") {
    const words = Array.isArray(state.words) ? (state.words as Record<string, unknown>[]) : [];
    return (
      <div className="ovr-scroll">
        {words.length === 0 ? (
          <p className="ovr-subtle">No hot words yet.</p>
        ) : (
          words.slice(0, 8).map((w, i) => (
            <ListRow
              key={`${String(w.phrase ?? "phrase")}-${i}`}
              left={asString(w.phrase)}
              right={`${asNumber(w.count, 0)} hits`}
              index={i}
            />
          ))
        )}
      </div>
    );
  }

  if (kind === "wheel") {
    const segments = Array.isArray(state.segments) ? (state.segments as string[]) : [];
    const result = typeof state.result === "string" ? state.result : null;
    const resultIndex = typeof state.result_index === "number" ? state.result_index : -1;
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {segments.length === 0 ? (
            <p className="ovr-subtle">No segments configured.</p>
          ) : (
            segments.map((s, i) => (
              <span key={`${s}-${i}`} className={`ovr-chip ${i === resultIndex ? "ovr-chip--active" : ""}`}>
                {s}
              </span>
            ))
          )}
        </div>
        {result ? (
          <div className="ovr-winner-banner text-center">
            Last Result: <span className="ovr-value">{result}</span>
          </div>
        ) : (
          <p className="ovr-subtle">No spin yet.</p>
        )}
      </div>
    );
  }

  if (kind === "personal_bests") {
    const bests = Array.isArray(state.metrics) ? (state.metrics as Record<string, unknown>[]) : [];
    return (
      <div className="ovr-scroll">
        {bests.length === 0 ? (
          <p className="ovr-subtle">No personal records yet.</p>
        ) : (
          bests.slice(0, 6).map((b, i) => (
            <ListRow
              key={`${String(b.metric_key ?? "metric")}-${i}`}
              left={asString(b.metric_key)}
              right={String(asNumber(b.metric_value, 0))}
              index={i}
            />
          ))
        )}
      </div>
    );
  }

  if (kind === "quick_guessing") {
    const messages = Array.isArray(state.messages) ? (state.messages as Record<string, unknown>[]) : [];
    const open = Boolean(state.open);
    return (
      <div className="space-y-2">
        <span className={`ovr-chip ${open ? "ovr-chip--live" : ""}`}>{open ? "Open" : "Closed"}</span>
        <div className="ovr-scroll">
          {messages.length === 0 ? (
            <p className="ovr-subtle">Waiting for chat guesses.</p>
          ) : (
            messages.slice(0, 10).map((m, i) => (
              <ListRow
                key={`${String(m.user ?? "viewer")}-${i}`}
                left={asString(m.user, "Viewer")}
                right={asString(m.text)}
                index={i}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  if (kind === "loyalty") {
    const items = Array.isArray(state.store_items) ? (state.store_items as Record<string, unknown>[]) : [];
    const redemptions = Array.isArray(state.recent_redemptions) ? (state.recent_redemptions as Record<string, unknown>[]) : [];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="ovr-label">Store</p>
          <p className="ovr-subtle">{asNumber(state.total_points_granted, 0)} points granted</p>
        </div>
        <div className="ovr-scroll">
          {items.length === 0 ? (
            <p className="ovr-subtle">No store items yet.</p>
          ) : (
            items.slice(0, 4).map((item, i) => (
              <ListRow
                key={`${String(item.name ?? "item")}-${i}`}
                left={asString(item.name)}
                right={`${asNumber(item.cost, 0)} pts`}
                index={i}
              />
            ))
          )}
        </div>
        {redemptions.length > 0 ? (
          <div className="ovr-stack">
            {redemptions.slice(0, 3).map((r, i) => (
              <p key={`${asString(r.user, "viewer")}-${i}`} className="ovr-subtle">
                {asString(r.user)} redeemed {asString(r.item)}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (kind === "points_battle") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="ovr-chip">{asString(state.status, "idle")}</span>
          <p className="ovr-subtle">{asNumber(state.entry_cost, 0)} pts/entry</p>
        </div>
        <div className="ovr-vs-grid">
          <div className="ovr-team-card">
            <p className="ovr-team-name">{asString(state.team_a, "Team A")}</p>
            <p className="ovr-team-score">{asNumber(state.score_a, 0)}</p>
            <p className="ovr-subtle">{asNumber(state.count_a, 0)} members</p>
          </div>
          <div className="ovr-vs-badge">VS</div>
          <div className="ovr-team-card">
            <p className="ovr-team-name">{asString(state.team_b, "Team B")}</p>
            <p className="ovr-team-score">{asNumber(state.score_b, 0)}</p>
            <p className="ovr-subtle">{asNumber(state.count_b, 0)} members</p>
          </div>
        </div>
      </div>
    );
  }

  return <p className="ovr-subtle">{formatKind(kind)}</p>;
}

export function OverlayRuntime({
  overlayId,
  initialSnapshots,
  layout
}: {
  overlayId: string;
  initialSnapshots: Snapshot[];
  layout: Layout[];
}) {
  const [snapshots, setSnapshots] = useState(initialSnapshots);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`overlay:${overlayId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "widget_snapshots", filter: `overlay_id=eq.${overlayId}` },
        (payload) => {
          const next = payload.new as Snapshot;
          setSnapshots((curr) => {
            const idx = curr.findIndex((s) => s.widget_instance_id === next.widget_instance_id);
            if (idx === -1) return [...curr, next];
            const copy = [...curr];
            copy[idx] = next;
            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [overlayId]);

  const byWidget = useMemo(() => {
    const map = new Map<string, Snapshot>();
    for (const snap of snapshots) {
      if (snap.widget_instance_id) map.set(snap.widget_instance_id, snap);
    }
    return map;
  }, [snapshots]);

  return (
    <div className="ovr-root relative h-screen w-screen overflow-hidden bg-transparent">
      {layout.map((item, index) => {
        const snap = byWidget.get(item.id);
        const colors = item.config?.colors as Record<string, string> | undefined;
        const shellVars: Record<string, string> = { animationDelay: `${(index % 6) * 180}ms` };
        if (colors) {
          const accent = colors.accent ? hexToRgb(colors.accent) : null;
          const secondary = colors.secondary ? hexToRgb(colors.secondary) : null;
          const bg = colors.bg ? hexToRgb(colors.bg) : null;
          if (accent) shellVars["--ovr-accent-rgb"] = accent;
          if (secondary) shellVars["--ovr-secondary-rgb"] = secondary;
          if (bg) shellVars["--ovr-bg-rgb"] = bg;
          if (colors.text) shellVars["--ovr-text"] = colors.text;
        }
        return (
          <div
            key={item.id}
            className="absolute"
            style={{ left: `${item.x}px`, top: `${item.y}px`, width: `${item.width}px`, height: `${item.height}px` }}
          >
            <div className="ovr-shell h-full w-full" style={shellVars as React.CSSProperties}>
              <div className="ovr-shell-glow" />
              <div className="ovr-header">
                <p className="ovr-title">{item.name}</p>
                <span className="ovr-kind">{formatKind(item.kind)}</span>
              </div>
              <div className="ovr-content">
                <WidgetCard kind={item.kind} state={snap?.state ?? {}} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

