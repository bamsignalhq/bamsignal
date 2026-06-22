import { normalizePath } from "./routes";

export const CONSULTANT_BASE_PATH = "/consultant";
export const CONSULTANT_LOGIN_PATH = `${CONSULTANT_BASE_PATH}/login`;

export const CONSULTANT_ROUTES = {
  home: CONSULTANT_BASE_PATH,
  login: CONSULTANT_LOGIN_PATH,
  crm: `${CONSULTANT_BASE_PATH}/crm`,
  regions: `${CONSULTANT_BASE_PATH}/regions`,
  portfolio: `${CONSULTANT_BASE_PATH}/portfolio`,
  members: `${CONSULTANT_BASE_PATH}/members`,
  introductions: `${CONSULTANT_BASE_PATH}/introductions`,
  followups: `${CONSULTANT_BASE_PATH}/followups`
} as const;

export type ConsultantWorkspaceRoute =
  | "home"
  | "crm"
  | "regions"
  | "portfolio"
  | "members"
  | "introductions"
  | "followups";

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(CONSULTANT_ROUTES).map(([route, path]) => [path, route])
) as Record<string, ConsultantWorkspaceRoute | "login">;

const CONSULTANT_WORKSPACE_ROUTE_SET = new Set<ConsultantWorkspaceRoute>([
  "home",
  "crm",
  "regions",
  "portfolio",
  "members",
  "introductions",
  "followups"
]);

export function isConsultantRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === CONSULTANT_BASE_PATH || path.startsWith(`${CONSULTANT_BASE_PATH}/`);
}

export function isConsultantLoginRoute(pathname = window.location.pathname): boolean {
  return normalizePath(pathname) === CONSULTANT_LOGIN_PATH;
}

export function getConsultantRoute(
  pathname = window.location.pathname
): ConsultantWorkspaceRoute | "login" | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}

export function isUnknownConsultantSubroute(pathname = window.location.pathname): boolean {
  return isConsultantRoute(pathname) && getConsultantRoute(pathname) === null;
}

export function isConsultantWorkspaceRoute(
  route: ConsultantWorkspaceRoute | "login" | null
): route is ConsultantWorkspaceRoute {
  return route !== null && route !== "login" && CONSULTANT_WORKSPACE_ROUTE_SET.has(route);
}

export function consultantPathForRoute(route: ConsultantWorkspaceRoute): string {
  return CONSULTANT_ROUTES[route];
}
