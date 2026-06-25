import type { ApiPlatformBundle } from "../types/apiPlatform";
import type { ApiPlatformSectionId } from "../constants/apiPlatform";
import {
  buildApiPlatformSummary,
  filterCatalogBySection,
  filterUsageBySection,
  filterWebhooksBySection
} from "./apiPlatformLogic";
import {
  listApiCatalog,
  listApiClients,
  listApiKeys,
  listApiRateLimits,
  listApiUsageSnapshots,
  listApiWebhooks
} from "./apiPlatformStore";

export function buildApiPlatformBundle(
  sectionId: ApiPlatformSectionId = "catalog"
): ApiPlatformBundle {
  const catalog = listApiCatalog();
  const clients = listApiClients();
  const keys = listApiKeys();
  const webhooks = listApiWebhooks();
  const rateLimits = listApiRateLimits();
  const usage = listApiUsageSnapshots();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildApiPlatformSummary(catalog, clients, keys, webhooks, rateLimits, usage),
    catalog: filterCatalogBySection(catalog, sectionId),
    clients,
    keys,
    webhooks: filterWebhooksBySection(webhooks, sectionId),
    rateLimits,
    usage: filterUsageBySection(usage, sectionId)
  };
}
