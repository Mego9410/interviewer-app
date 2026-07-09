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

export interface Guest {
  id: string;
  user_id: string;
  name: string;
  links: string[];
  created_at: string;
}

export interface Dossier {
  id: string;
  user_id: string;
  guest_id: string;
  status: DossierStatus;
  summary: string | null;
  error: string | null;
  model_used: string | null;
  created_at: string;
}

export interface Source {
  id: string;
  user_id: string;
  dossier_id: string;
  url: string;
  title: string | null;
  snippet: string;
  retrieved_at: string;
}

export interface Angle {
  id: string;
  user_id: string;
  dossier_id: string;
  source_id: string | null;
  question: string;
  rationale: string | null;
  category: string | null;
}

// --- API request/response shapes ---
export interface CreateDossierRequest {
  name: string;
  links: string[];
}

export interface CreateDossierResponse {
  dossierId: string;
}

export interface DossierDetail {
  dossier: Dossier;
  guest: Guest;
  sources: Source[];
  angles: Angle[];
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
