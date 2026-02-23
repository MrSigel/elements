/**
 * Layout for per-widget OBS BrowserSource pages (/w/[widgetToken]).
 * Overrides the global body background to transparent so OBS shows only
 * the widget card itself — not the site's dark gradient background.
 */
export default function WidgetObsLayout({ children }: { children: React.ReactNode }) {
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
