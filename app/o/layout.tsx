/**
 * Layout for full-overlay OBS BrowserSource pages (/o/[overlayToken]).
 * Ensures the body is transparent so OBS shows widget cards
 * directly over the game — without the site's dark gradient.
 */
export default function OverlayObsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body {
          background: transparent !important;
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        body::before, body::after {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
