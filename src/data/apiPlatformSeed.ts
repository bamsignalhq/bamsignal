import type {
  ApiCatalogEntry,
  ApiClientRecord,
  ApiKeyRecord,
  ApiRateLimitRecord,
  ApiUsageSnapshot,
  ApiWebhookRecord
} from "../types/apiPlatform";
import { API_DOMAINS } from "../constants/apiPlatform";

const NOW = "2026-06-25T12:00:00.000Z";

function catalog(
  id: string,
  method: string,
  path: string,
  domainId: ApiCatalogEntry["domainId"],
  description: string,
  extra: Partial<ApiCatalogEntry> = {}
): ApiCatalogEntry {
  return {
    id,
    catalogRef: `API-${id.toUpperCase().replace(/_/g, "-")}`,
    method,
    path,
    domainId,
    version: "v1",
    description,
    authenticated: true,
    deprecated: false,
    updatedAt: NOW,
    ...extra
  };
}

export const API_CATALOG_SEED: ApiCatalogEntry[] = [
  catalog("mem_001", "GET", "/api/members/:id", "members", "Retrieve member profile"),
  catalog("mem_002", "PATCH", "/api/members/:id", "members", "Update member profile fields"),
  catalog("jrn_001", "GET", "/api/journey/:journeyId", "journey", "Retrieve concierge journey state"),
  catalog("jrn_002", "POST", "/api/journey/:journeyId/followups", "journey", "Schedule journey follow-up"),
  catalog("con_001", "GET", "/api/consultants", "consultants", "List active consultants"),
  catalog("ops_001", "GET", "/api/operations/metrics", "operations", "Operations center metrics snapshot"),
  catalog("pay_001", "POST", "/api/payments/initialize", "payments", "Initialize Paystack payment"),
  catalog("pay_002", "POST", "/api/payments/webhook", "payments", "Paystack webhook receiver", {
    authenticated: false
  }),
  catalog("sch_001", "POST", "/api/scheduling/calendar/book", "scheduling", "Book Google Calendar slot"),
  catalog("ntf_001", "POST", "/api/notifications/send", "notifications", "Send notification via Resend/Sendchamp"),
  catalog("sup_001", "GET", "/api/support/tickets", "support", "List support tickets"),
  catalog("res_001", "GET", "/api/research/insights", "research", "Journey intelligence insights"),
  catalog("com_001", "GET", "/api/communities/:cityId", "communities", "City community data"),
  catalog("evt_001", "GET", "/api/events/upcoming", "events", "Upcoming Signal Events"),
  catalog("ins_001", "GET", "/api/institute/programs", "institute", "BamSignal Institute programs")
];

export const API_CLIENT_SEED: ApiClientRecord[] = [
  {
    id: "cli_001",
    clientRef: "CLI-OPS-PROD",
    name: "Operations Center",
    environment: "production",
    scopes: ["read:members", "read:journey", "admin:operations"],
    active: true,
    createdAt: "2025-12-01T00:00:00.000Z",
    lastUsedAt: NOW
  },
  {
    id: "cli_002",
    clientRef: "CLI-PAY-PROD",
    name: "Payment Service",
    environment: "production",
    scopes: ["read:payments", "write:payments"],
    active: true,
    createdAt: "2025-12-01T00:00:00.000Z",
    lastUsedAt: NOW
  },
  {
    id: "cli_003",
    clientRef: "CLI-CONCIERGE-STG",
    name: "Signal Concierge Staging",
    environment: "staging",
    scopes: ["read:journey", "write:journey", "read:notifications"],
    active: true,
    createdAt: "2026-01-15T00:00:00.000Z"
  }
];

export const API_KEY_SEED: ApiKeyRecord[] = [
  {
    id: "key_001",
    keyRef: "KEY-OPS-****7A2F",
    clientId: "cli_001",
    clientName: "Operations Center",
    status: "active",
    scopes: ["read:members", "read:journey", "admin:operations"],
    expiresAt: "2027-06-01T00:00:00.000Z",
    ipRestrictions: ["10.0.0.0/8"],
    createdAt: "2025-12-01T00:00:00.000Z"
  },
  {
    id: "key_002",
    keyRef: "KEY-PAY-****9B4C",
    clientId: "cli_002",
    clientName: "Payment Service",
    status: "rotating",
    scopes: ["read:payments", "write:payments"],
    expiresAt: "2026-12-01T00:00:00.000Z",
    rotatedAt: "2026-06-20T00:00:00.000Z",
    ipRestrictions: [],
    createdAt: "2025-12-01T00:00:00.000Z"
  },
  {
    id: "key_003",
    keyRef: "KEY-STG-****1D8E",
    clientId: "cli_003",
    clientName: "Signal Concierge Staging",
    status: "active",
    scopes: ["read:journey", "write:journey"],
    ipRestrictions: [],
    createdAt: "2026-01-15T00:00:00.000Z"
  }
];

export const API_WEBHOOK_SEED: ApiWebhookRecord[] = [
  {
    id: "wh_001",
    webhookRef: "WH-PAYSTACK-001",
    providerId: "paystack",
    endpoint: "/api/payments/webhook",
    events: ["charge.success", "transfer.success"],
    active: true,
    lastDeliveryAt: NOW,
    failureCount: 0
  },
  {
    id: "wh_002",
    webhookRef: "WH-GCAL-001",
    providerId: "google-calendar",
    endpoint: "/api/scheduling/calendar/callback",
    events: ["event.created", "event.updated"],
    active: true,
    lastDeliveryAt: "2026-06-24T18:00:00.000Z",
    failureCount: 1
  },
  {
    id: "wh_003",
    webhookRef: "WH-ZOOM-001",
    providerId: "zoom",
    endpoint: "/api/scheduling/zoom/callback",
    events: ["meeting.started", "meeting.ended"],
    active: true,
    failureCount: 0
  },
  {
    id: "wh_004",
    webhookRef: "WH-RESEND-001",
    providerId: "resend",
    endpoint: "/api/notifications/resend/callback",
    events: ["email.delivered", "email.bounced"],
    active: true,
    lastDeliveryAt: NOW,
    failureCount: 2
  },
  {
    id: "wh_005",
    webhookRef: "WH-SENDCHAMP-001",
    providerId: "sendchamp",
    endpoint: "/api/notifications/sendchamp/callback",
    events: ["whatsapp.delivered", "whatsapp.failed"],
    active: true,
    failureCount: 0
  }
];

export const API_RATE_LIMIT_SEED: ApiRateLimitRecord[] = [
  {
    id: "rl_001",
    limitRef: "RL-GLOBAL",
    requestsPerMinute: 1200,
    burstLimit: 200,
    active: true
  },
  {
    id: "rl_002",
    limitRef: "RL-PAYMENTS",
    domainId: "payments",
    requestsPerMinute: 60,
    burstLimit: 10,
    active: true
  },
  {
    id: "rl_003",
    limitRef: "RL-OPS-CLIENT",
    clientId: "cli_001",
    domainId: "operations",
    requestsPerMinute: 300,
    burstLimit: 50,
    active: true
  }
];

export const API_USAGE_SEED: ApiUsageSnapshot[] = API_DOMAINS.slice(0, 8).map((domain, index) => ({
  id: `usage_${index + 1}`,
  domainId: domain.id,
  requestCount: [4200, 3100, 1800, 950, 620, 1100, 2400, 780][index] ?? 500,
  errorCount: [12, 8, 3, 2, 1, 15, 6, 4][index] ?? 2,
  avgLatencyMs: [85, 72, 95, 110, 45, 210, 68, 130][index] ?? 90,
  snapshotAt: NOW
}));
