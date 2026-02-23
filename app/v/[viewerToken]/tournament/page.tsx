import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { RealtimeRefresher } from "@/components/ui/RealtimeRefresher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ViewerTournamentPage({ params }: { params: Promise<{ viewerToken: string }> }) {
  const { viewerToken } = await params;
  const admin = createServiceClient();
  const { data: token } = await admin
    .from("viewer_tokens")
    .select("viewer_pages!inner(id,page_type,enabled,overlay_id)")
    .eq("public_token", viewerToken)
    .eq("revoked", false)
    .single();

  if (!token) return notFound();
  const page = Array.isArray(token.viewer_pages) ? token.viewer_pages[0] : token.viewer_pages;
  if (!page?.enabled || page.page_type !== "tournament") return notFound();

  const { data: tournament } = await admin
    .from("tournaments")
    .select("id,name,tournament_scores(participant,score,updated_at)")
    .eq("overlay_id", page.overlay_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const scores = ((tournament?.tournament_scores as Array<{ participant: string; score: number }> | undefined) ?? [])
    .sort((a, b) => b.score - a.score);

  const rankColor = (i: number) => {
    if (i === 0) return "text-accent";
    if (i === 1) return "text-[#b0b8c0]";
    if (i === 2) return "text-[#cd7f32]";
    return "text-subtle/40";
  };

  return (
    <main className="min-h-screen bg-bg-deep px-3 py-4 md:px-6 md:py-6">
      <RealtimeRefresher overlayId={page.overlay_id} />
      <div className="mx-auto max-w-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l2.4 5H18l-4.2 3.1 1.6 5L10 12.5 4.6 15.1l1.6-5L2 7h5.6z" fill="#f5c451"/>
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-wide text-text">
              {tournament?.name ?? "Tournament"}
            </h1>
          </div>
          <span className="rounded-full bg-panelMuted px-3 py-1 text-xs font-semibold text-subtle flex-shrink-0">
            {scores.length} {scores.length === 1 ? "player" : "players"}
          </span>
        </div>

        {/* Leaderboard */}
        {!tournament ? (
          <div className="rounded-2xl border border-panelMuted bg-panel/85 px-4 py-10 text-center">
            <p className="font-semibold text-subtle mb-1">No active tournament</p>
            <p className="text-xs text-subtle/50">Start a tournament from the dashboard to see scores here.</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="rounded-2xl border border-panelMuted bg-panel/85 px-4 py-10 text-center">
            <p className="font-semibold text-subtle mb-1">No scores yet</p>
            <p className="text-xs text-subtle/50">Scores will appear once the tournament begins.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-panelMuted bg-panel/85 overflow-hidden">
            {/* Column header */}
            <div className="grid grid-cols-[2.5rem_1fr_auto] gap-3 px-4 py-2.5 border-b border-panelMuted bg-panelMuted/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-subtle/50 text-center">#</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-subtle/50">Player</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-subtle/50">Score</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-panelMuted/40">
              {scores.map((s, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 ${i === 0 ? "bg-accent/5" : ""}`}
                >
                  <span className={`text-sm font-black tabular-nums text-center ${rankColor(i)}`}>
                    {i + 1}
                  </span>
                  <p className={`text-sm font-semibold truncate ${i === 0 ? "text-accent" : "text-text"}`}>
                    {s.participant}
                  </p>
                  <p className={`text-sm font-bold tabular-nums ${i === 0 ? "text-accent" : "text-subtle"}`}>
                    {s.score.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
