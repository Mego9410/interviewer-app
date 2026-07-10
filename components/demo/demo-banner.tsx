import Link from "next/link";

/** Persistent bar making clear this is a non-functional walkthrough. */
export function DemoBanner() {
  return (
    <div className="border-b border-signal/25 bg-signal-soft">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-signal">
          Demo · sample data · buttons don&apos;t do anything
        </p>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          Exit demo →
        </Link>
      </div>
    </div>
  );
}
