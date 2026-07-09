import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { FREE_INTERVIEW_LIMIT, PRO_PRICE_LABEL } from "@/lib/plan";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        The Second Question
      </p>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        The value is in the follow-up.
      </h1>
      <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
        A live copilot that builds a grounded dossier on your guest before the
        call, then surfaces dig-deeper follow-ups — each tied to a cited fact —
        while you interview.
      </p>
      <div className="mt-10 flex items-center gap-3">
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/login">Build your first dossier</Link>
          </Button>
        )}
      </div>

      {/* TODO(oliver): replace this explainer with the short explainer video. */}
      <div className="mt-16 grid w-full max-w-2xl gap-6 text-left sm:grid-cols-3">
        {[
          {
            step: "1",
            title: "Add your guest",
            body: "Name plus any links. We research public sources into a grounded dossier.",
          },
          {
            step: "2",
            title: "Go live",
            body: "Start a session before recording. We transcribe the call in your browser.",
          },
          {
            step: "3",
            title: "Ask the second question",
            body: "Cited follow-ups appear on your screen as the guest speaks.",
          },
        ].map((s) => (
          <div key={s.step}>
            <div className="mb-2 flex size-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {s.step}
            </div>
            <h3 className="text-sm font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        Free to start · {" "}
        {FREE_INTERVIEW_LIMIT} interviews a month, then {PRO_PRICE_LABEL}.
      </p>
    </main>
  );
}
