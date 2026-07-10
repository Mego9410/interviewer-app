import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * DEV SIGN-IN — skips the email OTP step for testing.
 *
 * Signs into a dedicated, auto-provisioned test user (a REAL Supabase user, so
 * RLS still applies as that user). Strictly gated behind ALLOW_DEV_LOGIN=true;
 * returns 404 otherwise. NEVER enable this on a deployment with real users.
 *
 * Requires the normal backend env (Supabase URL/anon/service-role) — it only
 * bypasses the login email, not the backend itself.
 */
const DEV_EMAIL = process.env.DEV_LOGIN_EMAIL || "dev@thesecondquestion.app";
const DEV_PASSWORD = process.env.DEV_LOGIN_PASSWORD || "dev-only-password";

export async function GET(request: Request) {
  if (process.env.ALLOW_DEV_LOGIN !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const loginUrl = new URL("/login", request.url);

  try {
    const admin = createAdminClient();

    // Ensure the dev user exists with a known password + confirmed email.
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        email_confirm: true,
      });

    let userId = created?.user?.id;
    if (createErr) {
      // Most likely already registered — find it and reset the password so
      // sign-in is deterministic across runs.
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === DEV_EMAIL);
      if (!existing) throw createErr;
      userId = existing.id;
      await admin.auth.admin.updateUserById(existing.id, {
        password: DEV_PASSWORD,
        email_confirm: true,
      });
    }

    // Give the dev account Pro so the free-interview wall never blocks testing.
    if (userId) {
      await admin.from("profiles").update({ plan: "pro" }).eq("id", userId);
    }

    // Sign in on the session-bound server client — this sets the auth cookies.
    const supabase = await createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
    });
    if (signInErr) throw signInErr;

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    loginUrl.searchParams.set("error", "dev-login");
    return NextResponse.redirect(loginUrl);
  }
}
