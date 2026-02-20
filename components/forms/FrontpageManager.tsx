"use client";

import { useState } from "react";

export function FrontpageManager({ overlays, pages }: { overlays: { id: string; name: string }[]; pages: { id: string; page_type: string; enabled: boolean; viewer_tokens?: { public_token: string }[] }[] }) {
  const [overlayId, setOverlayId] = useState(overlays[0]?.id ?? "");
  const [pageType, setPageType] = useState("bonushunt");

  async function createPage() {
    await fetch("/api/frontpages/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ overlayId, pageType, enabled: true }) });
    location.reload();
  }
  async function toggle(id: string, enabled: boolean) { await fetch(`/api/frontpages/${id}/toggle`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !enabled }) }); location.reload(); }
  async function rotate(id: string) { await fetch(`/api/frontpages/${id}/rotate-token`, { method: "POST" }); location.reload(); }
  async function revoke(id: string) { await fetch(`/api/frontpages/${id}/revoke-token`, { method: "POST" }); location.reload(); }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-panelMuted bg-panel p-3 flex gap-2">
        <select className="rounded bg-panelMuted px-3 py-2" value={overlayId} onChange={(e) => setOverlayId(e.target.value)}>{overlays.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        <select className="rounded bg-panelMuted px-3 py-2" value={pageType} onChange={(e) => setPageType(e.target.value)}><option value="bonushunt">Bonushunt</option><option value="tournament">Tournament</option><option value="requests">Requests</option></select>
        <button onClick={createPage} className="rounded bg-accent text-black px-3 py-2">Create Frontpage</button>
      </div>
      {pages.map((p) => (
        <div key={p.id} className="rounded-lg border border-panelMuted bg-panel p-3">
          <p className="font-medium">{p.page_type}</p>
          <p className="text-xs text-subtle font-mono break-all">{p.viewer_tokens?.[0]?.public_token ?? "No token"}</p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => toggle(p.id, p.enabled)} className="rounded bg-panelMuted px-3 py-2">{p.enabled ? "Disable" : "Enable"}</button>
            <button onClick={() => rotate(p.id)} className="rounded bg-panelMuted px-3 py-2">Rotate Token</button>
            <button onClick={() => revoke(p.id)} className="rounded bg-panelMuted px-3 py-2">Revoke Token</button>
          </div>
        </div>
      ))}
    </div>
  );
}
