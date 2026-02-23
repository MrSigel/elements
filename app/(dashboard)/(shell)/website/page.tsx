import { WebsiteBuilder } from "@/components/forms/WebsiteBuilder";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { getWebsiteConfig } from "@/lib/website-config";
import { getChannelPlan } from "@/lib/plan";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function UpgradeGate({ feature }: { feature: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-sm text-center space-y-5">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#a855f7" strokeWidth="1.6" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="#a855f7" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-black text-text">Enterprise Feature</h2>
          <p className="text-sm text-subtle mt-2">
            {feature} is available on the Enterprise plan. Upgrade to unlock this feature.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          Upgrade to Enterprise
        </Link>
      </div>
    </div>
  );
}

export default async function WebsitePage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  const admin = createServiceClient();

  if (auth.user?.id) {
    const plan = await getChannelPlan(auth.user.id);
    if (plan !== "enterprise") {
      return <UpgradeGate feature="The streamer landing page" />;
    }
  }

  let publicUrl: string | undefined;
  let channelSlug: string | undefined;
  if (auth.user?.id) {
    const { data: channel } = await admin.from("channels").select("slug").eq("owner_id", auth.user.id).limit(1).maybeSingle();
    if (channel?.slug) {
      channelSlug = channel.slug;
      publicUrl = `${env.NEXT_PUBLIC_APP_URL}/c/${channel.slug}`;
    }
  }
  const initialConfig = channelSlug ? await getWebsiteConfig(channelSlug) : undefined;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-black text-text">Streamer Landing Page</h1>
        <p className="text-sm text-subtle mt-1">Edit your public landing page — casino deals, giveaways, and navigation branding. Changes are live instantly.</p>
      </div>

      <WebsiteBuilder publicUrl={publicUrl} channelSlug={channelSlug} initialConfig={initialConfig} />
    </div>
  );
}
