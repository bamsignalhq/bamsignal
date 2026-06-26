/** Reliability Certification™ — failure scenario registry. */

export const RELIABILITY_CERT_SCENARIOS = [
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

export const RELIABILITY_CERT_VERIFY_DIMENSIONS = [
  "gracefulDegradation",
  "retry",
  "fallback",
  "recovery",
  "logging",
  "alertGeneration"
];

export const RELIABILITY_CERT_BLOCK_ON_FAILURE = true;
