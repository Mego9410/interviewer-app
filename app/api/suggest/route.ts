import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { triage } from "@/lib/ai/triage";
import { generateFollowUps } from "@/lib/ai/followups";
import type { SourceForPrompt } from "@/lib/ai/dossier";
import type {
  RecentSegment,
  Source,
  SuggestRequest,
  SuggestResponse,
  SuggestionWithSource,
} from "@/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SuggestRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const recent: RecentSegment[] = Array.isArray(body.recentSegments)
    ? body.recentSegments
        .filter((s) => s && typeof s.text === "string")
        .map((s) => ({ speaker: s.speaker ?? null, text: s.text }))
        .slice(-8)
    : [];
  if (!sessionId || recent.length === 0) {
    return NextResponse.json({ error: "sessionId and recentSegments are required" }, { status: 400 });
  }

  // Confirm the session belongs to this user (RLS also enforces it).
  const { data: session } = await supabase
    .from("sessions")
    .select("id, guest_id")
    .eq("id", sessionId)
    .single();
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Triage first — skip the expensive step when the moment doesn't warrant it.
  const decision = await triage(recent);
  if (!decision.worthFollowUp) {
    return NextResponse.json<SuggestResponse>({ suggestions: [] });
  }

  // Pull the guest's latest ready dossier for grounding (summary + sources).
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("id, summary")
    .eq("guest_id", session.guest_id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sources: SourceForPrompt[] = [];
  if (dossier) {
    const { data: rows } = await supabase
      .from("sources")
      .select("id, url, title, snippet")
      .eq("dossier_id", dossier.id)
      .returns<Pick<Source, "id" | "url" | "title" | "snippet">[]>();
    sources = (rows ?? []).map((s) => ({
      id: s.id,
      url: s.url,
      title: s.title,
      snippet: s.snippet,
    }));
  }

  const { followUps } = await generateFollowUps({
    topic: decision.topic,
    dossierSummary: dossier?.summary ?? null,
    sources,
    recent,
  });
  if (followUps.length === 0) {
    return NextResponse.json<SuggestResponse>({ suggestions: [] });
  }

  // Link to the guest's most recent persisted segment (best-effort).
  const { data: lastGuestSegment } = await supabase
    .from("transcript_segments")
    .select("id")
    .eq("session_id", sessionId)
    .eq("speaker", "guest")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: inserted } = await supabase
    .from("suggestions")
    .insert(
      followUps.map((f) => ({
        user_id: user.id,
        session_id: sessionId,
        segment_id: lastGuestSegment?.id ?? null,
        source_id: f.sourceId,
        question: f.question,
        rationale: f.rationale,
        status: "suggested",
      }))
    )
    .select("*")
    .returns<SuggestionWithSource[]>();

  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const suggestions: SuggestionWithSource[] = (inserted ?? []).map((s) => {
    const src = s.source_id ? sourceById.get(s.source_id) : null;
    return {
      ...s,
      source: src ? { id: src.id, url: src.url, title: src.title } : null,
    };
  });

  return NextResponse.json<SuggestResponse>({ suggestions });
}
