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
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Website</h2>
        <p className="text-sm text-subtle">Edit your landing page content, navigation title, casino deals and giveaways.</p>

        <WebsiteBuilder publicUrl={publicUrl} channelSlug={channelSlug} initialConfig={initialConfig} />

        <section className="rounded-xl border border-panelMuted bg-panel p-5">
          <h3 className="text-lg font-semibold mb-2">Current Playing Auto-Tracking</h3>
          <p className="text-sm text-subtle">
            You do not need to enter the current slot manually if your extension is connected. It can be updated automatically through ingest.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
