import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export default async function ViewerBonushuntPage({ params }: { params: { viewerToken: string } }) {
  const admin = createServiceClient();
  const { data: token } = await admin
    .from("viewer_tokens")
    .select("viewer_pages!inner(id,page_type,enabled,overlay_id,channel_id)")
    .eq("public_token", params.viewerToken)
    .eq("revoked", false)
    .single();

  if (!token) return notFound();
  const page = Array.isArray(token.viewer_pages) ? token.viewer_pages[0] : token.viewer_pages;
  if (!page?.enabled || page.page_type !== "bonushunt") return notFound();

  const { data: hunt } = await admin.from("bonushunts").select("id,title,status,totals,bonushunt_entries(slot_name,provider,bet,cost,opened,result_win,result_multiplier)").eq("overlay_id", page.overlay_id).maybeSingle();

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-semibold">{hunt?.title ?? "Bonushunt"}</h1>
      <p className="text-subtle">Status: {hunt?.status ?? "inactive"}</p>
      <div className="space-y-2">
        {(hunt?.bonushunt_entries as Array<Record<string, unknown>> | undefined)?.map((e, i) => (
          <div key={i} className="rounded border border-panelMuted bg-panel p-3 text-sm">
            {String(e.slot_name)} | bet {String(e.bet)} | {Boolean(e.opened) ? "opened" : "pending"}
          </div>
        ))}
      </div>
      <form method="post" action={`/api/viewer/${params.viewerToken}/bonushunt/guess`} className="flex gap-2">
        <input name="value" type="number" step="0.01" required className="rounded bg-panel border border-panelMuted px-3 py-2" placeholder="Your total guess" />
        <button className="rounded bg-accent text-black px-3 py-2">Submit Guess</button>
      </form>
    </main>
  );
}
