import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-xl bg-panel p-8 border border-panelMuted">
        <h1 className="text-3xl font-semibold mb-3">Connect your Twitch channel</h1>
        <p className="text-subtle mb-6">Authenticate with Twitch, then create your first overlay and publish it for OBS BrowserSource.</p>
        <Link href="/api/auth/twitch/start" className="inline-flex rounded-lg bg-accent px-5 py-3 text-black font-semibold focus-visible:ring-2 focus-visible:ring-accent">
          Continue with Twitch
        </Link>
      </div>
    </div>
  );
}
