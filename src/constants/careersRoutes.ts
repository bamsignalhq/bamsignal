import { normalizePath } from "./routePath";
import { getCareerRoleBySlug } from "../utils/careersLogic";

export const CAREERS_BASE_PATH = "/careers";

export const CAREERS_ROUTES = {
  landing: CAREERS_BASE_PATH,
  openRoles: `${CAREERS_BASE_PATH}/open-roles`,
  culture: `${CAREERS_BASE_PATH}/culture`,
  ourValues: `${CAREERS_BASE_PATH}/our-values`,
  hiringProcess: `${CAREERS_BASE_PATH}/hiring-process`
} as const;

export type CareersHubRoute = keyof typeof CAREERS_ROUTES;

export type CareersRoute =
  | { kind: "hub"; route: CareersHubRoute }
  | { kind: "role"; roleSlug: string };

const HUB_PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(CAREERS_ROUTES).map(([route, path]) => [path, route])
) as Record<string, CareersHubRoute>;

export function careersPathForHub(route: CareersHubRoute): string {
  return CAREERS_ROUTES[route];
}

export function careersPathForRole(roleSlug: string): string {
  return `${CAREERS_BASE_PATH}/role/${roleSlug}`;
}

export function isCareersRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === CAREERS_BASE_PATH || path.startsWith(`${CAREERS_BASE_PATH}/`);
}

export function getCareersRoute(pathname = window.location.pathname): CareersRoute | null {
  const path = normalizePath(pathname);
  if (!isCareersRoute(path)) return null;

  if (HUB_PATH_TO_ROUTE[path]) {
    return { kind: "hub", route: HUB_PATH_TO_ROUTE[path] };
  }

  const rolePrefix = `${CAREERS_BASE_PATH}/role/`;
  if (path.startsWith(rolePrefix)) {
    const roleSlug = path.slice(rolePrefix.length);
    if (roleSlug && !roleSlug.includes("/") && getCareerRoleBySlug(roleSlug)) {
      return { kind: "role", roleSlug };
    }
    return null;
  }

  return null;
}

export function isUnknownCareersSubroute(pathname = window.location.pathname): boolean {
  return isCareersRoute(pathname) && getCareersRoute(pathname) === null;
}
