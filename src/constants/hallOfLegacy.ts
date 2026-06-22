/** Hall of Legacy™ — honor extraordinary journeys architecture. */

import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const HALL_OF_LEGACY_TITLE = "Hall of Legacy™";
export const HALL_OF_LEGACY_LABEL = "Hall of Legacy";
export const CELEBRATING_LOVE_LABEL = "Celebrating Love";
export const LEGACY_COUPLES_LABEL = "Legacy Couples";

export const HALL_OF_LEGACY_SUBCOPY =
  "Honoring extraordinary journeys — private by default, consent required.";
export const HALL_OF_LEGACY_PURPOSE_COPY =
  "Honor extraordinary journeys — celebrating love and legacy couples, never leaderboards or top members.";
export const HALL_OF_LEGACY_RESERVED_COPY =
  "Architecture prepared. Documentaries, books, and events are not enabled yet.";
export const HALL_OF_LEGACY_PRIVACY_COPY =
  "Private by default. Consent required before any journey is shared.";
export const HALL_OF_LEGACY_CONSENT_COPY = "Consent required — no public listing without approval.";

/** Reserved — never use in member-facing copy. */
export const HALL_OF_LEGACY_AVOID_COPY = ["Leaderboard", "Top Members"] as const;

export { UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreservedLegacyCategoryId =
  | "founders-couples"
  | "legacy-families"
  | "golden-anniversaries"
  | "diaspora-stories"
  | "twenty-five-year-marriages";

export type PreservedLegacyCategoryDefinition = {
  id: PreservedLegacyCategoryId;
  label: string;
  description: string;
};

export const PRESERVED_LEGACY_CATEGORIES: PreservedLegacyCategoryDefinition[] = [
  {
    id: "founders-couples",
    label: "Founders couples",
    description: "Founders couples honored — private by default, consent first."
  },
  {
    id: "legacy-families",
    label: "Legacy families",
    description: "Legacy families preserved — dignity and consent required."
  },
  {
    id: "golden-anniversaries",
    label: "Golden anniversaries",
    description: "Golden anniversaries celebrated — never ranked or scored."
  },
  {
    id: "diaspora-stories",
    label: "Diaspora stories",
    description: "Diaspora journeys honored — Journey Across Borders with care."
  },
  {
    id: "twenty-five-year-marriages",
    label: "25-year marriages",
    description: "25-year marriages recognized — consent-based, private by default."
  }
];

export type LegacyJourneyKind =
  | "legacy-couple"
  | "golden-anniversary"
  | "founders-couple"
  | "diaspora-story";

export type PreparedLegacyJourneyDefinition = {
  id: string;
  title: string;
  summary: string;
  kind: LegacyJourneyKind;
  categoryId: PreservedLegacyCategoryId;
  privateByDefault: true;
  consentRequired: true;
};

export const PREPARED_LEGACY_JOURNEYS: PreparedLegacyJourneyDefinition[] = [
  {
    id: "hol_founders_couple",
    title: "Reserved founders couple",
    summary: "Founders couple journey — private by default, consent required.",
    kind: "founders-couple",
    categoryId: "founders-couples",
    privateByDefault: true,
    consentRequired: true
  },
  {
    id: "hol_legacy_family",
    title: "Reserved legacy family",
    summary: "Legacy family journey — honoring love, never a leaderboard.",
    kind: "legacy-couple",
    categoryId: "legacy-families",
    privateByDefault: true,
    consentRequired: true
  },
  {
    id: "hol_golden_anniversary",
    title: "Reserved golden anniversary",
    summary: "Golden anniversary — celebrating love with consent first.",
    kind: "golden-anniversary",
    categoryId: "golden-anniversaries",
    privateByDefault: true,
    consentRequired: true
  },
  {
    id: "hol_twenty_five_year",
    title: "Reserved 25-year marriage",
    summary: "25-year marriage honored — private by default.",
    kind: "golden-anniversary",
    categoryId: "twenty-five-year-marriages",
    privateByDefault: true,
    consentRequired: true
  },
  {
    id: "hol_diaspora_story",
    title: "Reserved diaspora story",
    summary: "Diaspora story — consent required before sharing.",
    kind: "diaspora-story",
    categoryId: "diaspora-stories",
    privateByDefault: true,
    consentRequired: true
  }
];

export type HallOfLegacyFutureCapabilityId = "documentaries" | "books" | "events";

export const HALL_OF_LEGACY_FUTURE_CAPABILITIES: {
  id: HallOfLegacyFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "documentaries",
    label: "Documentaries",
    description: "Reserved — documentaries with consent and dignity."
  },
  {
    id: "books",
    label: "Books",
    description: "Reserved — books celebrating legacy couples."
  },
  {
    id: "events",
    label: "Events",
    description: "Reserved — legacy events — never top-member rankings."
  }
];

export function getPreservedLegacyCategory(
  categoryId: PreservedLegacyCategoryId
): PreservedLegacyCategoryDefinition | undefined {
  return PRESERVED_LEGACY_CATEGORIES.find((category) => category.id === categoryId);
}
