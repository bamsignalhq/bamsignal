import { LAUNCH_PRIMARY_CITIES } from "./seedCities";
import { STORAGE_KEYS } from "./limits";
import { readJson, writeJson } from "../utils/storage";

/** All cities supported in Discover city header copy */
export const DISCOVER_SUPPORTED_CITIES = [
  ...LAUNCH_PRIMARY_CITIES,
  "Enugu",
  "Owerri",
  "Benin",
  "Ibadan",
  "Uyo",
  "Aba",
  "Asaba",
  "Kaduna",
  "Kano",
  "Jos"
] as const;

export type DiscoverSupportedCity = (typeof DISCOVER_SUPPORTED_CITIES)[number];

export type DiscoverCityConfig = {
  /** When true, activity bar uses launch copy instead of counts */
  launchMode: boolean;
  /** Minimum active profiles in city before showing numeric counts */
  realDataMinActive: number;
  cityHeadlines: Record<string, string>;
  launchActivityMessages: Record<string, string>;
  activityRotator: string[];
  confidenceRotator: string[];
  /** Nearby cities to prioritize after user's city (admin-editable) */
  cityPriorities: Record<string, string[]>;
};

export const DEFAULT_CITY_HEADLINES: Record<string, string> = {
  Lagos: "Meet people who match your vibe.",
  Abuja: "Professionals, entrepreneurs and real connections.",
  "Port Harcourt": "Discover people nearby and start a signal.",
  Enugu: "Meaningful connections closer than you think.",
  Owerri: "Good vibes and real people nearby.",
  Benin: "Discover new signals around you.",
  Ibadan: "Meet people who match your vibe.",
  Uyo: "Discover people nearby and start a signal.",
  Aba: "Good vibes and real people nearby.",
  Asaba: "Meaningful connections closer than you think.",
  Kaduna: "Discover new signals around you.",
  Kano: "Meet people who match your vibe.",
  Jos: "Real people nearby — start a signal."
};

export const DEFAULT_LAUNCH_ACTIVITY: Record<string, string> = {
  Lagos: "New members joining daily",
  Abuja: "Building connections nearby",
  "Port Harcourt": "Discovering new signals",
  Enugu: "Signals growing in your city",
  Owerri: "Real people joining every week",
  Benin: "More connections every day",
  Ibadan: "New members joining daily",
  Uyo: "Discovering new signals",
  Aba: "Real people joining every week",
  Asaba: "Signals growing in your city",
  Kaduna: "Building connections nearby",
  Kano: "More connections every day",
  Jos: "New members joining daily"
};

export const DEFAULT_ACTIVITY_ROTATOR = [
  "New members joined today",
  "Signals sent recently",
  "New connections forming",
  "Active profiles nearby",
  "Verified members available"
];

export const DEFAULT_CONFIDENCE_ROTATOR = [
  "Real people nearby",
  "Verified profiles available",
  "Active signals in your area",
  "New members joining"
];

/** Default city priority — user's city first, then nearby per launch focus */
export const DEFAULT_CITY_PRIORITIES: Record<string, string[]> = {
  Lagos: ["Lagos", "Ibadan", "Benin", "Abuja", "Port Harcourt"],
  Abuja: ["Abuja", "Kaduna", "Jos", "Lagos", "Enugu"],
  "Port Harcourt": ["Port Harcourt", "Uyo", "Aba", "Owerri", "Lagos"]
};

export const DEFAULT_DISCOVER_CITY_CONFIG: DiscoverCityConfig = {
  launchMode: true,
  realDataMinActive: 5,
  cityHeadlines: { ...DEFAULT_CITY_HEADLINES },
  launchActivityMessages: { ...DEFAULT_LAUNCH_ACTIVITY },
  activityRotator: [...DEFAULT_ACTIVITY_ROTATOR],
  confidenceRotator: [...DEFAULT_CONFIDENCE_ROTATOR],
  cityPriorities: { ...DEFAULT_CITY_PRIORITIES }
};

export function getDiscoverCityConfig(): DiscoverCityConfig {
  const stored = readJson<Partial<DiscoverCityConfig>>(STORAGE_KEYS.discoverCityConfig, {});
  return {
    ...DEFAULT_DISCOVER_CITY_CONFIG,
    ...stored,
    cityHeadlines: { ...DEFAULT_CITY_HEADLINES, ...stored.cityHeadlines },
    launchActivityMessages: { ...DEFAULT_LAUNCH_ACTIVITY, ...stored.launchActivityMessages },
    activityRotator: stored.activityRotator?.length
      ? stored.activityRotator
      : DEFAULT_ACTIVITY_ROTATOR,
    confidenceRotator: stored.confidenceRotator?.length
      ? stored.confidenceRotator
      : DEFAULT_CONFIDENCE_ROTATOR,
    cityPriorities: { ...DEFAULT_CITY_PRIORITIES, ...stored.cityPriorities }
  };
}

export function saveDiscoverCityConfig(patch: Partial<DiscoverCityConfig>): void {
  writeJson(STORAGE_KEYS.discoverCityConfig, { ...getDiscoverCityConfig(), ...patch });
}

export function cityHeadline(city: string, config = getDiscoverCityConfig()): string {
  return (
    config.cityHeadlines[city] ??
    DEFAULT_CITY_HEADLINES[city] ??
    "Meet people who match your vibe."
  );
}

export function launchActivityMessage(city: string, config = getDiscoverCityConfig()): string {
  return (
    config.launchActivityMessages[city] ??
    DEFAULT_LAUNCH_ACTIVITY[city] ??
    "Active signals nearby"
  );
}
