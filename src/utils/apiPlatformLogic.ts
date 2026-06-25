import type {
  ApiCatalogEntry,
  ApiClientRecord,
  ApiKeyRecord,
  ApiPlatformSummary,
  ApiRateLimitRecord,
  ApiUsageSnapshot,
  ApiWebhookRecord
} from "../types/apiPlatform";
import type { ApiPlatformSectionId, ApiScopeId } from "../constants/apiPlatform";

export function buildApiPlatformSummary(
  catalog: ApiCatalogEntry[],
  clients: ApiClientRecord[],
  keys: ApiKeyRecord[],
  webhooks: ApiWebhookRecord[],
  rateLimits: ApiRateLimitRecord[],
  usage: ApiUsageSnapshot[]
): ApiPlatformSummary {
  const totalRequests24h = usage.reduce((sum, item) => sum + item.requestCount, 0);
  const totalErrors24h = usage.reduce((sum, item) => sum + item.errorCount, 0);

  return {
    catalogCount: catalog.length,
    activeClients: clients.filter((item) => item.active).length,
    activeKeys: keys.filter((item) => item.status === "active" || item.status === "rotating").length,
    activeWebhooks: webhooks.filter((item) => item.active).length,
    rateLimitRules: rateLimits.filter((item) => item.active).length,
    totalRequests24h,
    totalErrors24h,
    deprecatedEndpoints: catalog.filter((item) => item.deprecated).length
  };
}

export function filterCatalogBySection(
  catalog: ApiCatalogEntry[],
  sectionId: ApiPlatformSectionId
): ApiCatalogEntry[] {
  if (sectionId === "versions") {
    return catalog.filter((item) => item.deprecated);
  }
  return catalog;
}

export function filterWebhooksBySection(
  webhooks: ApiWebhookRecord[],
  sectionId: ApiPlatformSectionId
): ApiWebhookRecord[] {
  if (sectionId === "webhooks" || sectionId === "integrations") return webhooks;
  return webhooks;
}

export function filterUsageBySection(
  usage: ApiUsageSnapshot[],
  sectionId: ApiPlatformSectionId
): ApiUsageSnapshot[] {
  if (sectionId === "errors") {
    return usage.filter((item) => item.errorCount > 0);
  }
  if (sectionId === "usage") return usage;
  return usage;
}

export function listActiveApiKeys(keys: ApiKeyRecord[]) {
  return keys.filter((item) => item.status === "active" || item.status === "rotating");
}

export function listFailingWebhooks(webhooks: ApiWebhookRecord[], threshold = 1) {
  return webhooks.filter((item) => item.failureCount >= threshold);
}

export function rotateApiKey(key: ApiKeyRecord): ApiKeyRecord {
  if (key.status === "revoked") {
    throw new Error("API platform violation: cannot rotate revoked key");
  }
  return {
    ...key,
    status: "rotating",
    rotatedAt: new Date().toISOString()
  };
}

export function revokeApiKey(key: ApiKeyRecord): ApiKeyRecord {
  if (key.status === "revoked") {
    throw new Error("API platform violation: key already revoked");
  }
  return {
    ...key,
    status: "revoked"
  };
}

export function validateApiKeyScopes(key: ApiKeyRecord, requiredScopes: ApiScopeId[] = []) {
  if (!requiredScopes.length) return true;
  return requiredScopes.every((scope) => key.scopes.includes(scope));
}

export function formatApiPlatformSummaryLine(summary: ApiPlatformSummary) {
  return `${summary.catalogCount} endpoints · ${summary.activeClients} clients · ${summary.activeKeys} keys · ${summary.totalRequests24h.toLocaleString()} requests/24h · ${summary.totalErrors24h} errors`;
}
