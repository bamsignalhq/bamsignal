import { normalizePath } from "./routePath";

export const CAREERS_BASE_PATH = "/careers";

/**
 * BamSignal no longer hosts a multi-page job board.
 * All /careers/* URLs resolve to the Join Our Team landing.
 */
export const CAREERS_ROUTES = {
  landing: CAREERS_BASE_PATH
} as const;

export type CareersHubRoute = keyof typeof CAREERS_ROUTES;

export type CareersRoute = { kind: "hub"; route: CareersHubRoute };

export function careersPathForHub(_route: CareersHubRoute = "landing"): string {
  return CAREERS_ROUTES.landing;
}

/** @deprecated Role pages removed — hiring is on stankings.com/careers */
export function careersPathForRole(_roleSlug: string): string {
  return CAREERS_BASE_PATH;
}

export function isCareersRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === CAREERS_BASE_PATH || path.startsWith(`${CAREERS_BASE_PATH}/`);
}

export function getCareersRoute(pathname = window.location.pathname): CareersRoute | null {
  if (!isCareersRoute(pathname)) return null;
  return { kind: "hub", route: "landing" };
}

export function isUnknownCareersSubroute(pathname = window.location.pathname): boolean {
  return isCareersRoute(pathname) && normalizePath(pathname) !== CAREERS_BASE_PATH;
}
