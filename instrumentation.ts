/**
 * Next.js Instrumentation Hook — runs once when the server process starts.
 * We cannot import bot.ts here (it uses the Node.js `net` built-in which
 * webpack can't resolve at build time). Instead we call our own restart
 * endpoint after a short delay to give the HTTP server time to bind.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return;

  // Wait 8 seconds for the HTTP server to be ready, then trigger bot restart.
  setTimeout(() => {
    void fetch(`${appUrl}/api/internal/bots/restart`).catch(() => {/* ignore */});
  }, 8_000);
}
