export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-xl bg-panel p-8 border border-panelMuted">
        <h1 className="text-3xl font-semibold mb-3">Connect your Twitch channel</h1>
        <p className="text-subtle mb-6">
          Authenticate with Twitch, then create your first overlay and publish it for OBS BrowserSource.
        </p>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed rounded-lg bg-panelMuted px-5 py-3 text-subtle font-semibold"
        >
          Twitch login temporarily disabled
        </button>
      </div>
    </div>
  );
}

