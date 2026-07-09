import { cn } from "@/lib/utils";

/**
 * Full-bleed waveform — a recording's fingerprint. Deterministic heights
 * (server-rendered, no hydration drift); a slow breathing animation on a few
 * bars, disabled under prefers-reduced-motion via .wave-bar.
 */
export function WaveformStrip({
  bars = 96,
  className,
}: {
  bars?: number;
  className?: string;
}) {
  const heights = Array.from({ length: bars }, (_, i) => {
    // Layered sines read like speech: phrases, emphasis, pauses.
    const a = Math.sin(i * 0.35) * 0.35;
    const b = Math.sin(i * 0.11 + 1.7) * 0.3;
    const c = Math.sin(i * 0.83 + 0.4) * 0.15;
    return 0.18 + Math.abs(a + b + c) * 0.82;
  });

  return (
    <div
      aria-hidden="true"
      className={cn("flex h-16 items-center gap-[3px] overflow-hidden", className)}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] shrink-0 rounded-full",
            i % 7 === 3 ? "wave-bar bg-signal/80" : "bg-signal/35"
          )}
          style={{
            height: `${Math.round(h * 100)}%`,
            ...(i % 7 === 3 ? { animationDelay: `${(i % 11) * 0.2}s` } : {}),
          }}
        />
      ))}
    </div>
  );
}
