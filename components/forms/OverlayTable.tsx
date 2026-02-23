"use client";
import Link from "next/link";
import { useState } from "react";

type OverlayRow = {
  id: string;
  name: string;
  width: number;
  height: number;
  is_published: boolean;
  overlay_tokens?: { public_token: string; revoked: boolean }[];
};

function CopyButton({ value, label }: { value: string; label?: string }) {
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
      title="Copy OBS URL"
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors bg-panelMuted hover:bg-panelMuted/80 text-subtle hover:text-text"
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4V2.5A.5.5 0 007.5 2h-5A.5.5 0 002 2.5v5a.5.5 0 00.5.5H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          {label ?? "Copy URL"}
        </>
      )}
    </button>
  );
}

export function OverlayTable({ overlays }: { overlays: OverlayRow[] }) {
  async function publish(id: string, published: boolean) {
    await fetch(`/api/overlay/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published }) });
    location.reload();
  }
  async function rotate(id: string) { await fetch(`/api/overlay/${id}/rotate-token`, { method: "POST" }); location.reload(); }
  async function revoke(id: string) { await fetch(`/api/overlay/${id}/revoke-token`, { method: "POST" }); location.reload(); }
  async function duplicate(id: string) { await fetch(`/api/overlay/${id}/duplicate`, { method: "POST" }); location.reload(); }
  async function remove(id: string) { await fetch(`/api/overlay/${id}/delete`, { method: "DELETE" }); location.reload(); }

  if (overlays.length === 0) {
    return (
      <div className="rounded-lg border border-panelMuted bg-panel p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="6" width="18" height="13" rx="2" stroke="#f5c451" strokeWidth="1.5"/><rect x="5" y="3" width="12" height="2.5" rx="1" stroke="#f5c451" strokeWidth="1.5"/></svg>
        </div>
        <p className="text-sm font-semibold text-text mb-1">No overlays yet</p>
        <p className="text-xs text-subtle">Create your first overlay above — then add widgets and publish the URL to OBS.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {overlays.map((o) => {
        const token = o.overlay_tokens?.find((t) => !t.revoked)?.public_token;
        const obsUrl = token ? `${typeof window !== "undefined" ? window.location.origin : ""}/o/${token}` : null;

        return (
          <div key={o.id} className="rounded-lg border border-panelMuted bg-panel p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Info */}
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-text">{o.name}</p>
                  {o.is_published ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-panelMuted text-subtle">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-subtle">{o.width} × {o.height} px</p>
                {obsUrl ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-subtle/50 font-mono">/o/{token?.slice(0, 16)}…</span>
                    <CopyButton value={obsUrl} label="Copy OBS URL" />
                  </div>
                ) : (
                  <p className="text-xs text-subtle/40">No active token — publish to generate a URL</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                <Link
                  href={`/overlay-preview/${o.id}` as never}
                  className="rounded bg-panelMuted px-3 py-1.5 text-xs font-medium hover:bg-panelMuted/80 transition-colors"
                >
                  Preview
                </Link>
                <button
                  onClick={() => publish(o.id, !o.is_published)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${o.is_published ? "bg-panelMuted hover:bg-panelMuted/80" : "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"}`}
                >
                  {o.is_published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => duplicate(o.id)}
                  className="rounded bg-panelMuted px-3 py-1.5 text-xs font-medium hover:bg-panelMuted/80 transition-colors"
                  title="Create a copy of this overlay with all widgets"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => rotate(o.id)}
                  className="rounded bg-panelMuted px-3 py-1.5 text-xs font-medium hover:bg-panelMuted/80 transition-colors"
                  title="Generate a new URL — update your OBS BrowserSource after rotating"
                >
                  Rotate URL
                </button>
                <button
                  onClick={() => revoke(o.id)}
                  className="rounded px-3 py-1.5 text-xs font-medium text-subtle hover:text-danger hover:bg-danger/5 transition-colors"
                  title="Permanently disable this overlay's public URL"
                >
                  Revoke
                </button>
                <button
                  onClick={() => remove(o.id)}
                  className="rounded bg-danger/10 text-danger px-3 py-1.5 text-xs font-medium hover:bg-danger/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
