import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface UpdateSessionRequest {
  showNotes: string;
}

// Save host edits to the show-notes draft (PRD 6.4).
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

  let body: UpdateSessionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.showNotes !== "string") {
    return NextResponse.json({ error: "showNotes is required" }, { status: 400 });
  }

  // RLS scopes the update to the owner's session.
  const { data, error } = await supabase
    .from("sessions")
    .update({ show_notes: body.showNotes })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
