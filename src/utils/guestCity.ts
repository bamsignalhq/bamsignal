import { CITIES_VISUAL } from "../data/visualLanding";
import { STORAGE_KEYS } from "../constants/limits";
import { getDatingProfile } from "./profile";
import { readJson, writeJson } from "./storage";

const CITY_NAMES = CITIES_VISUAL.map((city) => city.name);

export function normalizeCityName(value = ""): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = CITY_NAMES.find((city) => city.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

export function readSpotlightCity(): string {
  return normalizeCityName(readJson<string>(STORAGE_KEYS.spotlightCity, ""));
}

export function saveSpotlightCity(city: string): void {
  const normalized = normalizeCityName(city);
  if (!normalized) return;
  writeJson(STORAGE_KEYS.spotlightCity, normalized);
}

/** Prefer profile city, then spotlight picker — no hardcoded default. */
export function resolveGuestCity(): string {
  const profileCity = normalizeCityName(getDatingProfile().city || "");
  if (profileCity) return profileCity;

  const stored = readSpotlightCity();
  if (stored) return stored;

  return "";
}

export function cityVisualId(cityName: string): string {
  const normalized = normalizeCityName(cityName);
  const match = CITIES_VISUAL.find((city) => city.name.toLowerCase() === normalized.toLowerCase());
  return match?.id ?? CITIES_VISUAL[0]?.id ?? "enugu";
}
