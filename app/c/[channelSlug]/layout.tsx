import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getWebsiteConfig } from "@/lib/website-config";
import { PublicHelpWidget } from "@/components/website/PublicHelpWidget";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ channelSlug: string }>;
}) {
  const { channelSlug } = await params;
  const admin = createServiceClient();
  const { data: channel } = await admin.from("channels").select("id").eq("slug", channelSlug).maybeSingle();
  if (!channel) return notFound();

  const cfg = await getWebsiteConfig(channelSlug);
  const brand = cfg.navBrand?.trim() || "Elements";

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col">
      <header className="border-b border-[#2a3142] bg-[#0d1320] px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <p className="font-bold tracking-wide truncate">{brand}</p>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link href={`/c/${channelSlug}/startseite`}>Startseite</Link>
            <Link href={`/c/${channelSlug}/hunt`}>Hunt</Link>
            <Link href={`/c/${channelSlug}/giveaway`}>Giveaway</Link>
            <Link href={`/c/${channelSlug}/frontpage`}>Frontpage</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>

      <footer className="border-t border-[#2a3142] bg-[#0d1320] px-6 py-3 text-center text-xs text-slate-400">
        Copyright Elements
      </footer>
      <PublicHelpWidget />
    </div>
  );
}

