/**
 * Plan + usage-limit config — the single source of truth for tiers.
 * See PRICING.md for the rationale, unit economics, and rollout plan.
 *
 * Metering dimensions (all reset monthly):
 *  - interviews  : live sessions started (COGS: transcription + live models)
 *  - dossiers    : research runs (COGS: web search + dossier model)
 *  - minutes     : per-session length cap (transcription is per-minute)
 */

export type PlanId = "free" | "creator" | "pro" | "studio";

export interface PlanLimits {
  id: PlanId;
  name: string;
  priceLabel: string; // display only
  pricePence: number; // monthly, GBP pence (0 = free)
  interviews: number; // included live sessions / month
  maxInterviewMinutes: number; // per-session length cap
  dossiers: number; // included dossiers / month
  /** Charge per extra interview beyond the quota; null = hard stop (no overage). */
  overagePencePerInterview: number | null;
  seats: number;
  /** Env var holding the Stripe recurring Price ID for this tier. */
  stripePriceEnv: string | null;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "Free",
    pricePence: 0,
    interviews: 2,
    maxInterviewMinutes: 30,
    dossiers: 5,
    overagePencePerInterview: null, // hard stop → upgrade
    seats: 1,
    stripePriceEnv: null,
  },
  creator: {
    id: "creator",
    name: "Creator",
    priceLabel: "£19/mo",
    pricePence: 1900,
    interviews: 6,
    maxInterviewMinutes: 60,
    dossiers: 30,
    overagePencePerInterview: 300, // £3 / extra interview
    seats: 1,
    stripePriceEnv: "STRIPE_PRICE_CREATOR",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "£49/mo",
    pricePence: 4900,
    interviews: 20,
    maxInterviewMinutes: 90,
    dossiers: 100,
    overagePencePerInterview: 250, // £2.50 / extra interview
    seats: 1,
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
  studio: {
    id: "studio",
    name: "Studio",
    priceLabel: "£129/mo",
    pricePence: 12900,
    interviews: 60, // pooled across seats
    maxInterviewMinutes: 120,
    dossiers: 300,
    overagePencePerInterview: 200, // £2 / extra interview
    seats: 3,
    stripePriceEnv: "STRIPE_PRICE_STUDIO",
  },
};

export function planFor(id: string | null | undefined): PlanLimits {
  return PLANS[(id ?? "free") as PlanId] ?? PLANS.free;
}

/** The cheapest paid tier — used for the upgrade CTA. */
export const FIRST_PAID_PLAN = PLANS.creator;

// --- Back-compat exports (existing call sites) -----------------------------
// TODO(oliver): migrate /api/session, dashboard, landing to `planFor(profile.plan)`
// and per-dimension checks (interviews + dossiers + minutes). See PRICING.md §6.
export const FREE_INTERVIEW_LIMIT = PLANS.free.interviews;
export const PRO_PRICE_LABEL = FIRST_PAID_PLAN.priceLabel;
