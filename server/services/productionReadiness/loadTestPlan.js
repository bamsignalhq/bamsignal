/**
 * Sprint 7 — Load test plan (repeatable scenarios and thresholds).
 */

export const LOAD_TEST_SCENARIOS = Object.freeze([
  {
    id: "signup_burst",
    label: "Signup burst",
    command: "npm run certify:platform-load -- --profile signup",
    threshold: { errorRateMax: 0.01, p95Ms: 2000, rpsMin: 5 },
    covers: ["authentication", "signup"]
  },
  {
    id: "matching_load",
    label: "Matching / discover load",
    command: "npm run certify:platform-load -- --journey discover",
    threshold: { errorRateMax: 0.02, p95Ms: 1500, rpsMin: 10 },
    covers: ["matching", "discover"]
  },
  {
    id: "messaging_load",
    label: "Messaging throughput",
    command: "npm run certify:platform-load -- --journey messaging",
    threshold: { errorRateMax: 0.02, p95Ms: 1000, rpsMin: 20 },
    covers: ["messaging", "realtime"]
  },
  {
    id: "payment_load",
    label: "Payment initialization",
    command: "npm run certify:platform-load -- --journey payment",
    threshold: { errorRateMax: 0.005, p95Ms: 3000, rpsMin: 3 },
    covers: ["finance", "payments"]
  },
  {
    id: "moderation_load",
    label: "Report submission",
    command: "npm run certify:production-journeys -- --only moderation",
    threshold: { errorRateMax: 0.01, p95Ms: 2000, rpsMin: 5 },
    covers: ["operations", "moderation"]
  },
  {
    id: "passport_sync_load",
    label: "Passport synchronization",
    command: "npm run certify:passport-journey",
    threshold: { errorRateMax: 0.01, p95Ms: 5000, queueDepthMax: 100 },
    covers: ["trust", "passport"]
  }
]);

export function buildLoadTestPlan() {
  return {
    generatedAt: new Date().toISOString(),
    scenarios: LOAD_TEST_SCENARIOS,
    prerequisites: [
      "Staging environment with production-like secrets",
      "Database migrated to latest version",
      "npm run certify:production PASS locally first"
    ],
    executionOrder: ["signup_burst", "matching_load", "messaging_load", "payment_load", "moderation_load", "passport_sync_load"],
    abortConditions: [
      "Error rate exceeds threshold for 3 consecutive minutes",
      "/ready returns 503",
      "Database connection pool exhausted"
    ]
  };
}
