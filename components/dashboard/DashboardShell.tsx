"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/lib/constants";
import { useState } from "react";

export function DashboardShell({ children, inspector }: { children: React.ReactNode; inspector?: React.ReactNode }) {
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
    <div className="min-h-screen grid grid-cols-[240px_1fr_320px]">
      <aside className="border-r border-panelMuted bg-panel p-4">
        <h1 className="text-xl font-semibold mb-8">Overlay Studio</h1>
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:ring-accent",
                pathname.startsWith(item.href) ? "bg-panelMuted text-text" : "text-subtle hover:text-text"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="mt-6 w-full rounded-md border border-panelMuted px-3 py-2 text-left text-subtle hover:text-text disabled:opacity-60"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </aside>
      <main className="p-6">{children}</main>
      <aside className="border-l border-panelMuted bg-panel/80 p-4">{inspector ?? <p className="text-subtle">Inspector</p>}</aside>
    </div>
  );
}

