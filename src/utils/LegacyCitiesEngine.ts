import type { LegacyCityTimelineEntry } from "../constants/legacyCities";
import { listArchitectureLegacyCities, type LegacyCityViewModel } from "./legacyCitiesLogic";

export type LegacyCitiesBundle = {
  cities: LegacyCityViewModel[];
  timelinesByCitySlug: Record<string, LegacyCityTimelineEntry[]>;
};

export function getLegacyCitiesBundle(): LegacyCitiesBundle {
  const cities = listArchitectureLegacyCities();
  const timelinesByCitySlug = Object.fromEntries(
    cities.map((city) => [city.slug, city.timeline])
  );
  return { cities, timelinesByCitySlug };
}

export function getLegacyCity(slug: string): LegacyCityViewModel | null {
  return listArchitectureLegacyCities().find((city) => city.slug === slug) ?? null;
}
