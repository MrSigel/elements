export const metadata = { title: "Bot — Pulseframelabs Studio" };

function CommandCard({
  section,
  command,
  description,
  example,
  note
}: {
  section: string;
  command: string;
  description: string;
  example?: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-panel p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <code className="rounded-md bg-accent/10 border border-accent/20 px-2.5 py-1 text-sm font-mono font-semibold text-accent">
          {command}
        </code>
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-subtle/40 whitespace-nowrap mt-1.5 flex-shrink-0">{section}</span>
      </div>
      <p className="text-sm text-text leading-relaxed">{description}</p>
      {example && (
        <p className="text-xs text-subtle/60 font-mono bg-white/[0.03] rounded-md px-3 py-1.5 border border-white/[0.05]">
          {example}
        </p>
      )}
      {note && (
        <p className="text-xs text-subtle/50 italic">{note}</p>
      )}
    </div>
  );
}

export default function BotPage() {
  return (
    <div className="p-8">
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
      <div className="rounded-xl border border-white/[0.07] bg-panel p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-2">How it works</h2>
        <p className="text-sm text-subtle leading-relaxed">
          The bot joins your Twitch channel automatically as soon as you start a session with an
          overlay active. It uses your own Twitch account — no separate bot account needed.
          Commands are available to all viewers unless noted otherwise.
        </p>
      </div>

      {/* All commands — flat 2-column grid, section badge inside each card */}
      <div className="grid gap-3 sm:grid-cols-2">
        <CommandCard
          section="Points System"
          command="!points"
          description="Check your current points balance. The bot replies with your total in chat."
          example="!points  →  @viewer you have 420 points."
        />
        <CommandCard
          section="Points System"
          command="Hotwords (passive)"
          description="Configure specific phrases in your Widgets settings. Whenever a viewer types a matching phrase in chat, they earn points automatically — no command needed. Set a per-word cooldown and a per-user limit to prevent farming."
          note="Hotwords are refreshed every 30 seconds, so new ones take effect without restarting."
        />
        <CommandCard
          section="Bonus Hunt"
          command="!guess [number]"
          description="Submit a guess for the active bonus hunt. Only works while the guessing window is open (controlled from your overlay widget). Each viewer can submit one guess — re-submitting overwrites the previous one."
          example="!guess 1500  →  guess of 1500 recorded"
          note="The guessing widget must be in 'open' state. Close it from widget controls to lock in guesses."
        />
        <CommandCard
          section="Slot Requests"
          command="!slotrequest [slot name]"
          description="Add a slot to the request queue. The request is shown live on your overlay. Viewers have a 30-second personal cooldown and a maximum of 3 requests per minute. Blacklisted viewers are blocked automatically."
          example="!slotrequest Sweet Bonanza"
          note="Manage the queue and blacklist in the Slot Requests widget settings."
        />
        <CommandCard
          section="Points Battle"
          command="!join [team name]"
          description="Join one of the two active teams in a running points battle. The entry cost is deducted from the viewer's points balance. If they don't have enough points, the bot informs them. Each viewer can only join once per battle."
          example="!join Red  →  @viewer you joined team Red!"
          note="The battle must be in 'running' state. Start battles from the Points Battle widget."
        />
        <CommandCard
          section="Loyalty Store"
          command="!redeem [item name]"
          description="Redeem a store item by its exact name. The cost is deducted from the viewer's balance. If the item has a cooldown, the viewer must wait before redeeming again. Redemptions appear as pending in your Loyalty widget."
          example="!redeem Shoutout"
          note="Add and manage store items (name, cost, cooldown) in the Loyalty widget settings."
        />
      </div>
    </div>
  );
}
