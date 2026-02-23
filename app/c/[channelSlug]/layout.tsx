import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getWebsiteConfig } from "@/lib/website-config";
import { PublicHelpWidget } from "@/components/website/PublicHelpWidget";
import { ChannelNav } from "@/components/website/ChannelNav";

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
  const brand = cfg.navBrand?.trim() || channelSlug;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080c14", color: "#e5edf5" }}>
      <ChannelNav channelSlug={channelSlug} brand={brand} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
      <footer
        className="px-6 py-4 text-center text-xs border-t"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.25)",
          background: "rgba(0,0,0,0.25)"
        }}
      >
        Powered by <span style={{ color: "#f5c451" }}>Elements</span>
      </footer>
      <PublicHelpWidget />
    </div>
  );
}
