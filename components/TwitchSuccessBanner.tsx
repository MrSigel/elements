"use client";

import { useEffect, useState } from "react";

export function TwitchSuccessBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Clean the query param from the URL without triggering a navigation
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("twitch");
      window.history.replaceState({}, "", url.toString());
    }
    // Auto-dismiss after 6 seconds
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7l3 3 6-6" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-400">Twitch verbunden!</p>
          <p className="text-xs text-emerald-400/70">Dein Twitch-Konto wurde erfolgreich verknüpft.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="flex-shrink-0 text-emerald-400/50 hover:text-emerald-400 transition-colors"
        aria-label="Schließen"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
