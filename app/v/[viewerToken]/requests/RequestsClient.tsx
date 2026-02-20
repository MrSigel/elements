"use client";

import { useState } from "react";

export default function ViewerRequestsClient({ viewerToken }: { viewerToken: string }) {
  const [slotName, setSlotName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/viewer/${viewerToken}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotName })
    });
    setStatus(res.ok ? "Submitted" : "Rejected");
  }

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl mb-4">Slot Requests</h1>
      <form onSubmit={submit} className="space-y-2 max-w-sm">
        <input value={slotName} onChange={(e) => setSlotName(e.target.value)} className="w-full rounded bg-panel border border-panelMuted px-3 py-2" required />
        <button className="rounded bg-accent text-black px-3 py-2">Submit</button>
      </form>
      {status ? <p className="mt-3 text-subtle">{status}</p> : null}
    </main>
  );
}
