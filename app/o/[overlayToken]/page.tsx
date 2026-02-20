import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { OverlayRuntime } from "@/components/overlay/OverlayRuntime";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverlayPage({ params }: { params: Promise<{ overlayToken: string }> }) {
  const { overlayToken } = await params;
  const admin = createServiceClient();
  const { data: token } = await admin
    .from("overlay_tokens")
    .select("overlay_id,overlays!inner(id,is_published)")
    .eq("public_token", overlayToken)
    .eq("revoked", false)
    .single();

  const overlayRel = Array.isArray(token?.overlays) ? token?.overlays[0] : token?.overlays;
  if (!token || !overlayRel?.is_published) return notFound();

  const [{ data: snapshots }, { data: widgets }] = await Promise.all([
    admin.from("widget_snapshots").select("widget_instance_id,widget_type,state").eq("overlay_id", token.overlay_id),
    admin.from("widget_instances").select("id,x,y,width,height,kind,name,is_enabled").eq("overlay_id", token.overlay_id).eq("is_enabled", true).order("layer_index")
  ]);

  const layout = (widgets ?? []).map((w) => ({ id: w.id, x: Number(w.x), y: Number(w.y), width: Number(w.width), height: Number(w.height), kind: w.kind, name: w.name }));

  return <OverlayRuntime overlayId={token.overlay_id} initialSnapshots={snapshots ?? []} layout={layout} />;
}
