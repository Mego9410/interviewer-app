import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiveTranscript } from "@/components/session/live-transcript";
import { SessionRecap } from "@/components/session/session-recap";
import { createClient } from "@/lib/supabase/server";
import type { Guest, Session, Suggestion, TranscriptSegment } from "@/types";

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

  const ended = session.status === "ended";

  let segments: Pick<TranscriptSegment, "id" | "speaker" | "text">[] = [];
  let suggestions: Pick<Suggestion, "id" | "question" | "status">[] = [];
  if (ended) {
    const [{ data: segs }, { data: sugg }] = await Promise.all([
      supabase
        .from("transcript_segments")
        .select("id, speaker, text")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true })
        .returns<Pick<TranscriptSegment, "id" | "speaker" | "text">[]>(),
      supabase
        .from("suggestions")
        .select("id, question, status")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true })
        .returns<Pick<Suggestion, "id" | "question" | "status">[]>(),
    ]);
    segments = segs ?? [];
    suggestions = sugg ?? [];
  }

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
          {ended ? "Session recap" : "Live session"}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {guest?.name ?? "Guest"}
        </h1>
      </header>

      {ended ? (
        <SessionRecap
          sessionId={session.id}
          initialShowNotes={session.show_notes ?? ""}
          segments={segments}
          suggestions={suggestions}
        />
      ) : (
        <LiveTranscript sessionId={session.id} />
      )}
    </main>
  );
}
