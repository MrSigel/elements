import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OverlayCreateForm } from "@/components/forms/OverlayCreateForm";
import { OverlayTable } from "@/components/forms/OverlayTable";
import { createServiceClient } from "@/lib/supabase/server";

export default async function OverlaysPage() {
  const admin = createServiceClient();
  const { data: overlays } = await admin
    .from("overlays")
    .select("id,name,is_published,width,height,overlay_tokens(public_token,revoked)")
    .order("created_at", { ascending: false });

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
