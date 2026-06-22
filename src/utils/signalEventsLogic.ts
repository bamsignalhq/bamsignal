import type { GlobalCityDefinition, GlobalCityRegionId } from "../constants/globalCityNetwork";
import {
  GLOBAL_CITY_REGION_LABELS,
  globalCityCommunityStatusLabel
} from "../constants/globalCityNetwork";
import type { SignalEventArchitectureEntry } from "../constants/signalEvents";
import { signalEventTypeLabel } from "../constants/signalEvents";

export type SignalEventViewModel = SignalEventArchitectureEntry & {
  cityName: string;
  eventTypeLabel: string;
  regionLabel: string;
};

export type CityCommunityViewModel = GlobalCityDefinition & {
  regionLabel: string;
  statusLabel: string;
  upcomingCount: number;
};

export function buildCityCommunityViewModel(
  city: GlobalCityDefinition,
  upcomingCount = 0
): CityCommunityViewModel {
  return {
    ...city,
    regionLabel: GLOBAL_CITY_REGION_LABELS[city.regionId],
    statusLabel: globalCityCommunityStatusLabel(city.status),
    upcomingCount
  };
}

export function buildSignalEventViewModel(
  event: SignalEventArchitectureEntry,
  city: GlobalCityDefinition
): SignalEventViewModel {
  return {
    ...event,
    cityName: city.name,
    eventTypeLabel: signalEventTypeLabel(event.eventTypeId),
    regionLabel: GLOBAL_CITY_REGION_LABELS[city.regionId]
  };
}

export function groupCitiesByRegion(
  cities: CityCommunityViewModel[]
): Record<GlobalCityRegionId, CityCommunityViewModel[]> {
  const grouped = {} as Record<GlobalCityRegionId, CityCommunityViewModel[]>;
  for (const city of cities) {
    if (!grouped[city.regionId]) grouped[city.regionId] = [];
    grouped[city.regionId].push(city);
  }
  return grouped;
}

export function sortEventsByDate(events: SignalEventViewModel[]): SignalEventViewModel[] {
  return [...events].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
}
