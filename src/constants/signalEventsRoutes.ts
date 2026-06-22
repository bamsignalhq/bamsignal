import { normalizePath } from "./routes";
import { getGlobalCity } from "./globalCityNetwork";

export const SIGNAL_EVENTS_BASE_PATH = "/events";

export const SIGNAL_EVENTS_ROUTES = {
  landing: SIGNAL_EVENTS_BASE_PATH,
  communities: `${SIGNAL_EVENTS_BASE_PATH}/communities`,
  diaspora: `${SIGNAL_EVENTS_BASE_PATH}/diaspora`,
  communityJourney: `${SIGNAL_EVENTS_BASE_PATH}/community-journey`,
  diasporaCorridors: `${SIGNAL_EVENTS_BASE_PATH}/diaspora-corridors`
} as const;

export type SignalEventsHubRoute = keyof typeof SIGNAL_EVENTS_ROUTES;

export type SignalEventsRoute =
  | { kind: "hub"; route: SignalEventsHubRoute }
  | { kind: "city"; citySlug: string };

const HUB_PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(SIGNAL_EVENTS_ROUTES).map(([route, path]) => [path, route])
) as Record<string, SignalEventsHubRoute>;

export function isSignalEventsRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === SIGNAL_EVENTS_BASE_PATH || path.startsWith(`${SIGNAL_EVENTS_BASE_PATH}/`);
}

export function getSignalEventsRoute(pathname = window.location.pathname): SignalEventsRoute | null {
  const path = normalizePath(pathname);
  if (path === SIGNAL_EVENTS_BASE_PATH) {
    return { kind: "hub", route: "landing" };
  }
  if (!path.startsWith(`${SIGNAL_EVENTS_BASE_PATH}/`)) return null;

  const subpath = path.slice(SIGNAL_EVENTS_BASE_PATH.length + 1);
  const segment = subpath.split("/")[0];
  if (!segment || subpath.includes("/")) {
    if (HUB_PATH_TO_ROUTE[path]) {
      return { kind: "hub", route: HUB_PATH_TO_ROUTE[path] };
    }
    return null;
  }

  if (HUB_PATH_TO_ROUTE[path]) {
    return { kind: "hub", route: HUB_PATH_TO_ROUTE[path] };
  }

  if (getGlobalCity(segment)) {
    return { kind: "city", citySlug: segment };
  }

  return null;
}

export function isUnknownSignalEventsSubroute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (!isSignalEventsRoute(path)) return false;
  return getSignalEventsRoute(path) === null;
}

export function signalEventsPathForHub(route: SignalEventsHubRoute): string {
  return SIGNAL_EVENTS_ROUTES[route];
}

export function signalEventsPathForCity(citySlug: string): string {
  return `${SIGNAL_EVENTS_BASE_PATH}/${citySlug}`;
}
