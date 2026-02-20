"use client";

import { useState } from "react";

export function WidgetControlDeck({ overlayId }: { overlayId: string }) {
  const [txType, setTxType] = useState("deposit");
  const [txAmount, setTxAmount] = useState(100);
  const [wager, setWager] = useState(50);
  const [game, setGame] = useState("Book of Time");
  const [provider, setProvider] = useState("NoLimit City");
  const [slotName, setSlotName] = useState("Legacy of Dead");
  const [bet, setBet] = useState(1);
  const [participant, setParticipant] = useState("player1");
  const [score, setScore] = useState(10);
  const [battleA, setBattleA] = useState("Slot A");
  const [battleB, setBattleB] = useState("Slot B");
  const [hotWord, setHotWord] = useState("max win");
  const [metricKey, setMetricKey] = useState("max_x");
  const [metricValue, setMetricValue] = useState(100);
  const [loyaltyUser, setLoyaltyUser] = useState("viewer1");
  const [loyaltyPoints, setLoyaltyPoints] = useState(25);
  const [storeItem, setStoreItem] = useState("Hydrate");
  const [storeCost, setStoreCost] = useState(100);

  async function emit(widgetType: string, eventType: string, payload: Record<string, unknown>) {
    await fetch("/api/widgets/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overlayId, widgetType, eventType, payload })
    });
    location.reload();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-3">
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Wager Bar</h3><input type="number" value={wager} onChange={(e) => setWager(Number(e.target.value))} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("wager_bar", "set_wager", { value: wager })} className="rounded bg-accent text-black px-3 py-2">Set Wager</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Deposit / Withdrawal</h3><div className="flex gap-2"><select value={txType} onChange={(e) => setTxType(e.target.value)} className="rounded bg-panelMuted px-3 py-2"><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option></select><input type="number" value={txAmount} onChange={(e) => setTxAmount(Number(e.target.value))} className="rounded bg-panelMuted px-3 py-2" /></div><button onClick={() => emit("deposit_withdrawal", "add_transaction", { tx_type: txType, amount: txAmount, source: "manual" })} className="rounded bg-accent text-black px-3 py-2">Add Transaction</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Current Playing</h3><input value={game} onChange={(e) => setGame(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><input value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("current_playing", "set_current_playing", { game_name: game, game_identifier: game.toLowerCase().replaceAll(" ", "_"), provider })} className="rounded bg-accent text-black px-3 py-2">Set Current Playing</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Bonushunt</h3><input value={slotName} onChange={(e) => setSlotName(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><input type="number" step="0.01" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("bonushunt", "bonushunt_add_bonus", { slot_name: slotName, provider, bet, cost: bet })} className="rounded bg-accent text-black px-3 py-2">Add Bonus</button><button onClick={() => emit("quick_guessing", "guessing_open", { maxEntries: 1 })} className="rounded bg-panelMuted px-3 py-2">Open Guessing</button><button onClick={() => emit("quick_guessing", "guessing_close", {})} className="rounded bg-panelMuted px-3 py-2">Close Guessing</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Tournament</h3><input value={participant} onChange={(e) => setParticipant(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("tournament", "score_update", { participant, score })} className="rounded bg-accent text-black px-3 py-2">Update Score</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Wheel</h3><button onClick={() => emit("wheel", "wheel_spin", { seed: crypto.randomUUID(), segments: ["A", "B", "C"] })} className="rounded bg-accent text-black px-3 py-2">Spin Wheel</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Slot vs Slot Battle</h3><input value={battleA} onChange={(e) => setBattleA(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><input value={battleB} onChange={(e) => setBattleB(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("slot_battle", "battle_start", { slotA: battleA, slotB: battleB })} className="rounded bg-accent text-black px-3 py-2">Start Battle</button><button onClick={() => emit("slot_battle", "battle_end", {})} className="rounded bg-panelMuted px-3 py-2">End Battle</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Slot Requests + Raffle</h3><input value={slotName} onChange={(e) => setSlotName(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("slot_requests", "request_add", { twitch_user_id: "manual_user", slot_name: slotName })} className="rounded bg-panelMuted px-3 py-2">Add Request</button><button onClick={() => emit("slot_requests", "raffle_draw", {})} className="rounded bg-accent text-black px-3 py-2">Draw Raffle Winner</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Hot Words</h3><input value={hotWord} onChange={(e) => setHotWord(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("hot_words", "hot_word_add", { phrase: hotWord, cooldown_seconds: 10, per_user_limit: 1 })} className="rounded bg-accent text-black px-3 py-2">Add Hot Word</button><button onClick={() => emit("hot_words", "hot_word_hit", { phrase: hotWord, twitch_user_id: "manual_user" })} className="rounded bg-panelMuted px-3 py-2">Register Hit</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Loyalty / Store</h3><input value={loyaltyUser} onChange={(e) => setLoyaltyUser(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><input type="number" value={loyaltyPoints} onChange={(e) => setLoyaltyPoints(Number(e.target.value))} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("loyalty", "points_grant", { twitch_user_id: loyaltyUser, points: loyaltyPoints, reason: "manual_grant" })} className="rounded bg-accent text-black px-3 py-2">Grant Points</button><input value={storeItem} onChange={(e) => setStoreItem(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><input type="number" value={storeCost} onChange={(e) => setStoreCost(Number(e.target.value))} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("loyalty", "store_item_create", { name: storeItem, cost: storeCost, cooldown_seconds: 0 })} className="rounded bg-panelMuted px-3 py-2">Create Store Item</button><button onClick={() => emit("loyalty", "store_redeem", { name: storeItem, twitch_user_id: loyaltyUser })} className="rounded bg-panelMuted px-3 py-2">Redeem Item</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Points Battle</h3><button onClick={() => emit("points_battle", "points_battle_start", { team_a: "Team A", team_b: "Team B", entry_cost: 10, duration_seconds: 300 })} className="rounded bg-accent text-black px-3 py-2">Start Points Battle</button><button onClick={() => emit("points_battle", "points_battle_join", { twitch_user_id: loyaltyUser, team: "Team A", points: loyaltyPoints })} className="rounded bg-panelMuted px-3 py-2">Join Battle</button><button onClick={() => emit("points_battle", "points_battle_end", {})} className="rounded bg-panelMuted px-3 py-2">End Battle</button></section>
      <section className="rounded border border-panelMuted bg-panel p-3 space-y-2"><h3 className="font-semibold">Personal Bests</h3><input value={metricKey} onChange={(e) => setMetricKey(e.target.value)} className="w-full rounded bg-panelMuted px-3 py-2" /><input type="number" value={metricValue} onChange={(e) => setMetricValue(Number(e.target.value))} className="w-full rounded bg-panelMuted px-3 py-2" /><button onClick={() => emit("personal_bests", "personal_best_set", { metric_key: metricKey, metric_value: metricValue })} className="rounded bg-accent text-black px-3 py-2">Set Personal Best</button></section>
    </div>
  );
}
