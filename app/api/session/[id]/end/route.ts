import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { generateShowNotes } from "@/lib/ai/shownotes";
import type { Guest, RecentSegment, Suggestion, TranscriptSegment } from "@/types";

export const maxDuration = 120;

// Ends a session: stamps ended_at, drafts show notes, persists (PRD 6.4 / 9).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id, guest_id, status")
    .eq("id", id)
    .single();
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const [{ data: guest }, { data: segments }, { data: asked }] =
    await Promise.all([
      supabase.from("guests").select("name").eq("id", session.guest_id).single<Pick<Guest, "name">>(),
      supabase
        .from("transcript_segments")
        .select("speaker, text")
        .eq("session_id", id)
        .order("created_at", { ascending: true })
        .returns<Pick<TranscriptSegment, "speaker" | "text">[]>(),
      supabase
        .from("suggestions")
        .select("question")
        .eq("session_id", id)
        .eq("status", "asked")
        .returns<Pick<Suggestion, "question">[]>(),
    ]);

  const recent: RecentSegment[] = (segments ?? []).map((s) => ({
    speaker: s.speaker,
    text: s.text,
  }));

  const showNotes = await generateShowNotes({
    guestName: guest?.name ?? "Guest",
    segments: recent,
    askedQuestions: (asked ?? []).map((a) => a.question),
  });

  await supabase
    .from("sessions")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
      show_notes: showNotes,
    })
    .eq("id", id);

  return NextResponse.json({ showNotes });
}
