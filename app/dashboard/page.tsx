import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { UpgradeButton } from "@/components/upgrade-button";
import { createClient } from "@/lib/supabase/server";
import { FREE_INTERVIEW_LIMIT, PRO_PRICE_LABEL } from "@/lib/plan";
import { cn } from "@/lib/utils";
import type { DossierStatus, Profile } from "@/types";

import { SignOutButton } from "./sign-out-button";

interface GuestRow {
  id: string;
  name: string;
  created_at: string;
  dossiers: { id: string; status: DossierStatus; created_at: string }[];
}

interface SessionRow {
  id: string;
  status: "active" | "ended";
  started_at: string;
  guests: { name: string } | null;
}

function StatusPill({ status }: { status: DossierStatus | null }) {
  if (!status) {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        No dossier
      </span>
    );
  }
  const styles: Record<DossierStatus, string> = {
    pending: "text-signal",
    ready: "text-ok",
    failed: "text-destructive",
  };
  const labels: Record<DossierStatus, string> = {
    pending: "Researching",
    ready: "Ready",
    failed: "Failed",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em]",
        styles[status]
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-current",
          status === "pending" && "animate-pulse"
        )}
      />
      {labels[status]}
    </span>
  );
}

/** Free-plan usage as level-meter segments. */
function UsageMeter({ used }: { used: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: FREE_INTERVIEW_LIMIT }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-3.5 w-1.5 rounded-full",
            i < used ? "bg-signal" : "bg-border"
          )}
        />
      ))}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: guests }, { data: sessions }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
      supabase
        .from("guests")
        .select("id, name, created_at, dossiers(id, status, created_at)")
        .order("created_at", { ascending: false })
        .returns<GuestRow[]>(),
      supabase
        .from("sessions")
        .select("id, status, started_at, guests(name)")
        .order("started_at", { ascending: false })
        .limit(10)
        .returns<SessionRow[]>(),
    ]);

  const used = profile?.interviews_used_this_period ?? 0;

  return (
    <>
      <SiteHeader
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/dossier/new">
                <Plus />
                New dossier
              </Link>
            </Button>
            <SignOutButton />
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
          {(profile?.plan ?? "free") === "free" && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <UsageMeter used={used} />
                {used} of {FREE_INTERVIEW_LIMIT} free interviews
              </span>
              <UpgradeButton size="sm" variant="outline">
                Go Pro · {PRO_PRICE_LABEL}
              </UpgradeButton>
            </div>
          )}
        </header>

        {!guests || guests.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                Who are you talking to next?
              </CardTitle>
              <CardDescription>
                Add your first guest and we&apos;ll research them into a
                grounded dossier — with ten angles nobody else will ask.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dossier/new">
                  <Plus />
                  New dossier
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {guests.map((guest) => {
              const dossier = guest.dossiers
                ?.slice()
                .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
              const inner = (
                <Card className="transition-colors hover:border-signal/40">
                  <CardContent className="flex items-center justify-between py-4">
                    <span className="font-serif text-lg italic">{guest.name}</span>
                    <StatusPill status={dossier?.status ?? null} />
                  </CardContent>
                </Card>
              );
              return (
                <li key={guest.id}>
                  {dossier ? (
                    <Link href={`/dossier/${dossier.id}`}>{inner}</Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {sessions && sessions.length > 0 && (
          <section className="mt-12">
            <p className="eyebrow mb-4">Recent sessions</p>
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link href={`/session/${s.id}`}>
                    <Card className="transition-colors hover:border-signal/40">
                      <CardContent className="flex items-center justify-between py-3 text-sm">
                        <span className="font-medium">
                          {s.guests?.name ?? "Guest"}
                        </span>
                        <span className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                          {s.status === "active" && (
                            <span className="inline-flex items-center gap-1.5 text-live">
                              <span className="size-1.5 animate-pulse rounded-full bg-live" />
                              LIVE
                            </span>
                          )}
                          {s.status === "ended" && <span>RECAP</span>}
                          <span className="tabular-nums">
                            {new Date(s.started_at).toLocaleDateString()}
                          </span>
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
