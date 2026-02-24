"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { BrandIcon } from "@/components/BrandIcon";
import { DashboardLiveChatWidget } from "@/components/dashboard/DashboardLiveChatWidget";

function IcoSignOut() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3C2.45 14 2 13.55 2 13V3C2 2.45 2.45 2 3 2H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 11L14 8L10.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IcoTwitch() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

export function DashboardShell({
  children,
  inspector,
  userId,
  twitchLogin,
  twitchDisplayName,
  isTwitchConnected
}: {
  children: React.ReactNode;
  inspector?: React.ReactNode;
  userId?: string;
  twitchLogin?: string | null;
  twitchDisplayName?: string | null;
  isTwitchConnected?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (searchParams.get("twitch") === "connected") {
      router.refresh();
    }
  }, [searchParams, router]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/auth";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-deep relative">
      {/* ── Animated background orbs ──────────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-[220px] -left-[180px] w-[650px] h-[650px] rounded-full bg-accent/[0.038] blur-[140px]"
          style={{ animation: "dashOrb 22s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[38%] -right-[270px] w-[580px] h-[580px] rounded-full bg-sky-400/[0.025] blur-[130px]"
          style={{ animation: "dashOrb 30s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute -bottom-[170px] left-[28%] w-[520px] h-[520px] rounded-full bg-accent/[0.025] blur-[120px]"
          style={{ animation: "dashOrb 26s ease-in-out 8s infinite" }}
        />
      </div>

      {/* ── TOP NAVIGATION ──────────────────────────────── */}
      <header className="relative z-20 h-14 sticky top-0 bg-panel/95 backdrop-blur-md border-b border-white/[0.06] flex items-center px-5 gap-4 flex-shrink-0">
        {/* Brand */}
        <Link href={"/home" as never} className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <BrandIcon size="sm" />
          <div className="leading-none hidden sm:block">
            <p className="font-black text-[12px] tracking-[0.1em] uppercase text-text">Pulseframelabs</p>
            <p className="text-[9px] text-subtle/50 mt-0.5">Studio</p>
          </div>
        </Link>

        {/* Nav links — scrollbar hidden via .scrollbar-none */}
        <nav className="scrollbar-none flex-1 flex items-center gap-0.5 overflow-x-auto min-w-0">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href as never}
                className={clsx(
                  "relative flex-shrink-0 px-3 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap",
                  isActive
                    ? "text-accent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-accent after:rounded-t-full"
                    : "text-subtle/70 hover:text-text"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right side actions ─── */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Twitch connect / status */}
          <a
            href="/api/auth/twitch/start"
            title={isTwitchConnected ? "Reconnect Twitch" : "Connect Twitch"}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150",
              isTwitchConnected
                ? "border-[#9147ff]/30 bg-[#9147ff]/10 text-[#bf94ff] hover:bg-[#9147ff]/20 hover:border-[#9147ff]/60"
                : "border-[#9147ff]/40 bg-[#9147ff]/10 text-[#bf94ff] hover:bg-[#9147ff]/20 hover:border-[#9147ff]/60"
            )}
          >
            <IcoTwitch />
            <span className="hidden sm:inline truncate max-w-[100px]">
              {isTwitchConnected ? (twitchDisplayName ?? twitchLogin) : "Connect Twitch"}
            </span>
          </a>

          {/* Sign out */}
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-subtle/60 hover:text-danger hover:bg-danger/5 transition-all duration-150 disabled:opacity-50 border border-transparent hover:border-danger/10"
          >
            <IcoSignOut />
            <span className="hidden sm:inline">{loggingOut ? "Signing out…" : "Sign Out"}</span>
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Optional inspector panel */}
        {inspector && (
          <aside className="w-[300px] border-l border-white/[0.06] bg-panel/80 backdrop-blur-sm overflow-auto flex-shrink-0">
            {inspector}
          </aside>
        )}
      </div>

      <DashboardLiveChatWidget userId={userId} />
    </div>
  );
}
