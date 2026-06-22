import type { AmbassadorJourneyStep } from "../constants/cityAmbassadors";
import {
  listArchitectureCityAmbassadors,
  type CityAmbassadorViewModel
} from "./cityAmbassadorsLogic";

export type CityAmbassadorsBundle = {
  ambassadors: CityAmbassadorViewModel[];
  journeysBySlug: Record<string, AmbassadorJourneyStep[]>;
};

export function getCityAmbassadorsBundle(): CityAmbassadorsBundle {
  const ambassadors = listArchitectureCityAmbassadors();
  const journeysBySlug = Object.fromEntries(
    ambassadors.map((ambassador) => [ambassador.slug, ambassador.journey])
  );
  return { ambassadors, journeysBySlug };
}

export function getCityAmbassador(slug: string): CityAmbassadorViewModel | null {
  return listArchitectureCityAmbassadors().find((ambassador) => ambassador.slug === slug) ?? null;
}
