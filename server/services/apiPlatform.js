/**
 * Institutional API Platform™ — server-side standardized API layer.
 */

export const API_PLATFORM_DB_TABLES = [
  "api_catalog_entries",
  "api_clients",
  "api_keys",
  "api_webhooks",
  "api_rate_limits",
  "api_usage_snapshots"
];

export function getApiPlatformDatabaseTableManifest() {
  return API_PLATFORM_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "api-platform",
    migrationRef: "0014_api_platform.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessApiPlatform(permissions = []) {
  return (
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageOperations") ||
    permissions.includes("ManageGovernance")
  );
}

export function buildApiPlatformSummary(catalog, clients, keys, webhooks, rateLimits, usage) {
  const totalRequests24h = usage.reduce((sum, item) => sum + (item.requestCount ?? 0), 0);
  const totalErrors24h = usage.reduce((sum, item) => sum + (item.errorCount ?? 0), 0);

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

export function filterCatalogBySection(catalog, sectionId) {
  if (!sectionId || sectionId === "catalog" || sectionId === "versions") return catalog;
  return catalog;
}

export function filterKeysBySection(keys, sectionId) {
  if (sectionId === "keys" || sectionId === "catalog") return keys;
  return keys;
}

export function filterClientsBySection(clients, sectionId) {
  if (sectionId === "clients" || sectionId === "catalog") return clients;
  return clients;
}

export function filterWebhooksBySection(webhooks, sectionId) {
  if (sectionId === "webhooks" || sectionId === "integrations") return webhooks;
  return webhooks;
}

export function filterRateLimitsBySection(rateLimits, sectionId) {
  if (sectionId === "rate-limits") return rateLimits;
  return rateLimits;
}

export function filterUsageBySection(usage, sectionId) {
  if (sectionId === "usage" || sectionId === "errors") return usage;
  return usage;
}

export function listActiveApiKeys(keys) {
  return keys.filter((item) => item.status === "active" || item.status === "rotating");
}

export function listFailingWebhooks(webhooks, threshold = 1) {
  return webhooks.filter((item) => item.failureCount >= threshold);
}

export function rotateApiKey(key, actor) {
  if (key.status === "revoked") {
    throw new Error("API platform violation: cannot rotate revoked key");
  }
  return {
    ...key,
    status: "rotating",
    rotatedAt: new Date().toISOString()
  };
}

export function revokeApiKey(key, actor) {
  if (key.status === "revoked") {
    throw new Error("API platform violation: key already revoked");
  }
  return {
    ...key,
    status: "revoked"
  };
}

export function validateApiKeyScopes(key, requiredScopes = []) {
  if (!requiredScopes.length) return true;
  return requiredScopes.every((scope) => key.scopes.includes(scope));
}
