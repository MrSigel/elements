"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/lib/constants";
import { useState } from "react";
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

export function DashboardShell({
  children,
  inspector,
  userId
}: {
  children: React.ReactNode;
  inspector?: React.ReactNode;
  userId?: string;
}) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/auth";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-deep">
      {/* ── TOP NAVIGATION ──────────────────────────────── */}
      <header className="h-14 sticky top-0 z-20 bg-panel border-b border-white/5 flex items-center px-5 gap-4 flex-shrink-0">
        {/* Brand */}
        <Link href={"/home" as never} className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <BrandIcon size="sm" />
          <div className="leading-none hidden sm:block">
            <p className="font-black text-[12px] tracking-[0.1em] uppercase text-text">Pulseframelabs</p>
            <p className="text-[9px] text-subtle/50 mt-0.5">Studio</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-none min-w-0">
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

        {/* Sign out */}
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-subtle/60 hover:text-danger hover:bg-danger/5 transition-all duration-150 disabled:opacity-50 border border-transparent hover:border-danger/10"
        >
          <IcoSignOut />
          <span className="hidden sm:inline">{loggingOut ? "Signing out…" : "Sign Out"}</span>
        </button>
      </header>

      {/* ── BODY ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-bg">{children}</main>

        {/* Optional inspector panel */}
        {inspector && (
          <aside className="w-[300px] border-l border-white/5 bg-panel overflow-auto flex-shrink-0">
            {inspector}
          </aside>
        )}
      </div>

      <DashboardLiveChatWidget userId={userId} />
    </div>
  );
}
