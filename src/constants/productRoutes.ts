import { normalizePath, navigateToPath } from "./routePath";
import { SIGNAL_CONCIERGE_ROUTES } from "./signalConciergeRoutes";

/** Public Discover + Discreet Mode landings — never collide with member `/discover`. */
export const PRODUCT_ROUTES = {
  dating: "/dating",
  discreetMode: "/discreet-mode"
} as const;

export type ProductLandingId = keyof typeof PRODUCT_ROUTES;

/** Legacy Phase-1 alias — permanently redirects to Signal Concierge™. */
export const PROFESSIONAL_MATCHMAKING_ALIAS = "/professional-matchmaking";

const PATH_TO_ID = Object.fromEntries(
  Object.entries(PRODUCT_ROUTES).map(([id, path]) => [path, id])
) as Record<string, ProductLandingId>;

export function getProductLandingId(pathname = window.location.pathname): ProductLandingId | null {
  const path = normalizePath(pathname);
  return PATH_TO_ID[path] ?? null;
}

export function isProductLandingRoute(pathname = window.location.pathname): boolean {
  return getProductLandingId(pathname) !== null;
}

export function productLandingPath(id: ProductLandingId): string {
  return PRODUCT_ROUTES[id];
}

/** Indexable public product URLs for sitemap generation (Concierge uses its own sitemap paths). */
export function getProductLandingIndexablePaths(): string[] {
  return Object.values(PRODUCT_ROUTES);
}

/** Permanent redirect: /professional-matchmaking → /signal-concierge */
export function redirectProfessionalMatchmakingAlias(
  pathname = window.location.pathname
): boolean {
  const path = normalizePath(pathname);
  if (path !== PROFESSIONAL_MATCHMAKING_ALIAS) return false;
  navigateToPath(SIGNAL_CONCIERGE_ROUTES.landing, true);
  return true;
}
