import { CORPORATE } from "./corporate";
import { normalizePath } from "./routePath";

/** Legacy path kept for inbound links; canonical external destination is stankings.com/career */
export const CAREERS_BASE_PATH = "/careers";
export const CAREERS_ALIAS_PATH = "/career";

export const CAREERS_PUBLIC_PATHS = [CAREERS_BASE_PATH, CAREERS_ALIAS_PATH] as const;

/**
 * BamSignal no longer hosts recruitment pages.
 * /career and /careers immediately redirect to Stankings Legacy Ltd careers.
 */
export const CAREERS_ROUTES = {
  landing: CAREERS_BASE_PATH,
  external: CORPORATE.careersUrl
} as const;

export type CareersHubRoute = keyof typeof CAREERS_ROUTES;

export type CareersRoute = { kind: "hub"; route: CareersHubRoute };

export function careersPathForHub(_route: CareersHubRoute = "landing"): string {
  return CAREERS_ROUTES.landing;
}

/** @deprecated Role pages removed — hiring is on stankings.com/career */
export function careersPathForRole(_roleSlug: string): string {
  return CAREERS_BASE_PATH;
}

function isCareersPublicPath(path: string): boolean {
  return CAREERS_PUBLIC_PATHS.some(
    (base) => path === base || path.startsWith(`${base}/`)
  );
}

export function isCareersRoute(pathname = window.location.pathname): boolean {
  return isCareersPublicPath(normalizePath(pathname));
}

export function getCareersRoute(pathname = window.location.pathname): CareersRoute | null {
  if (!isCareersRoute(pathname)) return null;
  return { kind: "hub", route: "landing" };
}

export function isUnknownCareersSubroute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (!isCareersRoute(path)) return false;
  return !CAREERS_PUBLIC_PATHS.includes(path as (typeof CAREERS_PUBLIC_PATHS)[number]);
}
