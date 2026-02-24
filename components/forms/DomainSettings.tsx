"use client";

import { useState } from "react";

type Props = {
  initialDomain: string | null;
  appHost: string;
  publicUrl: string | null;
};

export function DomainSettings({ initialDomain, appHost, publicUrl }: Props) {
  const [domain, setDomain] = useState(initialDomain ?? "");
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setState("idle");
    setError(null);
    try {
      const res = await fetch("/api/settings/domain", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "save_failed");
      setState("ok");
      setTimeout(() => setState("idle"), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "save_failed");
      setState("error");
    } finally {
      setSaving(false);
    }
  }

  const trimmed = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="rounded-xl border border-panelMuted bg-panel p-5 space-y-5">
      <div>
        <p className="text-sm font-semibold text-text">Custom Domain</p>
        <p className="text-xs text-subtle mt-0.5">
          Connect your own domain to your public landing page. Visitors who go to your domain will see your page at{" "}
          {publicUrl ? (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">{publicUrl}</a>
          ) : (
            "your landing page"
          )}.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-subtle">Your Domain</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="casino.mydomain.com"
            className="flex-1 rounded-lg bg-panelMuted px-3 py-2 text-sm font-mono"
            spellCheck={false}
          />
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-70 hover:bg-accent/90 transition-colors flex-shrink-0"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        {state === "ok" && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Saved
          </p>
        )}
        {state === "error" && (
          <p className="text-xs text-danger">
            {error === "domain_already_taken" ? "This domain is already connected to another account." : (error ?? "Save failed — try again")}
          </p>
        )}
      </div>

      {/* DNS instructions */}
      {trimmed && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-text">DNS Setup Instructions</p>
          <p className="text-xs text-subtle leading-relaxed">
            Add the following record to your domain&apos;s DNS settings. Changes can take up to 24 hours to propagate.
          </p>

          <div className="overflow-auto rounded-lg border border-white/[0.07] bg-panelMuted">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="text-left px-3 py-2 text-subtle font-semibold">Type</th>
                  <th className="text-left px-3 py-2 text-subtle font-semibold">Name</th>
                  <th className="text-left px-3 py-2 text-subtle font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2.5 text-accent font-bold">CNAME</td>
                  <td className="px-3 py-2.5 text-text">
                    {trimmed.split(".").length > 2
                      ? trimmed.split(".")[0]
                      : "@"}
                  </td>
                  <td className="px-3 py-2.5 text-text flex items-center gap-2">
                    {appHost}
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(appHost)}
                      className="ml-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-subtle hover:text-text transition-colors"
                    >
                      copy
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-3 py-2.5 text-xs text-yellow-300/80 leading-relaxed">
            <strong className="text-yellow-200">Note:</strong> After setting up DNS, you will also need to add your custom domain in your hosting provider (Render, Vercel, etc.) as a custom domain for this app.
          </div>
        </div>
      )}

      {/* Remove domain */}
      {(initialDomain || domain) && (
        <div className="pt-1 border-t border-panelMuted">
          <button
            type="button"
            onClick={() => { setDomain(""); }}
            className="text-xs text-subtle/60 hover:text-danger transition-colors"
          >
            Remove custom domain
          </button>
        </div>
      )}
    </div>
  );
}
