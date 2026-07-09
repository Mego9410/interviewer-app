/**
 * Shared types for DB rows and API request/response shapes (Engineering Rule #7).
 * Kept in lockstep with the Supabase schema in `supabase/migrations`.
 */

// --- Enums / literals ---
export type Plan = "free" | "pro";
export type DossierStatus = "pending" | "ready" | "failed";
export type SessionStatus = "active" | "ended";
export type Speaker = "host" | "guest";
export type SuggestionStatus = "suggested" | "asked" | "dismissed";

// --- DB rows ---
export interface Profile {
  id: string;
  email: string | null;
  plan: Plan;
  interviews_used_this_period: number;
  stripe_customer_id: string | null;
  created_at: string;
}

// --- API envelopes ---
export interface ApiError {
  error: string;
}

export type ApiResult<T> = T | ApiError;

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiError).error === "string"
  );
}
