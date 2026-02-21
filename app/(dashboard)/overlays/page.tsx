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
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold">Overlay Manager</h2>
        <OverlayCreateForm />
        <OverlayTable overlays={(overlays ?? []) as never[]} />
      </div>
    </DashboardShell>
  );
}

