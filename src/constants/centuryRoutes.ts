import { normalizePath } from "./routes";

export const CENTURY_BASE_PATH = "/century";

export const CENTURY_ROUTES = {
  stewardshipCouncil: `${CENTURY_BASE_PATH}/stewardship-council`,
  trust: `${CENTURY_BASE_PATH}/trust`,
  knowledge: `${CENTURY_BASE_PATH}/knowledge`
} as const;

export type CenturyRoute = keyof typeof CENTURY_ROUTES;

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(CENTURY_ROUTES).map(([route, path]) => [path, route])
) as Record<string, CenturyRoute>;

export function isCenturyRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === CENTURY_BASE_PATH || path.startsWith(`${CENTURY_BASE_PATH}/`);
}

export function getCenturyRoute(pathname = window.location.pathname): CenturyRoute | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}

export function isUnknownCenturySubroute(pathname = window.location.pathname): boolean {
  return isCenturyRoute(pathname) && getCenturyRoute(pathname) === null;
}

export function centuryPathForRoute(route: CenturyRoute): string {
  return CENTURY_ROUTES[route];
}
