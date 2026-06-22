import { normalizePath } from "./routes";

export const SUPPORT_CENTER_ROUTES = {
  help: "/help",
  contact: "/contact",
  tickets: "/tickets",
  knowledgeBase: "/knowledge-base"
} as const;

export type SupportCenterRoute = keyof typeof SUPPORT_CENTER_ROUTES;

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(SUPPORT_CENTER_ROUTES).map(([route, path]) => [path, route])
) as Record<string, SupportCenterRoute>;

export function supportCenterPathForRoute(route: SupportCenterRoute): string {
  return SUPPORT_CENTER_ROUTES[route];
}

export function isSupportCenterRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return Object.values(SUPPORT_CENTER_ROUTES).includes(path as (typeof SUPPORT_CENTER_ROUTES)[SupportCenterRoute]);
}

export function getSupportCenterRoute(pathname = window.location.pathname): SupportCenterRoute | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}
