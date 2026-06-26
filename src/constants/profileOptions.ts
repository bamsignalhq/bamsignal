import type { Religion } from "../types/profileReligion";
import {
  ALL_NIGERIAN_CITIES,
  NIGERIAN_STATES,
  citiesForState,
  cityBelongsToState,
  metroForCity,
  resolveStateName,
  searchCitiesInState,
  stateForCity
} from "../data/nigeriaLocations";

export { NIGERIAN_STATES, citiesForState, stateForCity, resolveStateName, cityBelongsToState, ALL_NIGERIAN_CITIES, searchCitiesInState, metroForCity };

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

export const MAX_RELATIONSHIP_INTENTION_SELECTIONS = 3;

export const RELATIONSHIP_INTENTION_LIMIT_MESSAGE = "You can select up to 3 intentions.";

export function normalizeRelationshipIntentions(raw: unknown): RelationshipIntention[] {
  const valid = new Set<RelationshipIntention>(RELATIONSHIP_INTENTIONS);
  const out: RelationshipIntention[] = [];
  const list = Array.isArray(raw) ? raw : [];
  for (const item of list) {
    const value = String(item || "").trim() as RelationshipIntention;
    if (!valid.has(value) || out.includes(value)) continue;
    out.push(value);
    if (out.length >= MAX_RELATIONSHIP_INTENTION_SELECTIONS) break;
  }
  return out;
}

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
export const FAITH_OPTIONS = ["Christian", "Muslim", "Traditional", "Other"] as const satisfies readonly Religion[];

export const FILTER_RELIGIONS = FAITH_OPTIONS;
export const FILTER_ETHNICITIES = ETHNIC_BACKGROUNDS.filter((e) => e !== "Prefer not to say");
export const FILTER_LIFESTYLES = SOCIAL_LIFESTYLES.filter((l) => l !== "Prefer not to say");
export const FILTER_OCCUPATIONS = OCCUPATIONS.filter((o) => o !== "Prefer not to say");
export const FILTER_GENOTYPES = GENOTYPES.filter((g) => g !== "Prefer not to say");
export const FILTER_KIDS_PREFERENCES = KIDS_PREFERENCES.filter((k) => k !== "Prefer not to say");
export const FILTER_BODY_TYPES = BODY_TYPES.filter((b) => b !== "Prefer not to say");
export const FILTER_VERIFICATION_PREFERENCES = VERIFICATION_PREFERENCES.filter(
  (v) => v !== "No preference" && v !== "Anyone"
);

export const MAX_LIFESTYLE_TRAITS = 3;
export const LIFESTYLE_TRAITS_LIMIT_MESSAGE = "Choose up to 3 lifestyle traits.";

export const MAX_OPTIONAL_PREFERENCE_SELECTIONS = 3;
export const OPTIONAL_PREFERENCE_LIMIT_MESSAGE = "You can select up to 3 options.";

export const MAX_TRIBE_SELECTIONS = MAX_OPTIONAL_PREFERENCE_SELECTIONS;
export const TRIBE_SELECTION_LIMIT_MESSAGE = OPTIONAL_PREFERENCE_LIMIT_MESSAGE;

export type TapSelectGroup<T extends string = EthnicBackground> = {
  title: string;
  options: readonly T[];
};

export const TRIBE_GROUP_SECTIONS: TapSelectGroup[] = [
  {
    title: "Major groups",
    options: ["Igbo", "Yoruba", "Hausa", "Fulani", "Hausa-Fulani", "Ijaw", "Edo"]
  },
  {
    title: "South South",
    options: ["Ibibio", "Efik", "Urhobo", "Isoko", "Itsekiri", "Ogoni", "Kalabari"]
  },
  {
    title: "Middle Belt",
    options: [
      "Tiv",
      "Idoma",
      "Ebira",
      "Nupe",
      "Gwari",
      "Berom",
      "Jukun",
      "Tarok",
      "Bachama",
      "Kataf",
      "Koro",
      "Kuteb"
    ]
  },
  {
    title: "North",
    options: ["Kanuri", "Angas", "Gbagyi", "Mumuye", "Ron", "Bura", "Kambari", "Margi"]
  },
  {
    title: "Others",
    options: [
      "Igala",
      "Egun",
      "Ekoi",
      "Igede",
      "Ikwerre",
      "Chokwe",
      "Mada",
      "Ndola",
      "Ogori",
      "Okun",
      "Ukwuani",
      "Other"
    ]
  }
];

export const FILTER_TRIBE_OPTIONS = TRIBE_GROUP_SECTIONS.flatMap((group) => group.options);

const FAITH_OPTION_SET = new Set<Religion>(FAITH_OPTIONS);
const TRIBE_OPTION_SET = new Set<EthnicBackground>(FILTER_ETHNICITIES);

/** Profile / filter faith — single value; legacy arrays use first entry only. */
export function normalizeFaith(value: unknown): Religion | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw === "Prefer not to say") return undefined;
  return FAITH_OPTION_SET.has(raw as Religion) ? (raw as Religion) : undefined;
}

/** Match / search faith filters — at most one religion. */
export function normalizeFaithList(values: unknown): Religion[] {
  const faith = normalizeFaith(values);
  return faith ? [faith] : [];
}

/** Profile / filter tribes — dedupe and cap at MAX_TRIBE_SELECTIONS. */
export function normalizeEthnicities(values: unknown, legacySingle?: unknown): EthnicBackground[] {
  const seen = new Set<EthnicBackground>();
  const out: EthnicBackground[] = [];
  const list = Array.isArray(values) ? values : values != null ? [values] : [];
  const sources =
    list.length > 0 ? list : legacySingle != null && legacySingle !== "" ? [legacySingle] : [];

  for (const raw of sources) {
    if (typeof raw !== "string" || raw === "Prefer not to say") continue;
    const value = raw as EthnicBackground;
    if (!TRIBE_OPTION_SET.has(value) || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= MAX_TRIBE_SELECTIONS) break;
  }
  return out;
}

function normalizeOptionalPreferenceList<T extends string>(
  values: unknown,
  allowed: ReadonlySet<T>,
  legacySingle?: unknown,
  max = MAX_OPTIONAL_PREFERENCE_SELECTIONS
): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  const list = Array.isArray(values) ? values : values != null ? [values] : [];
  const sources =
    list.length > 0 ? list : legacySingle != null && legacySingle !== "" ? [legacySingle] : [];

  for (const raw of sources) {
    if (typeof raw !== "string" || raw === "Prefer not to say") continue;
    const value = raw as T;
    if (!allowed.has(value) || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= max) break;
  }
  return out;
}

const OCCUPATION_OPTION_SET = new Set<Occupation>(FILTER_OCCUPATIONS);
const GENOTYPE_OPTION_SET = new Set<Genotype>(FILTER_GENOTYPES);
const BODY_TYPE_OPTION_SET = new Set<BodyType>(FILTER_BODY_TYPES);
const HAS_KIDS_OPTION_SET = new Set<HasKidsOption>(HAS_KIDS_OPTIONS);
const WANTS_KIDS_OPTION_SET = new Set<WantsKidsOption>(WANTS_KIDS_OPTIONS);

/** Profile / filter occupations — dedupe and cap at MAX_OPTIONAL_PREFERENCE_SELECTIONS. */
export function normalizeOccupations(values: unknown, legacySingle?: unknown): Occupation[] {
  return normalizeOptionalPreferenceList(values, OCCUPATION_OPTION_SET, legacySingle);
}

/** Profile / filter states of origin — dedupe and cap at MAX_OPTIONAL_PREFERENCE_SELECTIONS. */
export function normalizeStatesOfOrigin(values: unknown, legacySingle?: unknown): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const list = Array.isArray(values) ? values : values != null ? [values] : [];
  const sources =
    list.length > 0 ? list : legacySingle != null && legacySingle !== "" ? [legacySingle] : [];

  for (const raw of sources) {
    const value = String(raw || "").trim();
    if (!value || value === "Prefer not to say" || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= MAX_OPTIONAL_PREFERENCE_SELECTIONS) break;
  }
  return out;
}

/** Profile / filter genotypes — dedupe and cap at MAX_OPTIONAL_PREFERENCE_SELECTIONS. */
export function normalizeGenotypes(values: unknown, legacySingle?: unknown): Genotype[] {
  return normalizeOptionalPreferenceList(values, GENOTYPE_OPTION_SET, legacySingle);
}

/** Profile / filter has-kids answers — dedupe and cap at MAX_OPTIONAL_PREFERENCE_SELECTIONS. */
export function normalizeHasKidsOptions(values: unknown, legacySingle?: unknown): HasKidsOption[] {
  return normalizeOptionalPreferenceList(values, HAS_KIDS_OPTION_SET, legacySingle);
}

/** Profile / filter wants-kids answers — dedupe and cap at MAX_OPTIONAL_PREFERENCE_SELECTIONS. */
export function normalizeWantsKidsOptions(values: unknown, legacySingle?: unknown): WantsKidsOption[] {
  return normalizeOptionalPreferenceList(values, WANTS_KIDS_OPTION_SET, legacySingle);
}

/** Profile / filter body types — dedupe and cap at MAX_OPTIONAL_PREFERENCE_SELECTIONS. */
export function normalizeBodyTypes(values: unknown, legacySingle?: unknown): BodyType[] {
  return normalizeOptionalPreferenceList(values, BODY_TYPE_OPTION_SET, legacySingle);
}

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
