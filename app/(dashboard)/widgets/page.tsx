import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LayoutEditor } from "@/components/dashboard/LayoutEditor";
import { WidgetInstanceManager } from "@/components/forms/WidgetInstanceManager";
import { WidgetControlDeck } from "@/components/forms/WidgetControlDeck";
import { createServiceClient } from "@/lib/supabase/server";

export default async function WidgetsPage() {
  const admin = createServiceClient();
  const { data: overlays } = await admin.from("overlays").select("id").limit(1);
  const overlayId = overlays?.[0]?.id;
  const { data: instances } = overlayId
    ? await admin.from("widget_instances").select("id,kind,name,x,y,width,height,layer_index,is_enabled,widget_configs(config)").eq("overlay_id", overlayId).order("layer_index")
    : { data: [] as never[] };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Widgets + Layout + Live Controls</h2>
        {overlayId ? <WidgetControlDeck overlayId={overlayId} /> : <p className="text-subtle">Create an overlay first.</p>}
        {overlayId ? <WidgetInstanceManager overlayId={overlayId} widgets={(instances ?? []) as never[]} /> : null}
        {overlayId ? <LayoutEditor overlayId={overlayId} initial={instances ?? []} /> : null}
      </div>
    </DashboardShell>
  );
}
