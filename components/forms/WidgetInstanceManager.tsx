"use client";

import { useState, useCallback } from "react";

const kinds = ["wager_bar","deposit_withdrawal","current_playing","bonushunt","tournament","slot_battle","slot_requests","hot_words","wheel","personal_bests","quick_guessing","loyalty","points_battle"];
const FREE_KINDS = new Set(["hot_words", "slot_requests"]);
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

type WidgetColors = { accent: string; secondary: string; bg: string; text: string };

const COLOR_DEFAULTS: WidgetColors = {
  accent: "#f5c451",
  secondary: "#b22234",
  bg: "#0f151e",
  text: "#e5edf5"
};

function ColorEditor({
  widgetId,
  initialConfig,
  onSave
}: {
  widgetId: string;
  initialConfig: Record<string, unknown>;
  onSave: (id: string, config: Record<string, unknown>) => Promise<void>;
}) {
  const saved = (initialConfig.colors as Partial<WidgetColors> | undefined) ?? {};
  const [accent, setAccent] = useState(saved.accent ?? COLOR_DEFAULTS.accent);
  const [secondary, setSecondary] = useState(saved.secondary ?? COLOR_DEFAULTS.secondary);
  const [bg, setBg] = useState(saved.bg ?? COLOR_DEFAULTS.bg);
  const [text, setText] = useState(saved.text ?? COLOR_DEFAULTS.text);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(widgetId, { ...initialConfig, colors: { accent, secondary, bg, text } });
    setSaving(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  }

  function resetDefaults() {
    setAccent(COLOR_DEFAULTS.accent);
    setSecondary(COLOR_DEFAULTS.secondary);
    setBg(COLOR_DEFAULTS.bg);
    setText(COLOR_DEFAULTS.text);
  }

  const swatches: { label: string; value: string; set: (v: string) => void }[] = [
    { label: "Accent", value: accent, set: setAccent },
    { label: "Secondary", value: secondary, set: setSecondary },
    { label: "Background", value: bg, set: setBg },
    { label: "Text", value: text, set: setText }
  ];

  return (
    <div className="rounded-lg border border-panelMuted bg-panelMuted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-subtle uppercase tracking-wide">Widget Colors</p>
        <button
          type="button"
          onClick={resetDefaults}
          className="text-[10px] text-subtle/50 hover:text-subtle transition-colors"
        >
          Reset defaults
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {swatches.map(({ label, value, set }) => (
          <label key={label} className="flex flex-col gap-1.5 cursor-pointer">
            <span className="text-[10px] text-subtle/70 uppercase tracking-wide">{label}</span>
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div
                  className="w-8 h-8 rounded-lg border border-white/20 shadow-sm"
                  style={{ backgroundColor: value }}
                />
              </div>
              <input
                type="text"
                value={value}
                onChange={(e) => { if (/^#[0-9a-f]{0,6}$/i.test(e.target.value)) set(e.target.value); }}
                maxLength={7}
                className="w-20 rounded bg-panelMuted px-2 py-1 font-mono text-[11px] text-text/80 border border-white/[0.06] focus:outline-none focus:border-accent/40"
              />
            </div>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60 hover:bg-accent/90 transition-colors"
        >
          {saving ? "Saving…" : "Save Colors"}
        </button>
        {flash && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Saved — reload OBS to apply
          </span>
        )}
      </div>
    </div>
  );
}

export function WidgetInstanceManager({ overlayId, widgets, plan }: { overlayId: string; widgets: Widget[]; plan: string }) {
  const isStarter = plan === "starter";
  const [name, setName] = useState(isStarter ? "New Widget" : "New Widget");
  const [kind, setKind] = useState(isStarter ? "hot_words" : kinds[0]);
  const [tokenLoading, setTokenLoading] = useState<Record<string, boolean>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
    setCreateError(null);
    setCreating(true);
    try {
      const pos = nextGridPosition(widgets.length);
      const res = await fetch("/api/widget-instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overlayId, kind, name, x: pos.x, y: pos.y, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCreateError(body.message ?? body.error ?? "Failed to create widget.");
        return;
      }
      location.reload();
    } finally {
      setCreating(false);
    }
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

  const saveColors = useCallback(async (id: string, config: Record<string, unknown>) => {
    await fetch(`/api/widget-instances/${id}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config })
    });
  }, []);

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
      <div className="rounded-lg border border-panelMuted bg-panel p-3 space-y-2">
        <div className="flex gap-2">
          <select
            className="rounded bg-panelMuted px-3 py-2"
            value={kind}
            onChange={(e) => { setKind(e.target.value); setCreateError(null); }}
          >
            {isStarter && (
              <optgroup label="Free plan">
                {kinds.filter((k) => FREE_KINDS.has(k)).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </optgroup>
            )}
            {isStarter ? (
              <optgroup label="Pro / Enterprise only">
                {kinds.filter((k) => !FREE_KINDS.has(k)).map((k) => (
                  <option key={k} value={k} disabled>{k} 🔒</option>
                ))}
              </optgroup>
            ) : (
              kinds.map((k) => <option key={k} value={k}>{k}</option>)
            )}
          </select>
          <input className="rounded bg-panelMuted px-3 py-2 flex-1" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={createWidget} disabled={creating} className="rounded bg-accent text-black px-3 py-2 disabled:opacity-60">
            {creating ? "Adding…" : "Add Widget"}
          </button>
          <button onClick={autoArrangeAll} className="rounded bg-panelMuted px-3 py-2">Auto Arrange</button>
        </div>
        {createError && (
          <p className="text-xs text-danger bg-danger/10 rounded px-3 py-1.5">{createError}</p>
        )}
        {isStarter && (
          <p className="text-xs text-subtle/60">
            Free plan includes <span className="text-text">Hot Words</span> and <span className="text-text">Slot Requests</span>. <a href="/shop" className="text-accent hover:underline">Upgrade to Pro</a> for all 13 widget types.
          </p>
        )}
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

            {/* Color editor */}
            <ColorEditor
              widgetId={w.id}
              initialConfig={w.widget_configs?.[0]?.config ?? {}}
              onSave={saveColors}
            />

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
