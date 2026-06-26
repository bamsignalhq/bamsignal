import type { ReliabilityScenarioId } from "../types/reliabilityCertification";

export const RELIABILITY_CERTIFICATION_SCENARIOS: Array<{
  id: ReliabilityScenarioId;
  label: string;
}> = [
  { id: "supabase-unavailable", label: "Supabase unavailable" },
  { id: "paystack-unavailable", label: "Paystack unavailable" },
  { id: "sendchamp-unavailable", label: "Sendchamp unavailable" },
  { id: "resend-unavailable", label: "Resend unavailable" },
  { id: "storage-unavailable", label: "Storage unavailable" },
  { id: "network-timeout", label: "Network timeout" },
  { id: "slow-api", label: "Slow API" },
  { id: "database-reconnect", label: "Database reconnect" },
  { id: "expired-jwt", label: "Expired JWT" },
  { id: "invalid-refresh-token", label: "Invalid refresh token" }
];

export const RELIABILITY_CERTIFICATION_VERIFY_LABELS = {
  gracefulDegradation: "Graceful degradation",
  retry: "Retry",
  fallback: "Fallback",
  recovery: "Recovery",
  logging: "Logging",
  alertGeneration: "Alert generation"
} as const;

export const RELIABILITY_CERTIFICATION_RELEASE_BLOCKERS = [
  "Any scenario recovery failure",
  "Missing graceful degradation on dependency outage"
] as const;
