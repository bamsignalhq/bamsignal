import {
  GLOBAL_CITY_NETWORK,
  getGlobalCity,
  listDiasporaCities,
  listFeaturedCities,
  GLOBAL_CITY_REGIONS
} from "../constants/globalCityNetwork";
import { SIGNAL_EVENTS_ARCHITECTURE_SEED } from "../data/signalEventsSeed";
import {
  buildCityCommunityViewModel,
  buildSignalEventViewModel,
  groupCitiesByRegion,
  sortEventsByDate,
  type CityCommunityViewModel,
  type SignalEventViewModel
} from "./signalEventsLogic";

export type SignalEventsHubBundle = {
  featuredCities: CityCommunityViewModel[];
  upcomingEvents: SignalEventViewModel[];
  citiesByRegion: ReturnType<typeof groupCitiesByRegion>;
};

export type SignalEventsCityBundle = {
  city: CityCommunityViewModel;
  upcomingEvents: SignalEventViewModel[];
};

function countUpcomingForCity(citySlug: string): number {
  return SIGNAL_EVENTS_ARCHITECTURE_SEED.filter((event) => event.citySlug === citySlug).length;
}

function buildEventsForCity(citySlug: string): SignalEventViewModel[] {
  const city = getGlobalCity(citySlug);
  if (!city) return [];
  return sortEventsByDate(
    SIGNAL_EVENTS_ARCHITECTURE_SEED.filter((event) => event.citySlug === citySlug).map((event) =>
      buildSignalEventViewModel(event, city)
    )
  );
}

export function getSignalEventsHubBundle(): SignalEventsHubBundle {
  const allCities = GLOBAL_CITY_NETWORK.map((city) =>
    buildCityCommunityViewModel(city, countUpcomingForCity(city.slug))
  );

  return {
    featuredCities: listFeaturedCities().map((city) =>
      buildCityCommunityViewModel(city, countUpcomingForCity(city.slug))
    ),
    upcomingEvents: sortEventsByDate(
      SIGNAL_EVENTS_ARCHITECTURE_SEED.map((event) => {
        const city = getGlobalCity(event.citySlug);
        if (!city) throw new Error(`Unknown city slug in event seed: ${event.citySlug}`);
        return buildSignalEventViewModel(event, city);
      })
    ),
    citiesByRegion: groupCitiesByRegion(allCities)
  };
}

export function getSignalEventsCityBundle(citySlug: string): SignalEventsCityBundle | null {
  const cityDef = getGlobalCity(citySlug);
  if (!cityDef) return null;
  return {
    city: buildCityCommunityViewModel(cityDef, countUpcomingForCity(citySlug)),
    upcomingEvents: buildEventsForCity(citySlug)
  };
}

export function getDiasporaCommunitiesBundle(): CityCommunityViewModel[] {
  return listDiasporaCities()
    .map((city) => buildCityCommunityViewModel(city, countUpcomingForCity(city.slug)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listGlobalCityRegions() {
  return GLOBAL_CITY_REGIONS;
}
