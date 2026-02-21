import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WidgetsTabs } from "@/components/dashboard/WidgetsTabs";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WidgetsPage() {
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
    ? await admin.from("overlays").select("id").in("channel_id", channelIds).order("created_at", { ascending: false }).limit(1)
    : { data: [] as never[] };
  const overlayId = overlays?.[0]?.id;
  const { data: instances } = overlayId
    ? await admin.from("widget_instances").select("id,kind,name,x,y,width,height,layer_index,is_enabled,widget_configs(config)").eq("overlay_id", overlayId).order("layer_index")
    : { data: [] as never[] };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Widgets</h2>
        {overlayId ? <WidgetsTabs overlayId={overlayId} widgets={(instances ?? []) as never[]} /> : <p className="text-subtle">Create an overlay first.</p>}
      </div>
    </DashboardShell>
  );
}

