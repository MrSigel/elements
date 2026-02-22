import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-xl bg-panel p-8 border border-panelMuted space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Get started</h1>
          <p className="text-subtle">
            Connect your Twitch channel, then create your first overlay and publish it as an OBS BrowserSource.
          </p>
        </div>

        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-black font-bold text-xs">1</span>
            <div>
              <p className="font-medium text-text">Connect Twitch</p>
              <p className="text-subtle">Links your Twitch account so the chat bot can authenticate and send chat messages.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-black font-bold text-xs">2</span>
            <div>
              <p className="font-medium text-text">Create an Overlay</p>
              <p className="text-subtle">Go to Overlays, create one, and add widgets to it.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-black font-bold text-xs">3</span>
            <div>
              <p className="font-medium text-text">Publish &amp; Add to OBS</p>
              <p className="text-subtle">Publish the overlay to get a public URL, then add it as a BrowserSource in OBS.</p>
            </div>
          </li>
        </ol>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/api/auth/twitch/start"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-black font-semibold hover:bg-accent/90 transition-colors"
          >
            Connect Twitch
          </Link>
          <Link
            href="/overlays"
            className="inline-flex items-center justify-center rounded-lg border border-panelMuted bg-panelMuted px-5 py-3 font-semibold hover:border-accent/40 transition-colors"
          >
            Go to Overlays
          </Link>
        </div>
      </div>
    </div>
  );
}
