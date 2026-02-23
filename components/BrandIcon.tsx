// Animated signal-bars brand icon for Pulseframelabs.
// Uses the `barBounce` keyframe defined in globals.css.

const BARS_MD = [
  { h: 9, d: "0s" },
  { h: 13, d: "0.15s" },
  { h: 8, d: "0.3s" },
  { h: 11, d: "0.08s" },
];

const BARS_SM = [
  { h: 6, d: "0s" },
  { h: 9, d: "0.15s" },
  { h: 6, d: "0.3s" },
];

export function BrandIcon({ size = "md" }: { size?: "sm" | "md" }) {
  const isSmall = size === "sm";
  const bars = isSmall ? BARS_SM : BARS_MD;
  return (
    <div
      className={`${
        isSmall ? "w-6 h-6 rounded-md" : "w-8 h-8 rounded-lg shadow-lg shadow-accent/20"
      } flex items-end justify-center gap-[2px] flex-shrink-0`}
      style={{
        background: "linear-gradient(135deg, #f5c451, #b22234)",
        paddingBottom: isSmall ? "4px" : "5px",
      }}
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: isSmall ? "2px" : "3px",
            height: `${bar.h}px`,
            borderRadius: "999px",
            background: "rgba(0,0,0,0.8)",
            transformOrigin: "bottom",
            animation: `barBounce 1.6s ease-in-out infinite ${bar.d}`,
          }}
        />
      ))}
    </div>
  );
}
