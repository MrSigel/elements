import { OverlayStudio } from "@/components/dashboard/OverlayStudio";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";
import { getChannelPlan } from "@/lib/plan";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverlaysPage({ searchParams }: { searchParams: Promise<{ twitch?: string }> }) {
  const { twitch } = await searchParams;
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return <p className="text-subtle p-6">Unauthorized.</p>;
  }

  const [channelIds, plan] = await Promise.all([
    getAccessibleChannelIds(auth.user.id),
    getChannelPlan(auth.user.id)
  ]);

  const admin = createServiceClient();
  const { data: overlays } = channelIds.length
    ? await admin
        .from("overlays")
        .select("id,name,is_published,width,height,overlay_tokens(public_token,revoked)")
        .in("channel_id", channelIds)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  const overlayId = (overlays ?? [])[0]?.id;
  const { data: instances } = overlayId
    ? await admin
        .from("widget_instances")
        .select("id,kind,name,x,y,width,height,layer_index,is_enabled,widget_configs(config),widget_tokens(public_token,revoked)")
        .eq("overlay_id", overlayId)
        .order("layer_index")
    : { data: [] as never[] };

  return (
    <div className="p-6">
      <OverlayStudio
        overlays={(overlays ?? []) as never[]}
        overlayId={overlayId}
        widgets={(instances ?? []) as never[]}
        plan={plan}
        showTwitchBanner={twitch === "connected"}
      />
    </div>
  );
}
