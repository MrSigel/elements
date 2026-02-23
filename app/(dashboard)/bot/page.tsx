import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = { title: "Bot — Pulseframelabs Studio" };

function CommandCard({
  command,
  description,
  example,
  note
}: {
  command: string;
  description: string;
  example?: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-panel p-5">
      <div className="flex items-start gap-3">
        <code className="flex-shrink-0 rounded-md bg-accent/10 border border-accent/20 px-2.5 py-1 text-sm font-mono font-semibold text-accent">
          {command}
        </code>
      </div>
      <p className="mt-3 text-sm text-text leading-relaxed">{description}</p>
      {example && (
        <p className="mt-2 text-xs text-subtle/60 font-mono bg-white/[0.03] rounded-md px-3 py-1.5 border border-white/[0.05]">
          {example}
        </p>
      )}
      {note && (
        <p className="mt-2 text-xs text-subtle/50 italic">{note}</p>
      )}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-text">{title}</h2>
      <p className="text-sm text-subtle mt-0.5">{description}</p>
    </div>
  );
}

export default function BotPage() {
  return (
    <DashboardShell>
      <div className="p-8 max-w-3xl">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-text">Bot</h1>
            <p className="text-sm text-subtle mt-1">
              Twitch chat commands and automatic point rewards for your viewers.
              The bot connects using your Twitch account after you log in.
            </p>
          </div>
        </div>

        {/* How the bot works */}
        <div className="rounded-xl border border-white/[0.07] bg-panel p-5 mb-8">
          <h2 className="text-sm font-bold text-text mb-2">How it works</h2>
          <p className="text-sm text-subtle leading-relaxed">
            The bot joins your Twitch channel automatically as soon as you start a session with an
            overlay active. It uses your own Twitch account — no separate bot account needed.
            Commands are available to all viewers unless noted otherwise.
          </p>
        </div>

        {/* Points system */}
        <section className="mb-8">
          <SectionHeader
            title="Points system"
            description="Viewers earn points by participating in chat. Points are stored per-channel and never expire."
          />
          <div className="grid gap-3">
            <CommandCard
              command="!points"
              description="Check your current points balance. The bot replies with your total in chat."
              example="!points  →  @viewer you have 420 points."
            />
            <CommandCard
              command="Hotwords (passive)"
              description="Configure specific phrases in your Widgets settings. Whenever a viewer types a matching phrase in chat, they earn points automatically — no command needed. You can set a per-word cooldown (global) and a per-user limit to prevent farming."
              note="Hotwords are refreshed every 30 seconds, so new ones take effect without restarting."
            />
          </div>
        </section>

        {/* Bonus hunt */}
        <section className="mb-8">
          <SectionHeader
            title="Bonus hunt"
            description="Viewers guess the total payout while you're opening bonuses."
          />
          <div className="grid gap-3">
            <CommandCard
              command="!guess [number]"
              description="Submit a guess for the active bonus hunt. Only works while the guessing window is open (controlled from your overlay widget). Each viewer can submit one guess — re-submitting overwrites the previous one."
              example="!guess 1500  →  guess of 1500 recorded"
              note="The guessing widget must be in 'open' state. Close it from your widget controls to lock in guesses."
            />
          </div>
        </section>

        {/* Slot requests */}
        <section className="mb-8">
          <SectionHeader
            title="Slot requests"
            description="Viewers request which slot game they want to see next."
          />
          <div className="grid gap-3">
            <CommandCard
              command="!slotrequest [slot name]"
              description="Add a slot to the request queue. The request is shown live on your overlay. Viewers have a 30-second personal cooldown between requests and a maximum of 3 requests per minute. Viewers on your blacklist are automatically blocked."
              example="!slotrequest Sweet Bonanza"
              note="Manage the queue and blacklist in your Widgets panel under Slot Requests."
            />
          </div>
        </section>

        {/* Points battle */}
        <section className="mb-8">
          <SectionHeader
            title="Points battle"
            description="Viewers spend points to join a team battle shown on your overlay."
          />
          <div className="grid gap-3">
            <CommandCard
              command="!join [team name]"
              description="Join one of the two active teams in a running points battle. The entry cost is deducted from the viewer's points balance. If they don't have enough points, the bot informs them. Each viewer can only join once per battle."
              example="!join Red  →  @viewer you joined team Red!"
              note="The battle must be in 'running' state. Start battles from the Points Battle widget in your overlay."
            />
          </div>
        </section>

        {/* Loyalty store */}
        <section className="mb-8">
          <SectionHeader
            title="Loyalty store"
            description="Viewers spend their points to redeem custom rewards you define."
          />
          <div className="grid gap-3">
            <CommandCard
              command="!redeem [item name]"
              description="Redeem a store item by its exact name. The cost is deducted from the viewer's balance. If the item has a cooldown, the viewer must wait before redeeming it again. Redemptions appear as pending in your Loyalty widget until you mark them fulfilled."
              example="!redeem Shoutout"
              note="Add and manage store items (name, cost, cooldown) in the Loyalty widget settings."
            />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
