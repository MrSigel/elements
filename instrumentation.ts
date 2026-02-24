/**
 * Next.js Instrumentation Hook — runs once when the server process starts.
 * Calls /api/internal/bots/restart after 8s to start all active bots.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return;

  setTimeout(() => {
    const headers: Record<string, string> = {};
    const secret = process.env.CRON_SECRET;
    if (secret) headers["Authorization"] = `Bearer ${secret}`;

    void fetch(`${appUrl}/api/internal/bots/restart`, { headers })
      .then(r => r.json())
      .then(d => console.log("[instrumentation] bot restart:", JSON.stringify(d)))
      .catch(err => console.error("[instrumentation] bot restart failed:", err));
  }, 8_000);
}
