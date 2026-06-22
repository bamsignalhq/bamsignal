/** Couple Happiness Notes™ — manual relationship notes. AI reserved for later. */

export const COUPLE_HAPPINESS_NOTES_TITLE = "Couple Happiness Notes™";
export const COUPLE_HAPPINESS_NOTES_SUBCOPY =
  "Warm, private relationship notes — celebrating progress with dignity.";
export const RELATIONSHIP_NOTES_LABEL = "Relationship Notes";
export const JOURNEY_MEMORIES_LABEL = "Journey Memories";
export const CELEBRATING_PROGRESS_LABEL = "Celebrating Progress";

export const COUPLE_HAPPINESS_PRIVACY_COPY =
  "Private by default. Visible to consultant and admin only — never public.";
export const COUPLE_HAPPINESS_MANUAL_COPY = "Manual notes today. AI summaries reserved for later.";
export const COUPLE_HAPPINESS_RESERVED_COPY =
  "Architecture prepared. AI summaries, anniversary books, and legacy memories are not enabled yet.";

export const COUPLE_HAPPINESS_NOTE_EXAMPLES = [
  "Very strong communication.",
  "Families supportive.",
  "Wedding planning underway.",
  "Excited about relocation to Canada.",
  "Healthy relationship.",
  "Strong spiritual values."
] as const;

export type CoupleHappinessNoteSource = "manual";

export type CoupleHappinessVisibility = "private-consultant-admin";

export type CoupleHappinessFutureCapability =
  | "ai-summaries"
  | "anniversary-books"
  | "legacy-memories";

export const COUPLE_HAPPINESS_FUTURE_CAPABILITIES: {
  id: CoupleHappinessFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "ai-summaries",
    label: "AI summaries",
    description: "Reserved — thoughtful summaries from consultant notes."
  },
  {
    id: "anniversary-books",
    label: "Anniversary books",
    description: "Reserved — printed journey memories for Legacy Archive couples."
  },
  {
    id: "legacy-memories",
    label: "Legacy memories",
    description: "Reserved — enduring memories preserved with warmth."
  }
];

/** Architecture flag — AI is not enabled. */
export const COUPLE_HAPPINESS_AI_ENABLED = false;

export function coupleHappinessNoteSourceLabel(source: CoupleHappinessNoteSource): string {
  return source === "manual" ? "Manual note" : source;
}
