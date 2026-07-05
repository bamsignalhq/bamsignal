import { SEO_HUB_LIST, getAllSeoDetailPaths, getHubPages } from "../content/seo";
import { MARKETING_CONTENT_HUBS, MARKETING_SEO_CAPABILITIES } from "../constants/marketingInfrastructure";

export type MarketingSeoCatalog = {
  publicPageCount: number;
  hubCounts: { id: string; label: string; pages: number }[];
  capabilities: readonly string[];
  samplePaths: string[];
};

export function getMarketingSeoCatalog(): MarketingSeoCatalog {
  const hubCounts = SEO_HUB_LIST.map((hub) => ({
    id: hub.id,
    label: hub.title,
    pages: getHubPages(hub.id).length,
  }));

  const paths = getAllSeoDetailPaths();
  return {
    publicPageCount: paths.length + MARKETING_CONTENT_HUBS.length,
    hubCounts,
    capabilities: MARKETING_SEO_CAPABILITIES,
    samplePaths: paths.slice(0, 8),
  };
}
