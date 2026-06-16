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

export const INTEREST_OPTIONS = [
  "Afrobeats",
  "Nollywood",
  "Football",
  "EPL banter",
  "Suya & chill",
  "Owambe",
  "Detty December",
  "Jollof debates",
  "Amala & ewedu",
  "Pepper soup",
  "Live comedy",
  "Rooftop hangouts",
  "Lagos brunch",
  "Island life",
  "Beach days",
  "Road trips",
  "Street food tours",
  "Ankara fashion",
  "Sneaker culture",
  "Car meets",
  "PS5 nights",
  "Afro dance",
  "Church community",
  "Mosque hangouts",
  "Music",
  "Movies",
  "Travel",
  "Fitness",
  "Business",
  "Photography",
  "Reading",
  "Gaming",
  "Arts",
  "Networking",
  "Comedy",
  "Asake & Burna",
  "Wizkid & Davido",
  "Gospel music",
  "Hip-hop",
  "Highlife",
  "Palm wine",
  "Zobo & small chops",
  "Mama put runs",
  "Buka hopping",
  "Danfo stories",
  "Okada vibes",
  "Island hopping",
  "Mainland explorer",
  "NYSC stories",
  "Tech bro / sis",
  "Side hustle culture",
  "Aso ebi season",
  "Traditional wedding",
  "White wedding",
  "Detty December plans",
  "CrossFit Naija",
  "Padel & tennis",
  "Swimming",
  "Hiking & nature",
  "Board games",
  "Podcasts",
  "Crypto & forex",
  "Real estate talk",
  "Politics banter",
  "Church choir",
  "Mosque community",
  "Volunteering",
  "Pet lover",
  "Cooking",
  "Dancing",
  "Fashion",
  "Skincare",
  "Content creation"
] as const;

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
