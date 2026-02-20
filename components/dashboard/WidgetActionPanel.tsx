"use client";

const WIDGET_ACTIONS = [
  { widgetType: "wager_bar", eventType: "set_wager", payload: { value: 50 } },
  { widgetType: "deposit_withdrawal", eventType: "add_transaction", payload: { tx_type: "deposit", amount: 100 } },
  { widgetType: "current_playing", eventType: "set_current_playing", payload: { game: "Book of Time" } },
  { widgetType: "bonushunt", eventType: "bonushunt_add_bonus", payload: { slot_name: "Legacy of Dead", bet: 1 } },
  { widgetType: "quick_guessing", eventType: "guessing_open", payload: { maxEntries: 1 } },
  { widgetType: "slot_requests", eventType: "raffle_draw", payload: {} },
  { widgetType: "wheel", eventType: "wheel_spin", payload: { seed: crypto.randomUUID?.() ?? "seed" } },
  { widgetType: "hot_words", eventType: "hot_word_add", payload: { phrase: "max win" } },
  { widgetType: "tournament", eventType: "score_update", payload: { participant: "user", score: 1 } },
  { widgetType: "slot_battle", eventType: "battle_start", payload: { slotA: "A", slotB: "B" } },
  { widgetType: "loyalty", eventType: "points_grant", payload: { twitch_user_id: "u", points: 10 } },
  { widgetType: "points_battle", eventType: "points_battle_start", payload: { team_a: "A", team_b: "B" } },
  { widgetType: "personal_bests", eventType: "personal_best_set", payload: { metric_key: "max_x", metric_value: 25 } }
] as const;

export function WidgetActionPanel({ overlayId }: { overlayId: string }) {
  async function run(widgetType: string, eventType: string, payload: Record<string, unknown>) {
    await fetch("/api/widgets/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overlayId, widgetType, eventType, payload })
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-2">
      {WIDGET_ACTIONS.map((a) => (
        <button key={`${a.widgetType}-${a.eventType}`} onClick={() => run(a.widgetType, a.eventType, a.payload as Record<string, unknown>)} className="rounded bg-panel border border-panelMuted px-3 py-2 text-left hover:border-accent">
          <p className="font-medium capitalize">{a.widgetType.replaceAll("_", " ")}</p>
          <p className="text-xs text-subtle">{a.eventType}</p>
        </button>
      ))}
    </div>
  );
}

