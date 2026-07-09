import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { FREE_INTERVIEW_LIMIT } from "@/lib/plan";
import type { CreateSessionRequest, CreateSessionResponse, Profile } from "@/types";

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

  // Enforce the free-interview allowance (PRD 9). Inline upgrade message via 402.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, interviews_used_this_period")
    .eq("id", user.id)
    .single<Pick<Profile, "plan" | "interviews_used_this_period">>();

  const isFree = (profile?.plan ?? "free") === "free";
  const used = profile?.interviews_used_this_period ?? 0;
  if (isFree && used >= FREE_INTERVIEW_LIMIT) {
    return NextResponse.json(
      {
        error: `You've used all ${FREE_INTERVIEW_LIMIT} free interviews this month. Upgrade to Pro for unlimited sessions.`,
      },
      { status: 402 }
    );
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, guest_id: guestId, status: "active" })
    .select("id")
    .single();
  if (error || !session) {
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  // Count the interview against the free allowance.
  // TODO(oliver): reset interviews_used_this_period monthly (cron / period start).
  if (isFree) {
    await supabase
      .from("profiles")
      .update({ interviews_used_this_period: used + 1 })
      .eq("id", user.id);
  }

  return NextResponse.json<CreateSessionResponse>({ sessionId: session.id });
}
