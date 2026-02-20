import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

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

  const scores = ((tournament?.tournament_scores as Array<{ participant: string; score: number }> | undefined) ?? []).sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">{tournament?.name ?? "Tournament"}</h1>
      <div className="space-y-2">
        {scores.map((s, i) => (
          <div key={i} className="rounded border border-panelMuted bg-panel p-3">{s.participant}: {s.score}</div>
        ))}
      </div>
    </main>
  );
}
