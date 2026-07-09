import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { gatherSources } from "@/lib/research/tavily";
import { generateDossier, type SourceForPrompt } from "@/lib/ai/dossier";
import type { CreateDossierRequest, CreateDossierResponse } from "@/types";

// The research pipeline runs synchronously in this handler (PRD 9 allows this).
// TODO(oliver): move to a Supabase Edge Function / queue if this bumps the
// serverless timeout on real guests.
export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateDossierRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const links = Array.isArray(body.links)
    ? body.links.map((l) => String(l).trim()).filter(Boolean)
    : [];
  if (!name) {
    return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
  }

  // Create guest + pending dossier up front so the UI has an id to poll.
  const { data: guest, error: guestErr } = await supabase
    .from("guests")
    .insert({ user_id: user.id, name, links })
    .select("id")
    .single();
  if (guestErr || !guest) {
    return NextResponse.json({ error: "Could not create guest" }, { status: 500 });
  }

  const { data: dossier, error: dossierErr } = await supabase
    .from("dossiers")
    .insert({ user_id: user.id, guest_id: guest.id, status: "pending" })
    .select("id")
    .single();
  if (dossierErr || !dossier) {
    return NextResponse.json({ error: "Could not create dossier" }, { status: 500 });
  }

  const dossierId = dossier.id as string;

  try {
    // 1. Research — gather + persist grounded sources.
    const raw = await gatherSources(name, links);
    let stored: SourceForPrompt[] = [];
    if (raw.length > 0) {
      const { data: inserted } = await supabase
        .from("sources")
        .insert(
          raw.map((s) => ({
            user_id: user.id,
            dossier_id: dossierId,
            url: s.url,
            title: s.title,
            snippet: s.snippet,
          }))
        )
        .select("id, url, title, snippet");
      stored = (inserted ?? []).map((s) => ({
        id: s.id as string,
        url: s.url as string,
        title: s.title as string | null,
        snippet: s.snippet as string,
      }));
    }

    // 2. Generate — grounded summary + 10 angles.
    const { result, model } = await generateDossier(name, stored);

    if (result.angles.length > 0) {
      await supabase.from("angles").insert(
        result.angles.map((a) => ({
          user_id: user.id,
          dossier_id: dossierId,
          source_id: a.sourceId,
          question: a.question,
          rationale: a.rationale,
          category: a.category,
        }))
      );
    }

    await supabase
      .from("dossiers")
      .update({ status: "ready", summary: result.summary, model_used: model })
      .eq("id", dossierId);

    return NextResponse.json<CreateDossierResponse>({ dossierId });
  } catch (err) {
    // Degrade gracefully — mark failed, surface inline, never hang.
    const message = err instanceof Error ? err.message : "Research pipeline failed";
    await supabase
      .from("dossiers")
      .update({ status: "failed", error: message })
      .eq("id", dossierId);
    return NextResponse.json<CreateDossierResponse>({ dossierId });
  }
}
