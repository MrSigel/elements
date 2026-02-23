"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandIcon } from "@/components/BrandIcon";

export function ChannelNav({ channelSlug, brand }: { channelSlug: string; brand: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/c/${channelSlug}/startseite`, label: "Home" },
    { href: `/c/${channelSlug}/hunt`, label: "Hunt" },
    { href: `/c/${channelSlug}/giveaway`, label: "Giveaway" },
    { href: `/c/${channelSlug}/frontpage`, label: "Frontpages" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl"
      style={{ background: "rgba(10,13,20,0.85)" }}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-6 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <BrandIcon size="sm" />
          <p className="font-black text-sm uppercase tracking-widest text-white truncate max-w-[180px]">
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
                className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "text-[#f5c451] bg-[#f5c451]/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                    style={{ background: "#f5c451" }}
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
