import "server-only";

import { DeepgramClient } from "@deepgram/sdk";

/**
 * Mint a short-lived Deepgram token server-side (M2). The browser streams
 * audio directly to Deepgram with this token — audio never routes through our
 * server (PRD 6.2 / 9). The API key stays server-side only.
 */
export async function grantTranscriptionToken(
  ttlSeconds = 60
): Promise<{ accessToken: string; expiresIn: number }> {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is not set");
  }

  const client = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });
  const res = await client.auth.v1.tokens.grant({ ttl_seconds: ttlSeconds });

  return {
    accessToken: res.access_token,
    expiresIn: res.expires_in ?? ttlSeconds,
  };
}
