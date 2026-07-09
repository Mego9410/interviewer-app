import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { Angle, Dossier, DossierDetail, Guest, Source } from "@/types";

export async function GET(
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

  // RLS already scopes every table to the owner; the query is safe as the user.
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("*")
    .eq("id", id)
    .single<Dossier>();
  if (!dossier) {
    return NextResponse.json({ error: "Dossier not found" }, { status: 404 });
  }

  const [{ data: guest }, { data: sources }, { data: angles }] =
    await Promise.all([
      supabase.from("guests").select("*").eq("id", dossier.guest_id).single<Guest>(),
      supabase
        .from("sources")
        .select("*")
        .eq("dossier_id", id)
        .order("retrieved_at", { ascending: true })
        .returns<Source[]>(),
      supabase
        .from("angles")
        .select("*")
        .eq("dossier_id", id)
        .returns<Angle[]>(),
    ]);

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json<DossierDetail>({
    dossier,
    guest,
    sources: sources ?? [],
    angles: angles ?? [],
  });
}
