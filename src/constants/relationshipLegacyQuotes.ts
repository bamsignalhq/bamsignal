/** Relationship Legacy Quotes™ — private by default. Consent required to share. */

export const RELATIONSHIP_LEGACY_QUOTES_TITLE = "Relationship Legacy Quotes™";
export const RELATIONSHIP_LEGACY_QUOTES_SUBCOPY =
  "Grateful words from successful journeys — preserved with dignity and consent.";
export const LEGACY_QUOTES_LABEL = "Legacy Quotes";
export const RELATIONSHIP_LEGACY_LABEL = "Relationship Legacy";

export const LEGACY_QUOTE_DEFAULT_PRIVATE_COPY = "Private by default — nothing shared without consent.";
export const LEGACY_QUOTE_CONSENT_REQUIRED_COPY =
  "Consent required before any quote may be used beyond the Legacy Archive.";
export const LEGACY_QUOTE_RESERVED_COPY =
  "Architecture prepared. Books, podcasts, videos, and documentaries are not enabled yet.";

export const LEGACY_QUOTE_EXAMPLES = [
  "Meeting through Signal Concierge changed our lives.",
  "God brought us together through BamSignal.",
  "We are grateful for the journey."
] as const;

export type LegacyQuoteVisibility = "private";

export type LegacyQuoteConsentLevel = "anonymous" | "first-name-only" | "full-story";

export type LegacyQuoteConsentDefinition = {
  id: LegacyQuoteConsentLevel;
  label: string;
  description: string;
};

export const LEGACY_QUOTE_CONSENT_LEVELS: LegacyQuoteConsentDefinition[] = [
  {
    id: "anonymous",
    label: "Anonymous",
    description: "Shared without names — gratitude preserved privately until approved."
  },
  {
    id: "first-name-only",
    label: "First Name Only",
    description: "First names only — warm recognition without full exposure."
  },
  {
    id: "full-story",
    label: "Full Story",
    description: "Full story consent — photos and journey details only with dual approval."
  }
];

export const LEGACY_QUOTE_CONSENT_LABELS: Record<LegacyQuoteConsentLevel, string> = Object.fromEntries(
  LEGACY_QUOTE_CONSENT_LEVELS.map((level) => [level.id, level.label])
) as Record<LegacyQuoteConsentLevel, string>;

export type LegacyQuoteFutureCapability = "books" | "podcasts" | "videos" | "documentaries";

export const LEGACY_QUOTE_FUTURE_CAPABILITIES: {
  id: LegacyQuoteFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "books",
    label: "Books",
    description: "Reserved — legacy quote collections for enduring journeys."
  },
  {
    id: "podcasts",
    label: "Podcasts",
    description: "Reserved — couple stories shared with care and consent."
  },
  {
    id: "videos",
    label: "Videos",
    description: "Reserved — visual legacy recognition with privacy controls."
  },
  {
    id: "documentaries",
    label: "Documentaries",
    description: "Reserved — long-form legacy storytelling with dual consent."
  }
];

export type LegacyQuoteEntry = {
  id: string;
  journeyId: string;
  body: string;
  recordedAt: string;
  recordedBy?: string;
  visibility: LegacyQuoteVisibility;
  /** Null until consent level is chosen. */
  consentLevel: LegacyQuoteConsentLevel | null;
  consentGranted: boolean;
};

export const RELATIONSHIP_LEGACY_QUOTES_ARCHITECTURE_SEED: LegacyQuoteEntry[] = [
  {
    id: "rlq_seed_1",
    journeyId: "BS-JR-2028-0045",
    body: LEGACY_QUOTE_EXAMPLES[0],
    recordedAt: "2031-06-15T00:00:00.000Z",
    recordedBy: "Ada Okafor",
    visibility: "private",
    consentLevel: null,
    consentGranted: false
  },
  {
    id: "rlq_seed_2",
    journeyId: "BS-JR-2028-0045",
    body: LEGACY_QUOTE_EXAMPLES[1],
    recordedAt: "2032-01-10T00:00:00.000Z",
    visibility: "private",
    consentLevel: "anonymous",
    consentGranted: false
  },
  {
    id: "rlq_seed_3",
    journeyId: "BS-JR-2028-0045",
    body: LEGACY_QUOTE_EXAMPLES[2],
    recordedAt: "2033-04-18T00:00:00.000Z",
    visibility: "private",
    consentLevel: "first-name-only",
    consentGranted: false
  }
];

export const DEFAULT_LEGACY_QUOTE_VISIBILITY: LegacyQuoteVisibility = "private";

export function legacyQuoteConsentLabel(level: LegacyQuoteConsentLevel | null): string {
  if (!level) return "Consent required";
  return LEGACY_QUOTE_CONSENT_LABELS[level];
}
