/**
 * Model routing (PRD 7.2). Confirmed current model strings.
 * - Strong tier: dossier + question generation.
 * - Fast tier: live triage (used in M3).
 */
export const MODELS = {
  strong: "claude-sonnet-5",
  fast: "claude-haiku-4-5",
} as const;
