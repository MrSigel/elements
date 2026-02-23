import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OverlayCreateForm } from "@/components/forms/OverlayCreateForm";
import { OverlayTable } from "@/components/forms/OverlayTable";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverlaysPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return (
      <DashboardShell>
        <p className="text-subtle">Unauthorized.</p>
      </DashboardShell>
    );
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();
  const { data: overlays } = channelIds.length
    ? await admin
        .from("overlays")
        .select("id,name,is_published,width,height,overlay_tokens(public_token,revoked)")
        .in("channel_id", channelIds)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-black text-text">Overlays</h1>
          <p className="text-sm text-subtle mt-1">Create and manage your OBS overlay sources. Each overlay gets a public BrowserSource URL you add to OBS.</p>
        </div>
        <OverlayCreateForm />
        <OverlayTable overlays={(overlays ?? []) as never[]} />
      </div>
    </DashboardShell>
  );
}

