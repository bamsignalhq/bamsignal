import { normalizePath } from "./routes";

export const BAMSIGNAL_INSTITUTE_BASE_PATH = "/institute";

export const BAMSIGNAL_INSTITUTE_ROUTES = {
  landing: BAMSIGNAL_INSTITUTE_BASE_PATH,
  programs: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/programs`,
  annualInsights: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/annual-insights`
} as const;

export type BamSignalInstituteRoute = keyof typeof BAMSIGNAL_INSTITUTE_ROUTES;

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(BAMSIGNAL_INSTITUTE_ROUTES).map(([route, path]) => [path, route])
) as Record<string, BamSignalInstituteRoute>;

export function isBamSignalInstituteRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === BAMSIGNAL_INSTITUTE_BASE_PATH || path.startsWith(`${BAMSIGNAL_INSTITUTE_BASE_PATH}/`);
}

export function getBamSignalInstituteRoute(
  pathname = window.location.pathname
): BamSignalInstituteRoute | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}

export function isUnknownBamSignalInstituteSubroute(pathname = window.location.pathname): boolean {
  return isBamSignalInstituteRoute(pathname) && getBamSignalInstituteRoute(pathname) === null;
}

export function bamSignalInstitutePathForRoute(route: BamSignalInstituteRoute): string {
  return BAMSIGNAL_INSTITUTE_ROUTES[route];
}
