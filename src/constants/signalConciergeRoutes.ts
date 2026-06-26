import { normalizePath } from "./routePath";

export const SIGNAL_CONCIERGE_BASE_PATH = "/signal-concierge";

export const SIGNAL_CONCIERGE_ROUTES = {
  landing: SIGNAL_CONCIERGE_BASE_PATH,
  apply: `${SIGNAL_CONCIERGE_BASE_PATH}/apply`,
  status: `${SIGNAL_CONCIERGE_BASE_PATH}/status`,
  dashboard: `${SIGNAL_CONCIERGE_BASE_PATH}/dashboard`,
  consultation: `${SIGNAL_CONCIERGE_BASE_PATH}/consultation`,
  shareStory: `${SIGNAL_CONCIERGE_BASE_PATH}/share-your-story`,
  privacy: `${SIGNAL_CONCIERGE_BASE_PATH}/privacy`,
  faq: `${SIGNAL_CONCIERGE_BASE_PATH}/faq`
} as const;

export type SignalConciergeRoute = keyof typeof SIGNAL_CONCIERGE_ROUTES;

export const SIGNAL_CONCIERGE_APPLY_PATH = SIGNAL_CONCIERGE_ROUTES.apply;
export const SIGNAL_CONCIERGE_CONSULTATION_PATH = SIGNAL_CONCIERGE_ROUTES.consultation;
export const SIGNAL_CONCIERGE_STATUS_PATH = SIGNAL_CONCIERGE_ROUTES.status;
export const SIGNAL_CONCIERGE_DASHBOARD_PATH = SIGNAL_CONCIERGE_ROUTES.dashboard;
export const SIGNAL_CONCIERGE_PRIVACY_PATH = SIGNAL_CONCIERGE_ROUTES.privacy;
export const SIGNAL_CONCIERGE_FAQ_PATH = SIGNAL_CONCIERGE_ROUTES.faq;

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(SIGNAL_CONCIERGE_ROUTES).map(([route, path]) => [path, route])
) as Record<string, SignalConciergeRoute>;

const SIGNAL_CONCIERGE_PUBLIC_ROUTE_SET = new Set<SignalConciergeRoute>(["landing", "faq", "privacy"]);
const SIGNAL_CONCIERGE_AUTH_ROUTE_SET = new Set<SignalConciergeRoute>([
  "apply",
  "status",
  "dashboard",
  "consultation",
  "shareStory"
]);

export function isSignalConciergeRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === SIGNAL_CONCIERGE_BASE_PATH || path.startsWith(`${SIGNAL_CONCIERGE_BASE_PATH}/`);
}

export function getSignalConciergeRoute(pathname = window.location.pathname): SignalConciergeRoute | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}

export function isUnknownSignalConciergeSubroute(pathname = window.location.pathname): boolean {
  return isSignalConciergeRoute(pathname) && getSignalConciergeRoute(pathname) === null;
}

export function isSignalConciergePublicRoute(route: SignalConciergeRoute): boolean {
  return SIGNAL_CONCIERGE_PUBLIC_ROUTE_SET.has(route);
}

export function isSignalConciergeAuthenticatedRoute(route: SignalConciergeRoute): boolean {
  return SIGNAL_CONCIERGE_AUTH_ROUTE_SET.has(route);
}

export function signalConciergePathForRoute(route: SignalConciergeRoute): string {
  return SIGNAL_CONCIERGE_ROUTES[route];
}
