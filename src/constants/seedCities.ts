/** Paid-ads launch cities — density first before expansion */
export const LAUNCH_PRIMARY_CITIES = ["Lagos", "Abuja", "Port Harcourt"] as const;

/** Unlock after primary cities reach density — not promoted in onboarding yet */
export const EXPANSION_CITIES = [
  "Enugu",
  "Owerri",
  "Benin",
  "Ibadan",
  "Uyo",
  "Aba",
  "Asaba"
] as const;

export const SEED_CITIES = [...LAUNCH_PRIMARY_CITIES, ...EXPANSION_CITIES] as const;

export type LaunchPrimaryCity = (typeof LAUNCH_PRIMARY_CITIES)[number];
export type ExpansionCity = (typeof EXPANSION_CITIES)[number];
export type SeedCity = (typeof SEED_CITIES)[number];

/** Tier 1 — closest metros in our city list (Ogun ≈ Lagos corridor via Ibadan) */
const NEARBY_CITIES: Record<string, readonly string[]> = {
  Lagos: ["Ibadan", "Benin"],
  Abuja: ["Ibadan", "Enugu"],
  "Port Harcourt": ["Uyo", "Aba", "Owerri"]
};

/** Tier 2 — regional before distant expansion cities */
const REGIONAL_CITIES: Record<string, readonly string[]> = {
  Lagos: ["Abuja", "Port Harcourt", "Owerri", "Enugu"],
  Abuja: ["Lagos", "Port Harcourt", "Benin", "Owerri"],
  "Port Harcourt": ["Lagos", "Abuja", "Enugu", "Benin"]
};

/** 0 = same city, 1 = nearby, 2 = regional / other primary, 3 = expansion / distant */
export function cityProximityTier(viewerCity: string, candidateCity: string): number {
  if (!viewerCity || !candidateCity) return 3;
  if (viewerCity === candidateCity) return 0;

  const nearby = NEARBY_CITIES[viewerCity] ?? [];
  if (nearby.includes(candidateCity)) return 1;

  const regional = REGIONAL_CITIES[viewerCity] ?? [];
  if (regional.includes(candidateCity)) return 2;

  if ((LAUNCH_PRIMARY_CITIES as readonly string[]).includes(candidateCity)) return 2;

  return 3;
}

export function isLaunchPrimaryCity(city: string): boolean {
  return (LAUNCH_PRIMARY_CITIES as readonly string[]).includes(city);
}
