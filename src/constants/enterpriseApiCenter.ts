/** Enterprise API Center — live API operations dashboard. */

import { ENTERPRISE_API_CENTER_ADMIN_BRAND } from "./enterpriseApiCenterAdmin";

export const ENTERPRISE_API_CENTER_BRAND = ENTERPRISE_API_CENTER_ADMIN_BRAND;

export const ENTERPRISE_API_REFRESH_INTERVAL_MS = 30_000;

export const ENTERPRISE_API_ENDPOINT_STATUSES = [
  "healthy",
  "degraded",
  "disabled",
  "maintenance"
] as const;

export type EnterpriseApiEndpointStatusId = (typeof ENTERPRISE_API_ENDPOINT_STATUSES)[number];

export const ENTERPRISE_API_ENDPOINT_STATUS_LABELS: Record<EnterpriseApiEndpointStatusId, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  disabled: "Disabled",
  maintenance: "Maintenance"
};

export const ENTERPRISE_API_AUTH_TYPES = [
  "session",
  "api-key",
  "admin",
  "public",
  "webhook",
  "cron"
] as const;

export type EnterpriseApiAuthTypeId = (typeof ENTERPRISE_API_AUTH_TYPES)[number];

export const ENTERPRISE_API_AUTH_LABELS: Record<EnterpriseApiAuthTypeId, string> = {
  session: "Session",
  "api-key": "API key",
  admin: "Admin",
  public: "Public",
  webhook: "Webhook",
  cron: "Cron"
};

export const ENTERPRISE_API_TOOLS = [
  {
    id: "disable-endpoint",
    label: "Disable endpoint",
    hint: "Temporarily block traffic to a selected endpoint"
  },
  {
    id: "maintenance-mode",
    label: "Maintenance mode",
    hint: "Return maintenance response for member-facing APIs"
  },
  {
    id: "retry-failed-jobs",
    label: "Retry failed jobs",
    hint: "Re-queue failed background API jobs"
  },
  {
    id: "replay-requests",
    label: "Replay requests",
    hint: "Replay captured failed requests for investigation"
  },
  {
    id: "api-documentation",
    label: "API documentation",
    hint: "Open internal API reference catalog"
  },
  {
    id: "openapi-export",
    label: "OpenAPI export",
    hint: "Export OpenAPI 3.1 spec for partner integrations"
  }
] as const;

export type EnterpriseApiToolId = (typeof ENTERPRISE_API_TOOLS)[number]["id"];

export const ENTERPRISE_API_CENTER_DB_TABLES = [
  "enterprise_api_endpoints",
  "enterprise_api_operations_snapshots",
  "enterprise_api_tool_runs",
  "enterprise_api_failed_jobs"
] as const;

export const ENTERPRISE_API_AUDIT_ACTIONS = [
  "endpoint-disabled",
  "endpoint-enabled",
  "maintenance-enabled",
  "maintenance-disabled",
  "jobs-retried",
  "requests-replayed",
  "openapi-exported",
  "documentation-opened"
] as const;

export type EnterpriseApiAuditActionId = (typeof ENTERPRISE_API_AUDIT_ACTIONS)[number];
