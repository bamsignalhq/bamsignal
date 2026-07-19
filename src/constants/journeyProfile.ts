export type JourneyProfileScreenId = "j10-photo" | "j11-about" | "j12-interests" | "j13-ready";

export const JOURNEY_PROFILE_SCREENS: JourneyProfileScreenId[] = [
  "j10-photo",
  "j11-about",
  "j12-interests",
  "j13-ready"
];

export const JOURNEY_PROFILE_STRENGTH: Record<
  JourneyProfileScreenId,
  { fill: number; label: string; hint: string; chapter: "profile" | "ready" }
> = {
  "j10-photo": {
    fill: 90,
    label: "Making a great first impression",
    hint: "Clear, welcoming photos help people say hello.",
    chapter: "profile"
  },
  "j11-about": {
    fill: 94,
    label: "Helping conversations start",
    hint: "A little honesty attracts the right people.",
    chapter: "profile"
  },
  "j12-interests": {
    fill: 97,
    label: "Finding common ground",
    hint: "Optional — add what feels like you.",
    chapter: "profile"
  },
  "j13-ready": {
    fill: 100,
    label: "Ready to connect",
    hint: "Welcome to BamSignal.",
    chapter: "ready"
  }
};

export const JOURNEY_PROFILE_TRUST: Partial<Record<JourneyProfileScreenId, string>> = {
  "j10-photo": "Real people. Clear photos help replies.",
  "j11-about": "Be honest — it attracts the right people.",
  "j12-interests": "Optional — add what feels like you.",
  "j13-ready": "You're ready for meaningful connections."
};

export const JOURNEY_PROFILE_GUIDE: Partial<Record<JourneyProfileScreenId, string>> = {
  "j13-ready": "Welcome."
};

/** Soft conversation-starter prompts — never auto-fill the bio. */
export const JOURNEY_BIO_PROMPTS = [
  "What makes a great weekend for you?",
  "What are you looking forward to this year?",
  "What should someone ask you about first?"
] as const;

/** Curated interest chips — lightweight, not a long checklist. */
export const JOURNEY_INTEREST_PICKS = [
  "music",
  "movies",
  "foodLover",
  "travel",
  "fitness",
  "faith",
  "reading",
  "comedy",
  "football",
  "coffee",
  "adventure",
  "familyOriented",
  "entrepreneur",
  "photography",
  "beachTrips",
  "cooking"
] as const;

export function prevProfileScreen(current: JourneyProfileScreenId): JourneyProfileScreenId | null {
  const index = JOURNEY_PROFILE_SCREENS.indexOf(current);
  if (index <= 0) return null;
  return JOURNEY_PROFILE_SCREENS[index - 1] ?? null;
}
