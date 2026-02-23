"use client";

import { useState, useCallback } from "react";

const PAGE_TYPE_LABELS: Record<string, string> = {
  bonushunt: "Bonus Hunt",
  tournament: "Tournament",
  requests: "Slot Requests",
  loyalty: "Loyalty Store",
  battle: "Points Battle"
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy viewer link"
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium bg-panelMuted hover:bg-panelMuted/80 text-subtle hover:text-text transition-colors"
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4V2.5A.5.5 0 007.5 2h-5A.5.5 0 002 2.5v5a.5.5 0 00.5.5H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Copy Link
        </>
      )}
    </button>
  );
}

export function FrontpageManager({
  overlays,
  pages
}: {
  overlays: { id: string; name: string }[];
  pages: { id: string; page_type: string; enabled: boolean; viewer_tokens?: { public_token: string }[] }[];
}) {
  const [overlayId, setOverlayId] = useState(overlays[0]?.id ?? "");
  const [pageType, setPageType] = useState("bonushunt");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const doFetch = useCallback(async (key: string, url: string, init: RequestInit) => {
    setLoading(key);
    setError(null);
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }, []);

  function createPage() {
    doFetch("create", "/api/frontpages/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overlayId, pageType, enabled: true })
    });
  }
  function toggle(id: string, enabled: boolean) {
    doFetch(`toggle-${id}`, `/api/frontpages/${id}/toggle`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !enabled }) });
  }
  function rotate(id: string) {
    if (!confirm("Generate a new viewer link? The old link will stop working immediately.")) return;
    doFetch(`rotate-${id}`, `/api/frontpages/${id}/rotate-token`, { method: "POST" });
  }
  function revoke(id: string) {
    if (!confirm("Permanently revoke this viewer page link? This cannot be undone.")) return;
    doFetch(`revoke-${id}`, `/api/frontpages/${id}/revoke-token`, { method: "POST" });
  }

  if (overlays.length === 0) {
    return (
      <div className="rounded-lg border border-panelMuted bg-panel p-8 text-center">
        <p className="text-sm font-semibold text-text mb-1">No overlays found</p>
        <p className="text-xs text-subtle">Create an overlay first — viewer pages are linked to an overlay.</p>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="rounded-lg border border-panelMuted bg-panel p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-text">Create Viewer Page</p>
          <p className="text-xs text-subtle mt-0.5">
            Viewer pages are shareable links your audience opens during the stream to follow along in real time.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1 flex-1">
            <label className="text-xs text-subtle font-medium">Overlay</label>
            <select className="w-full rounded bg-panelMuted px-3 py-2 text-sm" value={overlayId} onChange={(e) => setOverlayId(e.target.value)}>
              {overlays.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="space-y-1 flex-1">
            <label className="text-xs text-subtle font-medium">Page Type</label>
            <select className="w-full rounded bg-panelMuted px-3 py-2 text-sm" value={pageType} onChange={(e) => setPageType(e.target.value)}>
              <option value="bonushunt">Bonus Hunt — live tracker with guessing</option>
              <option value="tournament">Tournament — viewer scoreboard</option>
              <option value="requests">Slot Requests — submit slots in chat</option>
              <option value="loyalty">Loyalty Store — redeem points for rewards</option>
              <option value="battle">Points Battle — team leaderboard</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={createPage} disabled={!!loading} className="rounded bg-accent text-black px-4 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors w-full sm:w-auto disabled:opacity-50">
              {loading === "create" ? "Creating…" : "Create Page"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Pages list */}
      {pages.length === 0 ? (
        <div className="rounded-lg border border-panelMuted bg-panel p-6 text-center">
          <p className="text-xs text-subtle">No viewer pages yet — create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => {
            const token = p.viewer_tokens?.[0]?.public_token;
            const viewerUrl = token ? `${origin}/v/${token}/${p.page_type}` : null;
            const label = PAGE_TYPE_LABELS[p.page_type] ?? p.page_type;

            return (
              <div key={p.id} className="rounded-lg border border-panelMuted bg-panel p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-text">{label}</p>
                      {p.enabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-panelMuted text-subtle">
                          Disabled
                        </span>
                      )}
                    </div>
                    {viewerUrl ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-subtle/50 font-mono">/v/{token?.slice(0, 12)}…/{p.page_type}</span>
                        <CopyButton value={viewerUrl} />
                        <a href={viewerUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Open ↗</a>
                      </div>
                    ) : (
                      <p className="text-xs text-subtle/40">No active token</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggle(p.id, p.enabled)}
                      disabled={!!loading}
                      className={`rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${p.enabled ? "bg-panelMuted hover:bg-panelMuted/80" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"}`}
                    >
                      {loading === `toggle-${p.id}` ? "…" : p.enabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => rotate(p.id)}
                      disabled={!!loading}
                      className="rounded bg-panelMuted px-3 py-1.5 text-xs font-medium hover:bg-panelMuted/80 transition-colors disabled:opacity-50"
                      title="Generate a new link — the old link will stop working immediately"
                    >
                      {loading === `rotate-${p.id}` ? "…" : "Rotate Link"}
                    </button>
                    <button
                      onClick={() => revoke(p.id)}
                      disabled={!!loading}
                      className="rounded px-3 py-1.5 text-xs font-medium text-subtle hover:text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
                      title="Permanently disable this page's public link"
                    >
                      {loading === `revoke-${p.id}` ? "…" : "Revoke"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
