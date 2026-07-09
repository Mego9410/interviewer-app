import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { SuggestionStatus, UpdateSuggestionRequest } from "@/types";

const ALLOWED: SuggestionStatus[] = ["asked", "dismissed"];

export async function PATCH(
  request: Request,
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

  let body: UpdateSuggestionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!ALLOWED.includes(body.status)) {
    return NextResponse.json(
      { error: "status must be 'asked' or 'dismissed'" },
      { status: 400 }
    );
  }

  // RLS restricts the update to the owner's rows.
  const { data, error } = await supabase
    .from("suggestions")
    .update({ status: body.status })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
