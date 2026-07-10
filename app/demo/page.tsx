import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { DemoBanner } from "@/components/demo/demo-banner";
import { cn } from "@/lib/utils";

export const metadata = { title: "Demo · The Second Question" };

const GUESTS = [
  { name: "Jane Doe", status: "ready" as const },
  { name: "Marcus Bell", status: "pending" as const },
  { name: "Priya Nair", status: "ready" as const },
  { name: "Tom Okafor", status: "failed" as const },
];

const SESSIONS = [
  { name: "Jane Doe", state: "ended" as const, date: "10 Jul 2026" },
  { name: "Priya Nair", state: "active" as const, date: "9 Jul 2026" },
];

const STATUS = {
  ready: { label: "Ready", cls: "text-ok" },
  pending: { label: "Researching", cls: "text-signal" },
  failed: { label: "Failed", cls: "text-destructive" },
};

export default function DemoDashboard() {
  return (
    <>
      <DemoBanner />
      <SiteHeader
        href="/demo"
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/demo/new">
                <Plus />
                New dossier
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Exit</Link>
            </Button>
          </>
        }
      />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Dashboard</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Guests
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-3.5 w-1.5 rounded-full bg-signal" />
                <span className="h-3.5 w-1.5 rounded-full bg-signal" />
                <span className="h-3.5 w-1.5 rounded-full bg-border" />
              </span>
              2 of 3 free interviews
            </span>
            <Button variant="outline" size="sm">
              Go Pro · £19/mo
            </Button>
          </div>
        </header>

        <ul className="space-y-3">
          {GUESTS.map((g) => (
            <li key={g.name}>
              <Link href="/demo/dossier">
                <Card className="transition-colors hover:border-signal/40">
                  <CardContent className="flex items-center justify-between py-4">
                    <span className="font-serif text-lg italic">{g.name}</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em]",
                        STATUS[g.status].cls
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full bg-current",
                          g.status === "pending" && "animate-pulse"
                        )}
                      />
                      {STATUS[g.status].label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-12">
          <p className="eyebrow mb-4">Recent sessions</p>
          <ul className="space-y-2">
            {SESSIONS.map((s) => (
              <li key={s.name + s.date}>
                <Link href={s.state === "ended" ? "/demo/recap" : "/demo/session"}>
                  <Card className="transition-colors hover:border-signal/40">
                    <CardContent className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        {s.state === "active" ? (
                          <span className="inline-flex items-center gap-1.5 text-live">
                            <span className="size-1.5 animate-pulse rounded-full bg-live" />
                            LIVE
                          </span>
                        ) : (
                          <span>RECAP</span>
                        )}
                        <span className="tabular-nums">{s.date}</span>
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
