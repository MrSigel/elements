import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WebsiteBuilder } from "@/components/forms/WebsiteBuilder";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { getWebsiteConfig } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WebsitePage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  const admin = createServiceClient();

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
    <DashboardShell>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-black text-text">Streamer Landing Page</h1>
          <p className="text-sm text-subtle mt-1">Edit your public landing page — casino deals, giveaways, and navigation branding. Changes are live instantly.</p>
        </div>

        <WebsiteBuilder publicUrl={publicUrl} channelSlug={channelSlug} initialConfig={initialConfig} />
      </div>
    </DashboardShell>
  );
}
