"use client";

import { useState } from "react";

export function ModInviteForm({ channels }: { channels: { id: string; title: string }[] }) {
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [twitchLogin, setTwitchLogin] = useState("");

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/moderation/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, twitchLogin })
    });
    setTwitchLogin("");
    location.reload();
  }

  return (
    <form onSubmit={invite} className="rounded-lg border border-panelMuted bg-panel p-3 space-y-2 max-w-md">
      <select className="w-full rounded bg-panelMuted px-3 py-2" value={channelId} onChange={(e) => setChannelId(e.target.value)}>
        {channels.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <input value={twitchLogin} onChange={(e) => setTwitchLogin(e.target.value)} placeholder="mod twitch login" className="w-full rounded bg-panelMuted px-3 py-2" required />
      <button className="rounded bg-accent text-black px-3 py-2">Invite Moderator</button>
    </form>
  );
}

