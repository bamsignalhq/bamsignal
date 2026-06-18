import { NIGERIA_STATE_CITIES } from "./nigeriaStateCities.generated";

export { NIGERIA_STATE_CITIES };

const SORTED_STATES = Object.keys(NIGERIA_STATE_CITIES).sort((a, b) =>
  a.localeCompare(b, "en", { sensitivity: "base" })
);

/** Abia first (home state), then remaining states A–Z */
export const NIGERIAN_STATES = [
  "Abia",
  ...SORTED_STATES.filter((s) => s !== "Abia")
] as readonly string[];

export function citiesForState(state: string): string[] {
  const resolved = resolveStateName(state);
  if (!resolved) return [];
  return [...(NIGERIA_STATE_CITIES[resolved] ?? [])];
}

function normalizeStateKey(state: string): string {
  return state.trim().toLowerCase().replace(/[^a-z]/g, "");
}

/** Resolve user input to a canonical Nigerian state name. */
export function resolveStateName(state: string): string | undefined {
  const trimmed = String(state || "").trim();
  if (!trimmed) return undefined;
  if (NIGERIA_STATE_CITIES[trimmed]) return trimmed;

  const needle = normalizeStateKey(trimmed);
  for (const name of NIGERIAN_STATES) {
    if (normalizeStateKey(name) === needle) return name;
  }

  const aliases: Record<string, string> = {
    crossrivers: "Cross River",
    crossriverstate: "Cross River",
    fctabuja: "FCT",
    abuja: "FCT",
    federalcapitalterritory: "FCT"
  };
  return aliases[needle];
}

export function cityBelongsToState(city: string, state: string): boolean {
  const resolvedState = resolveStateName(state) || state;
  const needle = cityLooseKey(city);
  return citiesForState(resolvedState).some((c) => cityLooseKey(c) === needle);
}

function cityLooseKey(city: string): string {
  return city.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function stateForCity(city: string): string | undefined {
  if (!city) return undefined;
  const needle = cityLooseKey(city);
  for (const [state, cities] of Object.entries(NIGERIA_STATE_CITIES)) {
    if (cities.some((c) => cityLooseKey(c) === needle)) return state;
  }
  return undefined;
}

export function searchCitiesInState(state: string, query: string): string[] {
  const cities = citiesForState(state);
  const q = query.trim().toLowerCase();
  if (!q) return cities;
  return cities.filter((city) => city.toLowerCase().includes(q));
}

export const ALL_NIGERIAN_CITIES = [
  ...new Set(Object.values(NIGERIA_STATE_CITIES).flat())
].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

/** Map LGA/local city to nearest launch metro for discovery proximity */
export function metroForCity(city: string): string {
  const state = stateForCity(city);
  if (state === "FCT") return "Abuja";
  if (state === "Rivers") return "Port Harcourt";
  if (state === "Lagos") return "Lagos";
  if (city === "Ibadan" || city === "Abeokuta" || city === "Sagamu") return "Lagos";
  return city;
}
