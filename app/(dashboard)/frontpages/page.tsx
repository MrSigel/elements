import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FrontpageManager } from "@/components/forms/FrontpageManager";
import { createServiceClient } from "@/lib/supabase/server";

export default async function FrontpagesPage() {
  const admin = createServiceClient();
  const [{ data: pages }, { data: overlays }] = await Promise.all([
    admin.from("viewer_pages").select("id,page_type,enabled,viewer_tokens(public_token)").order("created_at", { ascending: false }),
    admin.from("overlays").select("id,name").order("created_at", { ascending: false })
  ]);

  return (
    <DashboardShell>
      <h2 className="text-2xl font-semibold mb-6">Frontpages Manager</h2>
      <FrontpageManager overlays={overlays ?? []} pages={(pages ?? []) as never[]} />
    </DashboardShell>
  );
}
