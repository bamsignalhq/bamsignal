import { normalizePath } from "./routes";

export const BAMSIGNAL_FOUNDATION_BASE_PATH = "/foundation";

export const BAMSIGNAL_FOUNDATION_ROUTES = {
  landing: BAMSIGNAL_FOUNDATION_BASE_PATH,
  programs: `${BAMSIGNAL_FOUNDATION_BASE_PATH}/programs`,
  stories: `${BAMSIGNAL_FOUNDATION_BASE_PATH}/stories`
} as const;

export type BamSignalFoundationRoute = keyof typeof BAMSIGNAL_FOUNDATION_ROUTES;

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(BAMSIGNAL_FOUNDATION_ROUTES).map(([route, path]) => [path, route])
) as Record<string, BamSignalFoundationRoute>;

export function isBamSignalFoundationRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === BAMSIGNAL_FOUNDATION_BASE_PATH || path.startsWith(`${BAMSIGNAL_FOUNDATION_BASE_PATH}/`);
}

export function getBamSignalFoundationRoute(
  pathname = window.location.pathname
): BamSignalFoundationRoute | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}

export function isUnknownBamSignalFoundationSubroute(pathname = window.location.pathname): boolean {
  return isBamSignalFoundationRoute(pathname) && getBamSignalFoundationRoute(pathname) === null;
}

export function bamSignalFoundationPathForRoute(route: BamSignalFoundationRoute): string {
  return BAMSIGNAL_FOUNDATION_ROUTES[route];
}
