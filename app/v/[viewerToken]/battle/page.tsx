import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { RealtimeRefresher } from "@/components/ui/RealtimeRefresher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ViewerBattlePage({ params }: { params: Promise<{ viewerToken: string }> }) {
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
  if (!page?.enabled || page.page_type !== "battle") return notFound();

  const { data: battle } = await admin
    .from("points_battles")
    .select("id,team_a,team_b,entry_cost,status,ends_at,points_battle_entries(team,points)")
    .eq("channel_id", page.channel_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  type Entry = { team: string; points: number };
  const entries = ((battle?.points_battle_entries as Entry[] | undefined) ?? []);

  const scoreA = entries.filter(e => e.team === battle?.team_a).reduce((s, e) => s + e.points, 0);
  const scoreB = entries.filter(e => e.team === battle?.team_b).reduce((s, e) => s + e.points, 0);
  const countA = entries.filter(e => e.team === battle?.team_a).length;
  const countB = entries.filter(e => e.team === battle?.team_b).length;

  const isRunning = battle?.status === "running";
  const endsAt = battle?.ends_at ? new Date(battle.ends_at) : null;

  return (
    <main className="min-h-screen bg-bg-deep px-3 py-4 md:px-6 md:py-6">
      <RealtimeRefresher overlayId={page.overlay_id} />
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-wide">Points Battle</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isRunning ? "bg-green-500/20 text-green-400" : "bg-panelMuted text-subtle"}`}>
            {battle?.status ?? "No battle"}
          </span>
        </div>

        {isRunning ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
            Type <span className="font-mono font-bold">!join {battle?.team_a}</span> or{" "}
            <span className="font-mono font-bold">!join {battle?.team_b}</span> in chat ·
            Entry costs <span className="font-bold">{battle?.entry_cost} points</span>
            {endsAt ? ` · Ends ${endsAt.toLocaleTimeString()}` : ""}
          </div>
        ) : null}

        {battle ? (
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-2xl border px-4 py-6 text-center ${scoreA >= scoreB && isRunning ? "border-accent/40 bg-accent/10" : "border-panelMuted bg-panel/85"}`}>
              <p className="text-lg font-black tracking-wide mb-1">{battle.team_a}</p>
              <p className="text-4xl font-black text-accent">{scoreA}</p>
              <p className="text-xs text-subtle mt-1">{countA} member{countA !== 1 ? "s" : ""}</p>
            </div>
            <div className={`rounded-2xl border px-4 py-6 text-center ${scoreB > scoreA && isRunning ? "border-accent/40 bg-accent/10" : "border-panelMuted bg-panel/85"}`}>
              <p className="text-lg font-black tracking-wide mb-1">{battle.team_b}</p>
              <p className="text-4xl font-black text-accent">{scoreB}</p>
              <p className="text-xs text-subtle mt-1">{countB} member{countB !== 1 ? "s" : ""}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-panelMuted bg-panel/85 px-4 py-8 text-center text-subtle">
            No battle active right now.
          </div>
        )}
      </div>
    </main>
  );
}
