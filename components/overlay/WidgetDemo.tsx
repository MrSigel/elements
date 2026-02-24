"use client";

import { WidgetCard } from "@/components/overlay/OverlayRuntime";

const DEMO_STATES: Record<string, Record<string, unknown>> = {
  bonushunt: {
    title: "Bonus Hunt #5",
    total_buyins: 2500,
    total_win: 8340,
    best_x: 187,
    biggest_win: 4200,
    opened: 3,
    total: 12,
    entries: [
      { slot_name: "Sweet Bonanza", bet: 2.5, win: 4200, multiplier: 187 },
      { slot_name: "Gates of Olympus", bet: 2.5, win: 1850, multiplier: 74 },
      { slot_name: "Big Bass Bonanza", bet: 2.5, win: 960, multiplier: 38 },
      { slot_name: "Wanted Dead or a Wild", bet: 2.5, win: 525, multiplier: 21 },
    ],
  },
  slot_battle: {
    stage: "Round 3",
    round: 3,
    status: "running",
    slot_a: "Sweet Bonanza",
    slot_b: "Gates of Olympus",
    score_a: 847,
    score_b: 623,
  },
  tournament: {
    standings: [
      { participant: "SlotKing99", score: 2840 },
      { participant: "BigWinMax", score: 1950 },
      { participant: "CasinoQueen", score: 1720 },
      { participant: "LuckyRoller", score: 1340 },
      { participant: "GoldSpinner", score: 980 },
    ],
  },
  quick_guessing: {
    open: true,
    messages: [
      { user: "SlotFan99", text: "1500" },
      { user: "BigWinMax", text: "2800" },
      { user: "CasinoQueen", text: "750" },
      { user: "LuckyRoller", text: "3200" },
      { user: "GoldSpinner", text: "1100" },
    ],
  },
  slot_requests: {
    requests: [
      { slot_name: "Sweet Bonanza", username: "SlotKing99" },
      { slot_name: "Book of Dead", username: "BigWinMax" },
      { slot_name: "Wanted Dead or a Wild", username: "CasinoQueen" },
      { slot_name: "Reactoonz", username: "LuckyRoller" },
      { slot_name: "Dog House", username: "GoldSpinner" },
    ],
  },
  current_playing: {
    game_name: "Sweet Bonanza",
    provider: "Pragmatic Play",
    best_win: 4200,
    best_x: 187,
    potential: "5000x",
    rtp: "96.50%",
  },
  hot_words: {
    words: [
      { phrase: "!points", count: 147 },
      { phrase: "lets go!", count: 89 },
      { phrase: "!guess", count: 73 },
      { phrase: "!slotrequest", count: 61 },
      { phrase: "POGCHAMP", count: 55 },
    ],
  },
  wager_bar: {
    value: 68,
  },
  deposit_withdrawal: {
    total_deposits: 5200,
    total_withdrawals: 1800,
    balance: 3400,
    tx_type: "deposit",
    amount: 500,
  },
  loyalty: {
    total_points_granted: 45200,
    store_items: [
      { name: "Shoutout", cost: 500 },
      { name: "Song Request", cost: 200 },
      { name: "VIP for 1 day", cost: 1000 },
    ],
    recent_redemptions: [
      { user: "SlotFan99", item: "Shoutout" },
      { user: "BigWinMax", item: "Song Request" },
    ],
  },
  points_battle: {
    status: "running",
    entry_cost: 100,
    team_a: "Red Dragons",
    team_b: "Blue Wolves",
    score_a: 12400,
    score_b: 9850,
    count_a: 47,
    count_b: 38,
  },
  wheel: {
    segments: ["Bonus Hunt", "Slot Battle", "Free Spins", "Mystery", "Skip", "x2 Points"],
    result: "Bonus Hunt",
    result_index: 0,
  },
  personal_bests: {
    metrics: [
      { metric_key: "Biggest Win", metric_value: 42000 },
      { metric_key: "Biggest X", metric_value: 4200 },
      { metric_key: "Session PnL", metric_value: 8340 },
      { metric_key: "Bonus Hunts", metric_value: 47 },
    ],
  },
};

export function WidgetDemo({ kind, name }: { kind: string; name: string }) {
  const state = DEMO_STATES[kind] ?? {};
  const displayKind = kind.replace(/_/g, " ");

  return (
    <div className="ovr-shell h-full w-full">
      <div className="ovr-shell-glow" />
      <div className="ovr-header">
        <p className="ovr-title">{name}</p>
        <span className="ovr-kind">{displayKind}</span>
      </div>
      <div className="ovr-content">
        <WidgetCard kind={kind} state={state} />
      </div>
    </div>
  );
}
