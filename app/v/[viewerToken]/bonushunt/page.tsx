import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type HuntEntry = {
  slot_name: string | null;
  provider: string | null;
  bet: number | null;
  cost: number | null;
  opened: boolean | null;
  result_win: number | null;
  result_multiplier: number | null;
};

function n(v: unknown, d = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
}

function money(v: unknown) {
  return `${n(v, 0)}$`;
}

function text(v: unknown, d = "-") {
  return typeof v === "string" && v.trim().length > 0 ? v : d;
}

export default async function ViewerBonushuntPage({ params }: { params: Promise<{ viewerToken: string }> }) {
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
  if (!page?.enabled || page.page_type !== "bonushunt") return notFound();

  const [{ data: hunt }, { data: currentPlaying }] = await Promise.all([
    admin
      .from("bonushunts")
      .select("id,title,status,totals,bonushunt_entries(slot_name,provider,bet,cost,opened,result_win,result_multiplier)")
      .eq("overlay_id", page.overlay_id)
      .maybeSingle(),
    admin
      .from("current_playing")
      .select("game_name,provider")
      .eq("channel_id", page.channel_id)
      .maybeSingle()
  ]);

  const entries = ((hunt?.bonushunt_entries as HuntEntry[] | undefined) ?? []).map((e) => ({
    slotName: text(e.slot_name, "Unknown Slot"),
    provider: text(e.provider, ""),
    bet: n(e.bet, n(e.cost, 0)),
    opened: Boolean(e.opened),
    win: n(e.result_win, 0),
    multiplier: n(e.result_multiplier, 0)
  }));

  const openedEntries = entries.filter((e) => e.opened);
  const totalSlots = entries.length;
  const openedCount = openedEntries.length;
  const totalBuy = entries.reduce((sum, e) => sum + e.bet, 0);
  const totalWin = openedEntries.reduce((sum, e) => sum + e.win, 0);
  const bestX = openedEntries.reduce((max, e) => Math.max(max, e.multiplier), 0);
  const biggestWin = openedEntries.reduce((max, e) => Math.max(max, e.win), 0);
  const roi = totalBuy > 0 ? totalWin / totalBuy : 0;

  const topWins = [...openedEntries]
    .sort((a, b) => b.win - a.win)
    .slice(0, 2);

  const listSorted = [...entries].sort((a, b) => {
    if (a.opened && !b.opened) return -1;
    if (!a.opened && b.opened) return 1;
    return b.win - a.win;
  });

  return (
    <main className="min-h-screen bg-bg-deep px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-accent/25 bg-panel/85 p-4 shadow-xl md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-bg-deep/90 px-4 py-3">
          <div>
            <h1 className="text-2xl font-black tracking-wide text-text">{text(hunt?.title, "BONUSHUNT")}</h1>
            <p className="text-sm text-subtle">{text(currentPlaying?.game_name, "Current Game")} {currentPlaying?.provider ? `• ${currentPlaying.provider}` : ""}</p>
          </div>
          <div className="rounded-full bg-accent px-4 py-1 text-xl font-black text-black">
            {openedCount}/{totalSlots > 0 ? totalSlots : 0}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-bg-deep/90 p-2 md:grid-cols-4">
          <div className="rounded-xl border border-panelMuted px-3 py-2 text-center">
            <p className="text-xs uppercase text-subtle">Buy-In</p>
            <p className="text-xl font-bold text-text">{money(totalBuy)}</p>
          </div>
          <div className="rounded-xl border border-panelMuted px-3 py-2 text-center">
            <p className="text-xs uppercase text-subtle">Win</p>
            <p className="text-xl font-bold text-text">{money(totalWin)}</p>
          </div>
          <div className="rounded-xl border border-panelMuted px-3 py-2 text-center">
            <p className="text-xs uppercase text-subtle">Best X</p>
            <p className="text-xl font-bold text-text">{bestX.toFixed(2)}x</p>
          </div>
          <div className="rounded-xl border border-panelMuted px-3 py-2 text-center">
            <p className="text-xs uppercase text-subtle">Biggest Win</p>
            <p className="text-xl font-bold text-text">{money(biggestWin)}</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-bg-deep/90 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-accent">Top Opened Bonuses</p>
            <p className="text-sm text-subtle">ROI: {roi.toFixed(2)}x</p>
          </div>
          <div className="space-y-1 text-sm">
            {topWins.length === 0 ? (
              <p className="text-subtle">No opened bonuses yet.</p>
            ) : (
              topWins.map((e, i) => (
                <p key={`${e.slotName}-${i}`} className="text-text">
                  {i + 1}. {e.slotName} ({money(e.bet)}) = {money(e.win)} ({e.multiplier.toFixed(0)}x)
                </p>
              ))
            )}
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-bg-deep/90 px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs uppercase text-subtle">
            <span>All Bonuses</span>
            <span>Status: {text(hunt?.status, "inactive")}</span>
          </div>
          <div className="max-h-72 space-y-1 overflow-auto pr-1">
            {listSorted.length === 0 ? (
              <p className="text-sm text-subtle">No bonus slots yet.</p>
            ) : (
              listSorted.map((e, i) => (
                <div key={`${e.slotName}-${i}`} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-panelMuted/60 py-1 text-sm">
                  <p className="truncate text-text">
                    {i + 1}. {e.slotName}
                  </p>
                  <p className="text-subtle">({money(e.bet)})</p>
                  <p className="w-24 text-right font-semibold text-text">
                    {e.opened ? `${money(e.win)} (${e.multiplier.toFixed(0)}x)` : "Pending"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <form method="post" action={`/api/viewer/${viewerToken}/bonushunt/guess`} className="rounded-2xl bg-bg-deep/90 p-3 md:p-4">
          <p className="mb-2 text-sm font-semibold text-accent">Quick Guessing</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="value"
              type="number"
              step="0.01"
              required
              className="w-full rounded-lg border border-panelMuted bg-panel px-3 py-2"
              placeholder="Guess final total win"
            />
            <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-black">
              Submit Guess
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
