import { CITY_PAGES } from "./cities";
import { COMPARE_PAGES } from "./comparePages";
import { FAQ_PAGES } from "./faqPages";
import { FEATURE_PAGES } from "./featurePages";
import { GUIDE_PAGES } from "./guidePages";
import { HELP_PAGES } from "./helpPages";
import { PREMIUM_PAGES } from "./premiumPages";
import { SAFETY_PAGES } from "./safetyPages";
import {
  SEO_HUBS,
  SEO_HUB_LIST,
  type SeoHubConfig,
  type SeoHubId,
  type SeoPage
} from "./seoPages";

export * from "./seoPages";
export { CITY_PAGES } from "./cities";
export { HELP_PAGES } from "./helpPages";
export { SAFETY_PAGES } from "./safetyPages";
export { FEATURE_PAGES } from "./featurePages";
export { PREMIUM_PAGES } from "./premiumPages";
export { FAQ_PAGES } from "./faqPages";
export { GUIDE_PAGES } from "./guidePages";
export { COMPARE_PAGES } from "./comparePages";

const PAGES_BY_HUB: Record<SeoHubId, SeoPage[]> = {
  cities: CITY_PAGES,
  help: HELP_PAGES,
  safety: SAFETY_PAGES,
  features: FEATURE_PAGES,
  premium: PREMIUM_PAGES,
  faq: FAQ_PAGES,
  guides: GUIDE_PAGES,
  compare: COMPARE_PAGES
};

export function getHubPages(hubId: SeoHubId): SeoPage[] {
  return PAGES_BY_HUB[hubId];
}

export function getSeoPage(hubId: SeoHubId, slug: string): SeoPage | undefined {
  return PAGES_BY_HUB[hubId].find((page) => page.slug === slug);
}

export function getSeoHub(hubId: SeoHubId): SeoHubConfig {
  return SEO_HUBS[hubId];
}

export function getAllSeoDetailPaths(): string[] {
  return SEO_HUB_LIST.flatMap((hub) =>
    PAGES_BY_HUB[hub.id].map((page) => page.canonicalPath)
  );
}

export { SEO_HUBS, SEO_HUB_LIST };
