import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { OverlayRuntime } from "@/components/overlay/OverlayRuntime";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WidgetObsPage({ params }: { params: Promise<{ widgetToken: string }> }) {
  const { widgetToken } = await params;
  const admin = createServiceClient();

  const { data: tokenRow } = await admin
    .from("widget_tokens")
    .select("widget_instance_id, widget_instances!inner(id, kind, name, width, height, overlay_id, is_enabled, widget_configs(config))")
    .eq("public_token", widgetToken)
    .eq("revoked", false)
    .single();

  if (!tokenRow) return notFound();
  const wi = Array.isArray(tokenRow.widget_instances) ? tokenRow.widget_instances[0] : tokenRow.widget_instances;
  if (!wi || !wi.is_enabled) return notFound();

  const { data: snap } = await admin
    .from("widget_snapshots")
    .select("widget_instance_id, widget_type, state")
    .eq("overlay_id", wi.overlay_id)
    .eq("widget_instance_id", wi.id)
    .maybeSingle();

  const wiConfig = Array.isArray(wi.widget_configs) ? wi.widget_configs[0] : wi.widget_configs;
  const layout = [{
    id: wi.id,
    x: 0,
    y: 0,
    width: Number(wi.width),
    height: Number(wi.height),
    kind: wi.kind,
    name: wi.name,
    config: (wiConfig as { config?: Record<string, unknown> } | null)?.config ?? {}
  }];

  return (
    <OverlayRuntime
      overlayId={wi.overlay_id}
      initialSnapshots={snap ? [snap] : []}
      layout={layout}
    />
  );
}
