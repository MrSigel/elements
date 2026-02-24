"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandIcon } from "@/components/BrandIcon";
import type { SiteTheme } from "@/lib/website-config";

export function ChannelNav({ channelSlug, brand, theme: t }: { channelSlug: string; brand: string; theme: SiteTheme }) {
  const pathname = usePathname();

  const links = [
    { href: `/c/${channelSlug}/startseite`, label: "Home" },
    { href: `/c/${channelSlug}/hunt`, label: "Hunt" },
    { href: `/c/${channelSlug}/giveaway`, label: "Giveaway" },
    { href: `/c/${channelSlug}/frontpage`, label: "Frontpages" }
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ background: t.headerBg, borderColor: t.headerBorder }}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-6 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <BrandIcon size="sm" />
          <p className="font-black text-sm uppercase tracking-widest truncate max-w-[180px]" style={{ color: t.navActiveText }}>
            {brand}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href as never}
                className="relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                style={{
                  color: isActive ? t.navActiveText : t.navIdleText,
                  background: isActive ? t.navActiveBg : "transparent"
                }}
              >
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                    style={{ background: t.navActiveBar }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
