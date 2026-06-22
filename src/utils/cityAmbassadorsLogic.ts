import type {
  AmbassadorJourneyStep,
  PreparedCityAmbassadorDefinition,
  PreparedCityAmbassadorSlug
} from "../constants/cityAmbassadors";
import {
  CITY_AMBASSADOR_ROLES,
  PREPARED_CITY_AMBASSADORS,
  cityAmbassadorRoleLabel
} from "../constants/cityAmbassadors";
import type { GlobalCityDefinition } from "../constants/globalCityNetwork";
import { GLOBAL_CITY_REGION_LABELS, getGlobalCity } from "../constants/globalCityNetwork";

export type CityAmbassadorDisplayRow = {
  id: "city" | "region" | "role" | "stewardship" | "status";
  label: string;
  value?: string;
};

export type CityAmbassadorViewModel = {
  slug: PreparedCityAmbassadorSlug;
  title: string;
  cityName: string;
  regionLabel: string;
  diaspora: boolean;
  primaryRole: PreparedCityAmbassadorDefinition["primaryRole"];
  roleLabel: string;
  description: string;
  displayRows: CityAmbassadorDisplayRow[];
  journey: AmbassadorJourneyStep[];
};

const DISPLAY_ROWS: { id: CityAmbassadorDisplayRow["id"]; label: string }[] = [
  { id: "city", label: "City" },
  { id: "region", label: "Region" },
  { id: "role", label: "Primary role" },
  { id: "stewardship", label: "Stewardship" },
  { id: "status", label: "Status" }
];

function buildJourney(
  ambassador: PreparedCityAmbassadorDefinition,
  networkCity: GlobalCityDefinition
): AmbassadorJourneyStep[] {
  const base = new Date("2026-02-01T00:00:00.000Z").getTime();
  const steps = [
    { label: "Ambassador pathway prepared", note: "Architecture only — not enabled yet." },
    {
      label: "Stewardship role defined",
      note: cityAmbassadorRoleLabel(ambassador.primaryRole)
    },
    {
      label: "Community identity linked",
      note: networkCity.diaspora ? "Diaspora ambassador." : "Home city steward."
    },
    { label: "Legacy advocacy reserved", note: "Consent-first — never a salesperson." }
  ];
  return steps.map((step, index) => ({
    id: `ca_journey_${ambassador.slug}_${index}`,
    ambassadorSlug: ambassador.slug,
    label: step.label,
    recordedAt: new Date(base + index * 30 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildCityAmbassadorViewModel(
  ambassador: PreparedCityAmbassadorDefinition
): CityAmbassadorViewModel | null {
  const networkCity = getGlobalCity(ambassador.slug);
  if (!networkCity) return null;

  const regionLabel = GLOBAL_CITY_REGION_LABELS[networkCity.regionId];
  const roleLabel = cityAmbassadorRoleLabel(ambassador.primaryRole);

  const values: Record<CityAmbassadorDisplayRow["id"], string> = {
    city: networkCity.name,
    region: regionLabel,
    role: roleLabel,
    stewardship: "Prepared — community stewardship architecture",
    status: "Reserved — not enabled yet"
  };

  return {
    slug: ambassador.slug,
    title: ambassador.title,
    cityName: networkCity.name,
    regionLabel,
    diaspora: networkCity.diaspora,
    primaryRole: ambassador.primaryRole,
    roleLabel,
    description: ambassador.description,
    displayRows: DISPLAY_ROWS.map((row) => ({
      id: row.id,
      label: row.label,
      value: values[row.id]
    })),
    journey: buildJourney(ambassador, networkCity)
  };
}

export function sortCityAmbassadorsForDisplay(
  ambassadors: CityAmbassadorViewModel[]
): CityAmbassadorViewModel[] {
  return [...ambassadors].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureCityAmbassadors(): CityAmbassadorViewModel[] {
  return sortCityAmbassadorsForDisplay(
    PREPARED_CITY_AMBASSADORS.map(buildCityAmbassadorViewModel).filter(
      (ambassador): ambassador is CityAmbassadorViewModel => Boolean(ambassador)
    )
  );
}

export function listAmbassadorRoles() {
  return CITY_AMBASSADOR_ROLES;
}
