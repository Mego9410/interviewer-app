import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { CreateSegmentRequest, Speaker } from "@/types";

const SPEAKERS: Speaker[] = ["host", "guest"];

// Persist one finalized transcript segment (M2). Live rendering happens on the
// client from the Deepgram stream; this saves the transcript so it survives
// reload and feeds the recap in M4.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateSegmentRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const speaker =
    body.speaker && SPEAKERS.includes(body.speaker) ? body.speaker : null;

  // Confirm the session belongs to this user (RLS also enforces it).
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: segment, error } = await supabase
    .from("transcript_segments")
    .insert({
      user_id: user.id,
      session_id: sessionId,
      speaker,
      text,
      ts_start: typeof body.tsStart === "number" ? body.tsStart : null,
      ts_end: typeof body.tsEnd === "number" ? body.tsEnd : null,
    })
    .select("id")
    .single();
  if (error || !segment) {
    return NextResponse.json({ error: "Could not save segment" }, { status: 500 });
  }

  return NextResponse.json({ segmentId: segment.id });
}
