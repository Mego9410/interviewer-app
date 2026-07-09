import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

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
            <Link href="/login">Get started</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
