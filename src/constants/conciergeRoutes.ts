import { normalizePath } from "./routePath";

/** Canonical Concierge client experience — distinct from Discover member app. */
export const CONCIERGE_BASE_PATH = "/concierge";

export const CONCIERGE_ROUTES = {
  landing: CONCIERGE_BASE_PATH,
  about: `${CONCIERGE_BASE_PATH}/about`,
  benefits: `${CONCIERGE_BASE_PATH}/benefits`,
  pricing: `${CONCIERGE_BASE_PATH}/pricing`,
  login: `${CONCIERGE_BASE_PATH}/login`,
  signup: `${CONCIERGE_BASE_PATH}/signup`,
  /** BamSignal client auth uses PIN — alias path kept for IA naming. */
  forgotPassword: `${CONCIERGE_BASE_PATH}/forgot-password`,
  forgotPin: `${CONCIERGE_BASE_PATH}/forgot-pin`,
  forgotUsername: `${CONCIERGE_BASE_PATH}/forgot-username`,
  verifyEmail: `${CONCIERGE_BASE_PATH}/verify-email`,
  onboarding: `${CONCIERGE_BASE_PATH}/onboarding`,
  dashboard: `${CONCIERGE_BASE_PATH}/dashboard`,
  status: `${CONCIERGE_BASE_PATH}/status`,
  privacy: `${CONCIERGE_BASE_PATH}/privacy`,
  faq: `${CONCIERGE_BASE_PATH}/faq`
} as const;

export type ConciergeRoute = keyof typeof CONCIERGE_ROUTES;

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(CONCIERGE_ROUTES).map(([route, path]) => [path, route])
) as Record<string, ConciergeRoute>;

/** forgot-password is an alias of forgot-pin (PIN terminology). */
PATH_TO_ROUTE[CONCIERGE_ROUTES.forgotPassword] = "forgotPin";

const CONCIERGE_PUBLIC_ROUTE_SET = new Set<ConciergeRoute>([
  "landing",
  "about",
  "benefits",
  "pricing",
  "login",
  "signup",
  "forgotPassword",
  "forgotPin",
  "forgotUsername",
  "verifyEmail",
  "privacy",
  "faq"
]);

const CONCIERGE_AUTH_ROUTE_SET = new Set<ConciergeRoute>([
  "onboarding",
  "dashboard",
  "status"
]);

export function isConciergeRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === CONCIERGE_BASE_PATH || path.startsWith(`${CONCIERGE_BASE_PATH}/`);
}

export function getConciergeRoute(pathname = window.location.pathname): ConciergeRoute | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}

export function isUnknownConciergeSubroute(pathname = window.location.pathname): boolean {
  return isConciergeRoute(pathname) && getConciergeRoute(pathname) === null;
}

export function isConciergePublicRoute(route: ConciergeRoute): boolean {
  return CONCIERGE_PUBLIC_ROUTE_SET.has(route);
}

export function isConciergeAuthenticatedRoute(route: ConciergeRoute): boolean {
  return CONCIERGE_AUTH_ROUTE_SET.has(route);
}

export function conciergePathForRoute(route: ConciergeRoute): string {
  if (route === "forgotPassword") return CONCIERGE_ROUTES.forgotPin;
  return CONCIERGE_ROUTES[route];
}

export function isConciergeAuthViewRoute(route: ConciergeRoute | null): boolean {
  return (
    route === "login" ||
    route === "signup" ||
    route === "forgotPin" ||
    route === "forgotPassword" ||
    route === "forgotUsername" ||
    route === "verifyEmail"
  );
}
