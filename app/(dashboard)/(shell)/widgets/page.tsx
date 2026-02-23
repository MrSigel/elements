import { WidgetsTabs } from "@/components/dashboard/WidgetsTabs";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WidgetsPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return <p className="text-subtle p-6">Unauthorized.</p>;
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();
  const { data: overlays } = channelIds.length
    ? await admin.from("overlays").select("id").in("channel_id", channelIds).order("created_at", { ascending: false }).limit(1)
    : { data: [] as never[] };
  const overlayId = overlays?.[0]?.id;
  const { data: instances } = overlayId
    ? await admin.from("widget_instances").select("id,kind,name,x,y,width,height,layer_index,is_enabled,widget_configs(config),widget_tokens(public_token,revoked)").eq("overlay_id", overlayId).order("layer_index")
    : { data: [] as never[] };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-black text-text">Widgets</h1>
        <p className="text-sm text-subtle mt-1">Add widgets to your overlay and configure their behavior. Use Live Controls to trigger events manually during your stream.</p>
      </div>
      {overlayId ? (
        <WidgetsTabs overlayId={overlayId} widgets={(instances ?? []) as never[]} />
      ) : (
        <div className="rounded-lg border border-panelMuted bg-panel p-8 text-center">
          <p className="text-sm font-semibold text-text mb-1">No overlay yet</p>
          <p className="text-xs text-subtle">Go to <a href="/overlays" className="text-accent hover:underline">Overlays</a> and create your first overlay before adding widgets.</p>
        </div>
      )}
    </div>
  );
}
