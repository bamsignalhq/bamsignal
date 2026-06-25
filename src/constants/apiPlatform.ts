/** Institutional API Platform™ — standardized external integration layer. */

import { API_PLATFORM_ADMIN_BRAND } from "./apiPlatformAdmin";

export const API_PLATFORM_BRAND = API_PLATFORM_ADMIN_BRAND;

export const API_PLATFORM_SECTIONS = [
  { id: "catalog", label: "API Catalog" },
  { id: "keys", label: "Keys" },
  { id: "clients", label: "Clients" },
  { id: "rate-limits", label: "Rate Limits" },
  { id: "webhooks", label: "Webhooks" },
  { id: "integrations", label: "Integrations" },
  { id: "usage", label: "Usage" },
  { id: "errors", label: "Errors" },
  { id: "versions", label: "Versions" }
] as const;

export type ApiPlatformSectionId = (typeof API_PLATFORM_SECTIONS)[number]["id"];

export const API_DOMAINS = [
  { id: "members", label: "Members" },
  { id: "journey", label: "Journey" },
  { id: "consultants", label: "Consultants" },
  { id: "operations", label: "Operations" },
  { id: "payments", label: "Payments" },
  { id: "scheduling", label: "Scheduling" },
  { id: "notifications", label: "Notifications" },
  { id: "support", label: "Support" },
  { id: "research", label: "Research" },
  { id: "communities", label: "Communities" },
  { id: "events", label: "Events" },
  { id: "institute", label: "Institute" }
] as const;

export type ApiDomainId = (typeof API_DOMAINS)[number]["id"];

export const API_DOMAIN_LABELS: Record<ApiDomainId, string> = Object.fromEntries(
  API_DOMAINS.map((item) => [item.id, item.label])
) as Record<ApiDomainId, string>;

export const WEBHOOK_PROVIDERS = [
  { id: "paystack", label: "Paystack" },
  { id: "google-calendar", label: "Google Calendar" },
  { id: "zoom", label: "Zoom" },
  { id: "resend", label: "Resend" },
  { id: "sendchamp", label: "Sendchamp" },
  { id: "future-providers", label: "Future Providers" }
] as const;

export type WebhookProviderId = (typeof WEBHOOK_PROVIDERS)[number]["id"];

export const API_SCOPES = [
  "read:members",
  "write:members",
  "read:journey",
  "write:journey",
  "read:payments",
  "write:payments",
  "read:notifications",
  "write:notifications",
  "admin:operations"
] as const;

export type ApiScopeId = (typeof API_SCOPES)[number];

export const API_KEY_STATUSES = ["active", "rotating", "expired", "revoked"] as const;
export type ApiKeyStatusId = (typeof API_KEY_STATUSES)[number];

export const API_KEY_STATUS_LABELS: Record<ApiKeyStatusId, string> = {
  active: "Active",
  rotating: "Rotating",
  expired: "Expired",
  revoked: "Revoked"
};

export const API_PLATFORM_DB_TABLES = [
  "api_catalog_entries",
  "api_clients",
  "api_keys",
  "api_webhooks",
  "api_rate_limits",
  "api_usage_snapshots"
] as const;

export const API_PLATFORM_AUDIT_ACTIONS = [
  "key-created",
  "key-rotated",
  "key-revoked",
  "client-registered",
  "webhook-configured",
  "rate-limit-updated",
  "catalog-updated"
] as const;

export type ApiPlatformAuditActionId = (typeof API_PLATFORM_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const API_PLATFORM_FUTURE_ARCHITECTURE = [
  { id: "developer-portal", label: "Developer Portal" },
  { id: "sdks", label: "SDKs" },
  { id: "graphql", label: "GraphQL" },
  { id: "partner-apis", label: "Partner APIs" },
  { id: "public-apis", label: "Public APIs" }
] as const;
