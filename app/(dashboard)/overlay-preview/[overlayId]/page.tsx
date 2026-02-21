import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { OverlayRuntime } from "@/components/overlay/OverlayRuntime";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverlayPreviewPage({ params }: { params: Promise<{ overlayId: string }> }) {
  const { overlayId } = await params;
  const cookieStore = await cookies();
  const isTestAuth = cookieStore.get("dev-test-auth")?.value === "1";
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user && !isTestAuth) return notFound();

  const admin = createServiceClient();
  const { data: overlay } = await admin
    .from("overlays")
    .select("id,channel_id,channels!inner(owner_id)")
    .eq("id", overlayId)
    .maybeSingle();

  if (!overlay) return notFound();
  const channelRel = Array.isArray((overlay as any).channels) ? (overlay as any).channels[0] : (overlay as any).channels;
  if (!channelRel) return notFound();
  if (!isTestAuth && channelRel.owner_id !== auth.user?.id) return notFound();

  const [{ data: snapshots }, { data: widgets }] = await Promise.all([
    admin.from("widget_snapshots").select("widget_instance_id,widget_type,state").eq("overlay_id", overlayId),
    admin
      .from("widget_instances")
      .select("id,x,y,width,height,kind,name,is_enabled")
      .eq("overlay_id", overlayId)
      .eq("is_enabled", true)
      .order("layer_index")
  ]);

  const layout = (widgets ?? []).map((w) => ({
    id: w.id,
    x: Number(w.x),
    y: Number(w.y),
    width: Number(w.width),
    height: Number(w.height),
    kind: w.kind,
    name: w.name
  }));

  return <OverlayRuntime overlayId={overlayId} initialSnapshots={snapshots ?? []} layout={layout} />;
}
