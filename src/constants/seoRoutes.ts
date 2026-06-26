import { normalizePath } from "./routePath";
import type { SeoHubId } from "../content/seo/seoPages";

export type SeoRoute = {
  hubId: SeoHubId;
  slug: string | null;
};

const HUB_PATH_TO_ID: Record<string, SeoHubId> = {
  "/cities": "cities",
  "/help": "help",
  "/safety": "safety",
  "/features": "features",
  "/premium": "premium",
  "/faq": "faq",
  "/guides": "guides",
  "/compare": "compare"
};

const SEO_HUB_PATHS = Object.keys(HUB_PATH_TO_ID);

export function getSeoRoute(pathname = window.location.pathname): SeoRoute | null {
  const path = normalizePath(pathname);

  for (const hubPath of SEO_HUB_PATHS) {
    if (path === hubPath) {
      // /help hub is Customer Support Center™ — SEO articles remain at /help/{slug}
      if (hubPath === "/help") continue;
      return { hubId: HUB_PATH_TO_ID[hubPath], slug: null };
    }
    if (path.startsWith(`${hubPath}/`)) {
      const slug = path.slice(hubPath.length + 1);
      if (slug && !slug.includes("/")) {
        return { hubId: HUB_PATH_TO_ID[hubPath], slug };
      }
    }
  }

  return null;
}

export function isSeoRoute(pathname = window.location.pathname): boolean {
  return getSeoRoute(pathname) !== null;
}
