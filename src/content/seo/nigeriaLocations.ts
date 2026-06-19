import { buildAllStates } from "./nigeriaAllStates";
import {
  NIGERIA_DIRECTORY_PATH,
  type NigeriaCityLocation,
  type NigeriaStateLocation
} from "./nigeriaLocationTypes";

export const NIGERIA_STATES: NigeriaStateLocation[] = buildAllStates();

const stateBySlug = new Map(NIGERIA_STATES.map((state) => [state.slug, state]));

export function getNigeriaState(slug: string): NigeriaStateLocation | undefined {
  return stateBySlug.get(slug);
}

export function getNigeriaCity(
  stateSlug: string,
  citySlug: string
): { state: NigeriaStateLocation; city: NigeriaCityLocation } | undefined {
  const state = getNigeriaState(stateSlug);
  if (!state) return undefined;
  const city = state.cities.find((c) => c.slug === citySlug);
  if (!city) return undefined;
  return { state, city };
}

export function getIndexableStates(): NigeriaStateLocation[] {
  return NIGERIA_STATES.filter((s) => s.indexable);
}

export function getStateCityPath(stateSlug: string, citySlug: string): string {
  return `${NIGERIA_DIRECTORY_PATH}/${stateSlug}/${citySlug}`;
}

export function getStatePath(stateSlug: string): string {
  return `${NIGERIA_DIRECTORY_PATH}/${stateSlug}`;
}

export function resolveNearbyCities(
  state: NigeriaStateLocation,
  city: NigeriaCityLocation
): NigeriaCityLocation[] {
  return city.nearby
    .map((slug) => state.cities.find((c) => c.slug === slug))
    .filter((c): c is NigeriaCityLocation => Boolean(c));
}

export function resolveNearbyStates(state: NigeriaStateLocation): NigeriaStateLocation[] {
  return state.nearbyStates
    .map((slug) => getNigeriaState(slug))
    .filter((s): s is NigeriaStateLocation => Boolean(s && s.indexable));
}

export function getIndexableNigeriaPaths(): string[] {
  const paths = [NIGERIA_DIRECTORY_PATH];
  for (const state of NIGERIA_STATES) {
    if (state.indexable) {
      paths.push(getStatePath(state.slug));
    }
    for (const city of state.cities) {
      if (city.indexable) {
        paths.push(getStateCityPath(state.slug, city.slug));
      }
    }
  }
  return paths;
}

export * from "./nigeriaLocationTypes";
