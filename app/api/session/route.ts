import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { CreateSessionRequest, CreateSessionResponse } from "@/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateSessionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const guestId = typeof body.guestId === "string" ? body.guestId : "";
  if (!guestId) {
    return NextResponse.json({ error: "guestId is required" }, { status: 400 });
  }

  // Confirm the guest belongs to this user (RLS also enforces this).
  const { data: guest } = await supabase
    .from("guests")
    .select("id")
    .eq("id", guestId)
    .single();
  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  // TODO(oliver): enforce the free-interview allowance here in M5.
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, guest_id: guestId, status: "active" })
    .select("id")
    .single();
  if (error || !session) {
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  return NextResponse.json<CreateSessionResponse>({ sessionId: session.id });
}
