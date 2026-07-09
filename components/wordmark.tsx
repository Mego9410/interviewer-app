import { cn } from "@/lib/utils";

/** Static waveform glyph — the brand mark. */
export function WaveMark({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  // Bar heights sketch a spoken phrase — rises to a peak, then the pause.
  const bars = [0.35, 0.7, 1, 0.55, 0.8, 0.4, 0.6];
  return (
    <span
      className={cn("inline-flex h-4 items-center gap-[2px]", className)}
      aria-hidden="true"
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn("w-[2.5px] rounded-full bg-signal", animated && "wave-bar")}
          style={{
            height: `${h * 100}%`,
            ...(animated ? { animationDelay: `${i * 0.12}s` } : {}),
          }}
        />
      ))}
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <WaveMark />
      <span className="font-display text-[15px] font-semibold tracking-tight">
        The Second Question
      </span>
    </span>
  );
}
