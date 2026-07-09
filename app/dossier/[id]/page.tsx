"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isApiError, type DossierDetail, type Source } from "@/types";

export default function DossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState<DossierDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  async function startSession(guestId: string) {
    setStarting(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      const data = await res.json();
      if (!res.ok || isApiError(data)) {
        toast.error(isApiError(data) ? data.error : "Could not start session.");
        setStarting(false);
        return;
      }
      router.push(`/session/${data.sessionId}`);
    } catch {
      toast.error("Network error — please try again.");
      setStarting(false);
    }
  }

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const res = await fetch(`/api/dossier/${id}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok || isApiError(data)) {
          setError(isApiError(data) ? data.error : "Could not load dossier.");
          return;
        }
        setDetail(data as DossierDetail);
        // Keep polling while the pipeline is still running.
        if ((data as DossierDetail).dossier.status === "pending") {
          timer = setTimeout(load, 2500);
        }
      } catch {
        if (active) setError("Network error — please refresh.");
      }
    }

    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id]);

  const sourceById = new Map<string, Source>(
    (detail?.sources ?? []).map((s) => [s.id, s])
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/dashboard">
          <ArrowLeft />
          Dashboard
        </Link>
      </Button>

      {error && (
        <Card>
          <CardContent className="flex items-center gap-3 py-6 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {!error && !detail && (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading dossier…
        </div>
      )}

      {detail && (
        <>
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {detail.guest.name}
              </h1>
              {detail.dossier.status === "pending" && (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Researching sources and drafting angles…
                </p>
              )}
            </div>
            <Button
              onClick={() => startSession(detail.guest.id)}
              disabled={starting}
            >
              {starting ? <Loader2 className="animate-spin" /> : <Radio />}
              Start live session
            </Button>
          </header>

          {detail.dossier.status === "failed" && (
            <Card className="mb-6 border-destructive/50">
              <CardContent className="flex items-start gap-3 py-6 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium">Research failed</p>
                  <p className="text-muted-foreground">
                    {detail.dossier.error ??
                      "The pipeline could not complete. Try again."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {detail.dossier.summary && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Briefing</CardTitle>
                <CardDescription>
                  {detail.dossier.model_used
                    ? `Grounded in ${detail.sources.length} source${
                        detail.sources.length === 1 ? "" : "s"
                      }`
                    : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm leading-relaxed">
                {detail.dossier.summary}
              </CardContent>
            </Card>
          )}

          {detail.angles.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                Angles
              </h2>
              <ol className="space-y-3">
                {detail.angles.map((angle) => {
                  const source = angle.source_id
                    ? sourceById.get(angle.source_id)
                    : null;
                  return (
                    <li key={angle.id}>
                      <Card>
                        <CardContent className="space-y-2 py-4">
                          <p className="font-medium">{angle.question}</p>
                          {angle.rationale && (
                            <p className="text-sm text-muted-foreground">
                              {angle.rationale}
                            </p>
                          )}
                          {source ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              {source.title ?? source.url}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              General opener
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {detail.sources.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                Sources
              </h2>
              <ul className="space-y-2">
                {detail.sources.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="size-3 shrink-0" />
                      {s.title ?? s.url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
