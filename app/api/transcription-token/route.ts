import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { grantTranscriptionToken } from "@/lib/deepgram";
import type { TranscriptionTokenResponse } from "@/types";

// Mints a short-lived Deepgram token. Auth-gated so only signed-in hosts can
// obtain one; audio streams client → Deepgram, never through our server.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { accessToken, expiresIn } = await grantTranscriptionToken();
    return NextResponse.json<TranscriptionTokenResponse>({
      accessToken,
      expiresIn,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not mint a transcription token" },
      { status: 502 }
    );
  }
}
