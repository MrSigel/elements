import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { RealtimeRefresher } from "@/components/ui/RealtimeRefresher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ViewerLoyaltyPage({ params }: { params: Promise<{ viewerToken: string }> }) {
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
  if (!page?.enabled || page.page_type !== "loyalty") return notFound();

  const [{ data: storeItems }, { data: recentRedemptions }] = await Promise.all([
    admin
      .from("store_items")
      .select("id,name,cost,cooldown_seconds")
      .eq("channel_id", page.channel_id)
      .eq("is_active", true)
      .order("cost", { ascending: true }),
    admin
      .from("redemptions")
      .select("twitch_user_id,status,created_at,store_items(name)")
      .eq("channel_id", page.channel_id)
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  return (
    <main className="min-h-screen bg-bg-deep px-3 py-4 md:px-6 md:py-6">
      <RealtimeRefresher overlayId={page.overlay_id} />
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-black tracking-wide">Loyalty Store</h1>

        <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
          Type <span className="font-mono font-bold">!points</span> in chat to check your balance ·
          Type <span className="font-mono font-bold">!redeem [item]</span> to redeem
        </div>

        <div className="rounded-2xl border border-panelMuted bg-panel/85 px-4 py-3 space-y-3">
          <p className="text-sm font-semibold text-accent">Store Items</p>
          {!storeItems || storeItems.length === 0 ? (
            <p className="text-sm text-subtle">No items in the store yet.</p>
          ) : (
            <div className="space-y-2">
              {storeItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-panelMuted/60 bg-bg-deep/60 px-3 py-2">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    {(item.cooldown_seconds as number) > 0 ? (
                      <p className="text-xs text-subtle">{item.cooldown_seconds}s cooldown</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-bold text-accent">
                    {item.cost} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-panelMuted bg-panel/85 px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-accent">Recent Redemptions</p>
          {!recentRedemptions || recentRedemptions.length === 0 ? (
            <p className="text-sm text-subtle">No redemptions yet.</p>
          ) : (
            <div className="space-y-1">
              {recentRedemptions.map((r, i) => {
                const itemRel = Array.isArray(r.store_items) ? r.store_items[0] : r.store_items;
                return (
                  <div key={i} className="flex justify-between text-sm border-b border-panelMuted/50 py-1">
                    <span className="font-medium">{(itemRel as { name: string } | null)?.name ?? "?"}</span>
                    <span className="text-subtle">{r.twitch_user_id}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
