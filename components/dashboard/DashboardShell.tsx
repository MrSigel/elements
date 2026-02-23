"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/lib/constants";
import { useState } from "react";

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function IcoOverlays() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="5" width="13" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3.5" y="2" width="9" height="2" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IcoWidgets() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IcoWebsite() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5C8 1.5 5.5 4.5 5.5 8C5.5 11.5 8 14.5 8 14.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5C8 1.5 10.5 4.5 10.5 8C10.5 11.5 8 14.5 8 14.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 8H14.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IcoFrontpages() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 5.5H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 8H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 10.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IcoModeration() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2 4V8.5C2 11.538 4.686 14.25 8 14.75C11.314 14.25 14 11.538 14 8.5V4L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcoLogs() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 8H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 11.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IcoSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.95 3.05L11.89 4.11M4.11 11.89L3.05 12.95M12.95 12.95L11.89 11.89M4.11 4.11L3.05 3.05" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IcoSignOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3C2.45 14 2 13.55 2 13V3C2 2.45 2.45 2 3 2H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 11L14 8L10.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "/overlays": <IcoOverlays />,
  "/widgets": <IcoWidgets />,
  "/website": <IcoWebsite />,
  "/frontpages": <IcoFrontpages />,
  "/moderation": <IcoModeration />,
  "/logs": <IcoLogs />,
  "/settings": <IcoSettings />
};

const TOOL_ITEMS = NAV_ITEMS.slice(0, 5);
const ADMIN_ITEMS = NAV_ITEMS.slice(5);

export function DashboardShell({
  children,
  inspector
}: {
  children: React.ReactNode;
  inspector?: React.ReactNode;
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

  function NavItem({ href, label }: { href: string; label: string }) {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href as never}
        className={clsx(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-accent/[0.12] text-accent"
            : "text-subtle hover:text-text hover:bg-white/[0.04]"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
        )}
        <span
          className={clsx(
            "flex-shrink-0 transition-colors duration-150",
            isActive ? "text-accent" : "text-subtle/50 group-hover:text-subtle"
          )}
        >
          {ICON_MAP[href]}
        </span>
        {label}
      </Link>
    );
  }

  return (
    <div
      className={clsx(
        "min-h-screen grid bg-bg-deep",
        inspector ? "grid-cols-[220px_1fr_300px]" : "grid-cols-[220px_1fr]"
      )}
    >
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="flex flex-col border-r border-white/5 bg-panel sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f5c451, #b22234)" }}
            >
              <span className="text-black font-black text-sm select-none">E</span>
            </div>
            <div className="leading-none min-w-0">
              <p className="font-black text-[13px] tracking-[0.1em] uppercase text-text truncate">Elements</p>
              <p className="text-[10px] text-subtle/50 mt-0.5">Studio</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle/40 px-3 pb-2">
            Tools
          </p>
          <div className="space-y-0.5">
            {TOOL_ITEMS.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle/40 px-3 pb-2 pt-5">
            Admin
          </p>
          <div className="space-y-0.5">
            {ADMIN_ITEMS.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
        </nav>

        {/* Sign out */}
        <div className="px-2 py-3 border-t border-white/5 flex-shrink-0">
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="group flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-subtle/60 hover:text-danger hover:bg-danger/5 transition-all duration-150 disabled:opacity-50"
          >
            <span className="flex-shrink-0 text-subtle/40 group-hover:text-danger transition-colors">
              <IcoSignOut />
            </span>
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <main className="overflow-auto bg-bg">{children}</main>

      {/* ── OPTIONAL INSPECTOR ──────────────────────────── */}
      {inspector && (
        <aside className="border-l border-white/5 bg-panel overflow-auto sticky top-0 h-screen">
          {inspector}
        </aside>
      )}
    </div>
  );
}
