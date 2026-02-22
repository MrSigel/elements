import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { RealtimeRefresher } from "@/components/ui/RealtimeRefresher";
import ViewerRequestsClient from "./RequestsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ViewerRequestsPage({ params }: { params: Promise<{ viewerToken: string }> }) {
  const { viewerToken } = await params;
  const admin = createServiceClient();

  const { data: token } = await admin
    .from("viewer_tokens")
    .select("viewer_pages!inner(id,page_type,enabled,overlay_id,channel_id)")
    .eq("public_token", viewerToken)
    .eq("revoked", false)
    .single();

  if (!token) return notFound();
  const page = Array.isArray(token.viewer_pages) ? token.viewer_pages[0] : token.viewer_pages;
  if (!page?.enabled || page.page_type !== "requests") return notFound();

  const [{ data: requests }, { data: raffle }] = await Promise.all([
    admin.from("slot_requests").select("slot_name,twitch_user_id,status,created_at").eq("channel_id", page.channel_id).eq("status", "open").order("created_at", { ascending: false }).limit(50),
    admin.from("raffles").select("slot_requests(slot_name,twitch_user_id)").eq("channel_id", page.channel_id).order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  const winner = raffle?.slot_requests as { slot_name: string; twitch_user_id: string } | null | undefined;

  return (
    <main className="min-h-screen bg-bg-deep px-3 py-4 md:px-6 md:py-6">
      <RealtimeRefresher overlayId={page.overlay_id} />
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-black tracking-wide">Slot Requests</h1>

        {winner ? (
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
            <p className="text-xs uppercase text-accent font-semibold mb-1">Raffle Winner</p>
            <p className="font-bold">{winner.slot_name} <span className="font-normal text-subtle">by {winner.twitch_user_id}</span></p>
          </div>
        ) : null}

        <ViewerRequestsClient viewerToken={viewerToken} />

        <div className="rounded-2xl border border-panelMuted bg-panel/85 px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-accent">Current Requests ({requests?.length ?? 0})</p>
          {!requests || requests.length === 0 ? (
            <p className="text-sm text-subtle">No open requests yet.</p>
          ) : (
            <div className="space-y-1">
              {requests.map((r, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-panelMuted/50 py-1">
                  <span>{r.slot_name}</span>
                  <span className="text-subtle">{r.twitch_user_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
