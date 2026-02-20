"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/lib/constants";

export function DashboardShell({ children, inspector }: { children: React.ReactNode; inspector?: React.ReactNode }) {
  const pathname = usePathname();
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
      </aside>
      <main className="p-6">{children}</main>
      <aside className="border-l border-panelMuted bg-panel/80 p-4">{inspector ?? <p className="text-subtle">Inspector</p>}</aside>
    </div>
  );
}
