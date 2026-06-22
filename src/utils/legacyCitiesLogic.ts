import type {
  LegacyCityDefinition,
  LegacyCityDisplayId,
  LegacyCityTimelineEntry,
  PreparedLegacyCitySlug
} from "../constants/legacyCities";
import { communityMaturityLevelLabel } from "../constants/legacyCities";
import type { GlobalCityDefinition } from "../constants/globalCityNetwork";
import { GLOBAL_CITY_REGION_LABELS, getGlobalCity } from "../constants/globalCityNetwork";
import { PREPARED_LEGACY_CITIES } from "../constants/legacyCities";

export type LegacyCityDisplayRow = {
  id: LegacyCityDisplayId;
  label: string;
  value?: string;
};

export type LegacyCityViewModel = {
  slug: PreparedLegacyCitySlug;
  title: string;
  cityName: string;
  regionLabel: string;
  diaspora: boolean;
  communityLevel: LegacyCityDefinition["communityLevel"];
  communityLevelLabel: string;
  description: string;
  displayRows: LegacyCityDisplayRow[];
  timeline: LegacyCityTimelineEntry[];
};

const DISPLAY_FIELD_LABELS: Record<LegacyCityDisplayId, string> = {
  region: "Region",
  "community-level": "Community level",
  identity: "Community identity",
  diaspora: "Diaspora",
  ambassadors: "Ambassadors"
};

function buildTimeline(city: LegacyCityDefinition, networkCity: GlobalCityDefinition): LegacyCityTimelineEntry[] {
  const base = new Date("2025-09-01T00:00:00.000Z").getTime();
  const steps = [
    { label: "Legacy city architecture prepared", note: "Long-term community identity reserved." },
    {
      label: "Community level mapped",
      note: communityMaturityLevelLabel(city.communityLevel)
    },
    {
      label: "Community journey recorded",
      note: networkCity.diaspora ? "Diaspora legacy city." : "Home community identity."
    }
  ];
  if (city.communityLevel === "legacy-community" || city.communityLevel === "premium-community") {
    steps.push({ label: "Legacy families pathway reserved", note: "Private by default — consent required." });
  }
  return steps.map((step, index) => ({
    id: `lc_timeline_${city.slug}_${index}`,
    citySlug: city.slug,
    label: step.label,
    recordedAt: new Date(base + index * 45 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildLegacyCityViewModel(city: LegacyCityDefinition): LegacyCityViewModel | null {
  const networkCity = getGlobalCity(city.slug);
  if (!networkCity) return null;

  const regionLabel = GLOBAL_CITY_REGION_LABELS[networkCity.regionId];
  const communityLevelLabel = communityMaturityLevelLabel(city.communityLevel);

  const values: Partial<Record<LegacyCityDisplayId, string>> = {
    region: regionLabel,
    "community-level": communityLevelLabel,
    identity: "Prepared — long-term community identity",
    diaspora: networkCity.diaspora ? "Diaspora legacy city" : "Home legacy city",
    ambassadors: "Reserved — not enabled yet"
  };

  const displayRows: LegacyCityDisplayRow[] = (Object.keys(DISPLAY_FIELD_LABELS) as LegacyCityDisplayId[]).map(
    (id) => ({
      id,
      label: DISPLAY_FIELD_LABELS[id],
      value: values[id]
    })
  );

  return {
    slug: city.slug,
    title: city.title,
    cityName: networkCity.name,
    regionLabel,
    diaspora: networkCity.diaspora,
    communityLevel: city.communityLevel,
    communityLevelLabel,
    description: city.description,
    displayRows,
    timeline: buildTimeline(city, networkCity)
  };
}

export function sortLegacyCitiesForDisplay(cities: LegacyCityViewModel[]): LegacyCityViewModel[] {
  return [...cities].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureLegacyCities(): LegacyCityViewModel[] {
  return sortLegacyCitiesForDisplay(
    PREPARED_LEGACY_CITIES.map(buildLegacyCityViewModel).filter(
      (city): city is LegacyCityViewModel => Boolean(city)
    )
  );
}
