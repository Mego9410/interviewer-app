/**
 * Plan config (PRD 6.5 / Section 13 open decision).
 * TODO(oliver): confirm the free allowance and price. Defaults follow the
 * PRD's assumption — 3 free interviews/month, £19/mo Pro. Both are easy to
 * change: the limit is this constant, the price is a Stripe price ID in env.
 */
export const FREE_INTERVIEW_LIMIT = 3;

export const PRO_PRICE_LABEL = "£19/mo";
