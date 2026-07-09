import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiveTranscript } from "@/components/session/live-transcript";
import { createClient } from "@/lib/supabase/server";
import type { Guest, Session } from "@/types";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single<Session>();
  if (!session) {
    notFound();
  }

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", session.guest_id)
    .single<Guest>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/dashboard">
          <ArrowLeft />
          Dashboard
        </Link>
      </Button>

      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Live session
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {guest?.name ?? "Guest"}
        </h1>
      </header>

      <LiveTranscript sessionId={session.id} />
    </main>
  );
}
