"use client";

import { useState } from "react";

const kinds = ["wager_bar","deposit_withdrawal","current_playing","bonushunt","tournament","slot_battle","slot_requests","hot_words","wheel","personal_bests","quick_guessing","loyalty","points_battle"];
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 180;
const GAP_X = 28;
const GAP_Y = 28;
const GRID_COLUMNS = 4;

type TokenRow = { public_token: string; revoked: boolean };
type Widget = {
  id: string;
  kind: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_enabled: boolean;
  widget_configs?: { config: Record<string, unknown> }[];
  widget_tokens?: TokenRow[] | TokenRow | null;
};

function getActiveToken(widget: Widget): string | null {
  const raw = widget.widget_tokens;
  if (!raw) return null;
  const list: TokenRow[] = Array.isArray(raw) ? raw : [raw];
  return list.find((t) => !t.revoked)?.public_token ?? null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded bg-panelMuted px-2 py-1 text-xs font-medium hover:bg-accent/20 transition-colors flex-shrink-0"
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 3.5V2.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H8.5" stroke="currentColor" strokeWidth="1.2"/></svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function WidgetInstanceManager({ overlayId, widgets }: { overlayId: string; widgets: Widget[] }) {
  const [name, setName] = useState("New Widget");
  const [kind, setKind] = useState(kinds[0]);
  const [tokenLoading, setTokenLoading] = useState<Record<string, boolean>>({});

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  function nextGridPosition(index: number) {
    const col = index % GRID_COLUMNS;
    const row = Math.floor(index / GRID_COLUMNS);
    return {
      x: col * (DEFAULT_WIDTH + GAP_X),
      y: row * (DEFAULT_HEIGHT + GAP_Y)
    };
  }

  async function createWidget() {
    const pos = nextGridPosition(widgets.length);
    await fetch("/api/widget-instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overlayId, kind, name, x: pos.x, y: pos.y, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
    });
    location.reload();
  }

  async function autoArrangeAll() {
    await Promise.all(
      widgets.map((w, i) => {
        const pos = nextGridPosition(i);
        return fetch(`/api/widget-instances/${w.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ x: pos.x, y: pos.y, width: w.width || DEFAULT_WIDTH, height: w.height || DEFAULT_HEIGHT })
        });
      })
    );
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

  async function rotateToken(id: string) {
    setTokenLoading((prev) => ({ ...prev, [id]: true }));
    await fetch(`/api/widget-instances/${id}/rotate-token`, { method: "POST" });
    setTokenLoading((prev) => ({ ...prev, [id]: false }));
    location.reload();
  }

  async function revokeToken(id: string) {
    setTokenLoading((prev) => ({ ...prev, [id]: true }));
    await fetch(`/api/widget-instances/${id}/revoke-token`, { method: "POST" });
    setTokenLoading((prev) => ({ ...prev, [id]: false }));
    location.reload();
  }

  return (
    <div className="space-y-3">
      {/* Create widget row */}
      <div className="rounded-lg border border-panelMuted bg-panel p-3 flex gap-2">
        <select className="rounded bg-panelMuted px-3 py-2" value={kind} onChange={(e) => setKind(e.target.value)}>
          {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input className="rounded bg-panelMuted px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={createWidget} className="rounded bg-accent text-black px-3 py-2">Add Widget</button>
        <button onClick={autoArrangeAll} className="rounded bg-panelMuted px-3 py-2">Auto Arrange</button>
      </div>

      {/* Widget list */}
      {widgets.map((w) => {
        const activeToken = getActiveToken(w);
        const obsUrl = activeToken ? `${appUrl}/w/${activeToken}` : null;
        const isLoading = tokenLoading[w.id] ?? false;

        return (
          <div key={w.id} className="rounded-lg border border-panelMuted bg-panel p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{w.name}</p>
                <p className="text-xs text-subtle">{w.kind} · {w.width}×{w.height}px</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(w.id, w.is_enabled)} className="rounded bg-panelMuted px-2 py-1 text-sm">
                  {w.is_enabled ? "Disable" : "Enable"}
                </button>
                <button onClick={() => remove(w.id)} className="rounded bg-danger/20 text-danger px-2 py-1 text-sm">Delete</button>
              </div>
            </div>

            {/* OBS URL section */}
            <div className="rounded-lg border border-panelMuted bg-panelMuted/30 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-subtle uppercase tracking-wide">OBS BrowserSource URL</p>
                <div className="flex gap-1.5 flex-shrink-0">
                  {obsUrl ? (
                    <>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => rotateToken(w.id)}
                        className="rounded bg-panelMuted px-2 py-1 text-xs hover:bg-accent/10 disabled:opacity-50 transition-colors"
                        title="Generate a new URL — the old one will stop working"
                      >
                        Rotate
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => revokeToken(w.id)}
                        className="rounded bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-50 transition-colors"
                        title="Permanently disable this URL"
                      >
                        Revoke
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => rotateToken(w.id)}
                      className="rounded bg-accent px-2 py-1 text-xs text-black font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? "Generating…" : "Generate URL"}
                    </button>
                  )}
                </div>
              </div>
              {obsUrl ? (
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-text/80 break-all flex-1 select-all">{obsUrl}</p>
                  <CopyButton text={obsUrl} />
                </div>
              ) : (
                <p className="text-xs text-subtle/60">
                  Click &quot;Generate URL&quot; to create an OBS BrowserSource link for this widget only.
                  In OBS: Sources → + → Browser Source → paste URL → set size to {w.width}×{w.height}.
                </p>
              )}
            </div>

            {/* Config editor */}
            <textarea
              defaultValue={JSON.stringify(w.widget_configs?.[0]?.config ?? {}, null, 2)}
              className="w-full min-h-28 rounded bg-panelMuted p-2 font-mono text-xs"
              onBlur={(e) => saveConfig(w.id, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
