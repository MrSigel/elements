import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getWebsiteConfig, getTheme } from "@/lib/website-config";
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
  const t = getTheme(cfg.template);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: t.pageBg, color: t.pageText }}>
      <ChannelNav channelSlug={channelSlug} brand={brand} theme={t} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
      <footer
        className="px-6 py-4 text-center text-xs border-t"
        style={{
          borderColor: t.footerBorder,
          color: t.footerText,
          background: t.footerBg
        }}
      >
        Powered by <span style={{ color: t.footerBrand }}>Pulseframelabs</span>
      </footer>
    </div>
  );
}
