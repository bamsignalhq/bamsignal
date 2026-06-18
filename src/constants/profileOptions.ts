import type { Religion } from "../types";
import {
  ALL_NIGERIAN_CITIES,
  NIGERIAN_STATES,
  citiesForState,
  metroForCity,
  searchCitiesInState,
  stateForCity
} from "../data/nigeriaLocations";

export { NIGERIAN_STATES, citiesForState, stateForCity, ALL_NIGERIAN_CITIES, searchCitiesInState, metroForCity };

/** @deprecated Use ALL_NIGERIAN_CITIES or citiesForState */
export const NIGERIAN_CITIES = ALL_NIGERIAN_CITIES;

export const RELIGIONS: Religion[] = [
  "Christian",
  "Muslim",
  "Traditional",
  "Other",
  "Prefer not to say"
];

export const ETHNIC_BACKGROUNDS = [
  "Igbo",
  "Yoruba",
  "Hausa",
  "Fulani",
  "Kanuri",
  "Ijaw",
  "Edo",
  "Tiv",
  "Nupe",
  "Igala",
  "Ibibio",
  "Efik",
  "Urhobo",
  "Isoko",
  "Itsekiri",
  "Idoma",
  "Ebira",
  "Esan",
  "Angas",
  "Berom",
  "Gbagyi",
  "Jukun",
  "Ogoni",
  "Tarok",
  "Bachama",
  "Egun",
  "Ekoi",
  "Gwari",
  "Igede",
  "Ikwerre",
  "Kataf",
  "Mumuye",
  "Ron",
  "Ukwuani",
  "Bura",
  "Chokwe",
  "Kalabari",
  "Kambari",
  "Koro",
  "Kuteb",
  "Mada",
  "Margi",
  "Hausa-Fulani",
  "Ndola",
  "Ogori",
  "Okun",
  "Other",
  "Prefer not to say"
] as const;

export type EthnicBackground = (typeof ETHNIC_BACKGROUNDS)[number];

export const SOCIAL_LIFESTYLES = [
  "Quiet life",
  "Family oriented",
  "Career focused",
  "Faith centered",
  "Adventurous",
  "Fitness conscious",
  "Social",
  "Travel lover",
  "Food lover",
  "Prefer not to say"
] as const;

export type SocialLifestyle = (typeof SOCIAL_LIFESTYLES)[number];

export { INTEREST_OPTIONS, ALL_CATEGORIZED_INTERESTS, MIN_PROFILE_INTERESTS, MAX_PROFILE_INTERESTS } from "./interestCategories";

export const OCCUPATIONS = [
  "Healthcare",
  "Education",
  "Business",
  "Tech",
  "Engineering",
  "Finance",
  "Government",
  "Law",
  "Media",
  "Creative",
  "Student",
  "Entrepreneur",
  "Other",
  "Prefer not to say"
] as const;

export type Occupation = (typeof OCCUPATIONS)[number];

export const GENOTYPES = ["AA", "AS", "SS", "AC", "SC", "CC", "Prefer not to say"] as const;

export type Genotype = (typeof GENOTYPES)[number];

export const KIDS_PREFERENCES = [
  "Has kids",
  "No kids",
  "Wants kids",
  "Doesn't want kids",
  "Open to kids",
  "Prefer not to say"
] as const;

export type KidsPreference = (typeof KIDS_PREFERENCES)[number];

export const BODY_TYPES = [
  "Slim",
  "Average",
  "Athletic",
  "Curvy",
  "Plus-size",
  "Thick",
  "Petite",
  "Prefer not to say"
] as const;

export type BodyType = (typeof BODY_TYPES)[number];

export const RELATIONSHIP_INTENTIONS = [
  "Friendship",
  "Dating",
  "Serious relationship",
  "Marriage",
  "Networking",
  "Open to anything"
] as const;

export type RelationshipIntention = (typeof RELATIONSHIP_INTENTIONS)[number];

export const VERIFICATION_PREFERENCES = [
  "Anyone",
  "Phone verified",
  "Selfie verified",
  "Premium verified",
  "Fully verified",
  "No preference"
] as const;

export type VerificationPreference = (typeof VERIFICATION_PREFERENCES)[number];

export const HAS_KIDS_OPTIONS = ["Has kids", "No kids"] as const;
export const WANTS_KIDS_OPTIONS = ["Wants kids", "Doesn't want kids", "Open to kids"] as const;

export type HasKidsOption = (typeof HAS_KIDS_OPTIONS)[number];
export type WantsKidsOption = (typeof WANTS_KIDS_OPTIONS)[number];

/** Optional filter picklists — same values, excluding "Prefer not to say" for filters */
export const FILTER_RELIGIONS = RELIGIONS.filter((r) => r !== "Prefer not to say");
export const FILTER_ETHNICITIES = ETHNIC_BACKGROUNDS.filter((e) => e !== "Prefer not to say");
export const FILTER_LIFESTYLES = SOCIAL_LIFESTYLES.filter((l) => l !== "Prefer not to say");

export const MAX_LIFESTYLE_TRAITS = 3;
export const LIFESTYLE_TRAITS_LIMIT_MESSAGE = "Choose up to 3 lifestyle traits.";

/** Dedupe lifestyle traits and cap at MAX_LIFESTYLE_TRAITS. */
export function normalizeLifestyleTraits(values: unknown): SocialLifestyle[] {
  const allowed = new Set<SocialLifestyle>(FILTER_LIFESTYLES);
  const seen = new Set<SocialLifestyle>();
  const out: SocialLifestyle[] = [];
  const list = Array.isArray(values) ? values : [];
  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const value = raw as SocialLifestyle;
    if (!allowed.has(value) || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= MAX_LIFESTYLE_TRAITS) break;
  }
  return out;
}
export const FILTER_OCCUPATIONS = OCCUPATIONS.filter((o) => o !== "Prefer not to say");
export const FILTER_GENOTYPES = GENOTYPES.filter((g) => g !== "Prefer not to say");
export const FILTER_KIDS_PREFERENCES = KIDS_PREFERENCES.filter((k) => k !== "Prefer not to say");
export const FILTER_BODY_TYPES = BODY_TYPES.filter((b) => b !== "Prefer not to say");
export const FILTER_VERIFICATION_PREFERENCES = VERIFICATION_PREFERENCES.filter(
  (v) => v !== "No preference" && v !== "Anyone"
);

export function stateDisplayLabel(state: string): string {
  return state === "FCT" ? "Abuja" : state;
}

/** Map relationship-intention filters to profile intent tags for search */
export function relationshipIntentionsToSearchIntents(
  intentions: RelationshipIntention[]
): string[] {
  const map: Record<RelationshipIntention, string[]> = {
    Friendship: ["Friendship"],
    Dating: ["Relationship", "Chat"],
    "Serious relationship": ["Relationship"],
    Marriage: ["Relationship"],
    Networking: ["Networking"],
    "Open to anything": []
  };
  const out = new Set<string>();
  for (const intent of intentions) {
    if (intent === "Open to anything") continue;
    for (const tag of map[intent] ?? []) out.add(tag);
  }
  return [...out];
}
