import type {
  EnterpriseApiEndpoint,
  EnterpriseApiFailedJob,
  EnterpriseApiToolRun
} from "../types/enterpriseApiCenter";

const NOW = "2026-06-26T14:00:00.000Z";

export const ENTERPRISE_API_ENDPOINT_SEED: EnterpriseApiEndpoint[] = [
  {
    id: "ep_001",
    endpointRef: "API-PIN-LOGIN",
    path: "/api/auth/pin-login",
    method: "POST",
    status: "healthy",
    latencyMs: 142,
    requestsPerMin: 840,
    errorCount: 12,
    errorRate: 1.4,
    rateLimitPerMin: 120,
    authentication: "public",
    payloadSizeKb: 0.4,
    updatedAt: NOW
  },
  {
    id: "ep_002",
    endpointRef: "API-PIN-RESET",
    path: "/api/auth/pin-reset",
    method: "POST",
    status: "healthy",
    latencyMs: 186,
    requestsPerMin: 120,
    errorCount: 3,
    errorRate: 2.5,
    rateLimitPerMin: 30,
    authentication: "public",
    payloadSizeKb: 0.6,
    updatedAt: NOW
  },
  {
    id: "ep_003",
    endpointRef: "API-MEMBER-DATA",
    path: "/api/member/data",
    method: "POST",
    status: "healthy",
    latencyMs: 210,
    requestsPerMin: 2200,
    errorCount: 18,
    errorRate: 0.8,
    rateLimitPerMin: 600,
    authentication: "session",
    payloadSizeKb: 2.8,
    updatedAt: NOW
  },
  {
    id: "ep_004",
    endpointRef: "API-MEMBER-PHOTOS",
    path: "/api/member/photos",
    method: "POST",
    status: "degraded",
    latencyMs: 680,
    requestsPerMin: 420,
    errorCount: 28,
    errorRate: 6.7,
    rateLimitPerMin: 120,
    authentication: "session",
    payloadSizeKb: 420,
    updatedAt: NOW
  },
  {
    id: "ep_005",
    endpointRef: "API-PAYSTACK-VERIFY",
    path: "/api/paystack/verify",
    method: "POST",
    status: "healthy",
    latencyMs: 520,
    requestsPerMin: 86,
    errorCount: 2,
    errorRate: 2.3,
    rateLimitPerMin: 60,
    authentication: "session",
    payloadSizeKb: 1.2,
    updatedAt: NOW
  },
  {
    id: "ep_006",
    endpointRef: "API-CONSULTATION-PAYMENTS",
    path: "/api/consultation-payments",
    method: "POST",
    status: "healthy",
    latencyMs: 380,
    requestsPerMin: 42,
    errorCount: 1,
    errorRate: 2.4,
    rateLimitPerMin: 40,
    authentication: "session",
    payloadSizeKb: 1.8,
    updatedAt: NOW
  },
  {
    id: "ep_007",
    endpointRef: "API-VERIFY-WHATSAPP-START",
    path: "/api/verify/whatsapp/start",
    method: "POST",
    status: "healthy",
    latencyMs: 290,
    requestsPerMin: 64,
    errorCount: 4,
    errorRate: 6.2,
    rateLimitPerMin: 30,
    authentication: "session",
    payloadSizeKb: 0.5,
    updatedAt: NOW
  },
  {
    id: "ep_008",
    endpointRef: "API-VERIFY-WHATSAPP-WEBHOOK",
    path: "/api/verify/whatsapp/webhook",
    method: "POST",
    status: "healthy",
    latencyMs: 98,
    requestsPerMin: 28,
    errorCount: 0,
    errorRate: 0,
    rateLimitPerMin: 200,
    authentication: "webhook",
    payloadSizeKb: 0.8,
    updatedAt: NOW
  },
  {
    id: "ep_009",
    endpointRef: "API-ADMIN-MEMBERS",
    path: "/api/admin/members",
    method: "POST",
    status: "healthy",
    latencyMs: 240,
    requestsPerMin: 36,
    errorCount: 1,
    errorRate: 2.8,
    rateLimitPerMin: 120,
    authentication: "admin",
    payloadSizeKb: 4.2,
    updatedAt: NOW
  },
  {
    id: "ep_010",
    endpointRef: "API-ADMIN-MODERATION",
    path: "/api/admin/moderation",
    method: "POST",
    status: "healthy",
    latencyMs: 310,
    requestsPerMin: 52,
    errorCount: 2,
    errorRate: 3.8,
    rateLimitPerMin: 80,
    authentication: "admin",
    payloadSizeKb: 3.6,
    updatedAt: NOW
  },
  {
    id: "ep_011",
    endpointRef: "API-FEATURE-FLAGS",
    path: "/api/feature-flags",
    method: "GET",
    status: "healthy",
    latencyMs: 42,
    requestsPerMin: 1800,
    errorCount: 0,
    errorRate: 0,
    rateLimitPerMin: 3000,
    authentication: "session",
    payloadSizeKb: 0.3,
    updatedAt: NOW
  },
  {
    id: "ep_012",
    endpointRef: "API-REMOTE-CONFIG",
    path: "/api/remote-config",
    method: "GET",
    status: "healthy",
    latencyMs: 38,
    requestsPerMin: 1640,
    errorCount: 0,
    errorRate: 0,
    rateLimitPerMin: 3000,
    authentication: "session",
    payloadSizeKb: 0.2,
    updatedAt: NOW
  },
  {
    id: "ep_013",
    endpointRef: "API-CITY-HOME",
    path: "/api/city/home",
    method: "GET",
    status: "healthy",
    latencyMs: 156,
    requestsPerMin: 920,
    errorCount: 6,
    errorRate: 0.7,
    rateLimitPerMin: 1200,
    authentication: "public",
    payloadSizeKb: 6.4,
    updatedAt: NOW
  },
  {
    id: "ep_014",
    endpointRef: "API-CONTACT",
    path: "/api/contact",
    method: "POST",
    status: "maintenance",
    latencyMs: 0,
    requestsPerMin: 0,
    errorCount: 0,
    errorRate: 0,
    rateLimitPerMin: 20,
    authentication: "public",
    payloadSizeKb: 0.9,
    updatedAt: NOW
  },
  {
    id: "ep_015",
    endpointRef: "API-READY",
    path: "/ready",
    method: "GET",
    status: "healthy",
    latencyMs: 24,
    requestsPerMin: 120,
    errorCount: 0,
    errorRate: 0,
    rateLimitPerMin: 600,
    authentication: "public",
    payloadSizeKb: 0.1,
    updatedAt: NOW
  }
];

export const ENTERPRISE_API_FAILED_JOB_SEED: EnterpriseApiFailedJob[] = [
  {
    id: "job_001",
    jobRef: "JOB-PAYSTACK-VERIFY-8821",
    endpointPath: "/api/paystack/verify",
    method: "POST",
    failureReason: "Paystack timeout after 12s",
    attempts: 3,
    failedAt: "2026-06-26T13:42:00.000Z",
    status: "pending"
  },
  {
    id: "job_002",
    jobRef: "JOB-PHOTO-MOD-4410",
    endpointPath: "/api/member/photos",
    method: "POST",
    failureReason: "Moderation provider 503",
    attempts: 2,
    failedAt: "2026-06-26T13:18:00.000Z",
    status: "pending"
  },
  {
    id: "job_003",
    jobRef: "JOB-CONCIERGE-EMAIL-2290",
    endpointPath: "/api/concierge-email",
    method: "POST",
    failureReason: "Resend rate limit",
    attempts: 1,
    failedAt: "2026-06-26T12:55:00.000Z",
    status: "retried"
  }
];

export const ENTERPRISE_API_TOOL_RUN_SEED: EnterpriseApiToolRun[] = [
  {
    id: "atr_001",
    toolId: "openapi-export",
    status: "completed",
    summary: "Exported 42 paths — OpenAPI 3.1 JSON (128KB)",
    ranAt: "2026-06-25T16:00:00.000Z",
    actor: "ops@bamsignal.com"
  }
];
