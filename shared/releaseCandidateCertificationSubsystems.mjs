/** Release Candidate Certification™ — master subsystem registry. */

export const RC1_LABEL = "RC1";

export const RC_CERT_SUBSYSTEMS = [
  { id: "qa", label: "QA", certPath: null },
  { id: "security", label: "Security", certPath: "certification/security/reports/latest.json", scoreKey: "securityScore", passedKey: "passed", certify: "certify:security" },
  { id: "penetration", label: "Penetration", certPath: "certification/penetration/reports/latest.json", scoreKey: "penetrationScore", passedKey: "passed", certify: "certify:production-penetration" },
  { id: "performance", label: "Performance", certPath: "certification/performance/reports/latest.json", scoreKey: "performanceScore", passedKey: "passed", certify: "certify:performance" },
  { id: "platform-load", label: "Platform Load", certPath: "certification/platform-load/reports/latest.json", scoreKey: "loadScore", passedKey: "passed", certify: "certify:platform-load" },
  { id: "reliability", label: "Reliability", certPath: "certification/reliability/reports/latest.json", scoreKey: "reliabilityScore", passedKey: "passed", certify: "certify:reliability" },
  { id: "chaos", label: "Chaos Engineering", certPath: "certification/chaos/reports/latest.json", scoreKey: "chaosScore", passedKey: "passed", certify: "certify:chaos" },
  { id: "data-integrity", label: "Data Integrity", certPath: "certification/data-integrity/reports/latest.json", scoreKey: "integrityScore", passedKey: "passed", certify: "certify:data-integrity" },
  { id: "database", label: "Database", certPath: "certification/database/reports/latest.json", scoreKey: "riskScore", passedKey: "passed", certify: "certify:database" },
  { id: "dependencies", label: "Dependencies", certPath: "certification/dependencies/reports/latest.json", scoreKey: "dependencyScore", passedKey: "passed", certify: "certify:dependencies" },
  { id: "operational-drift", label: "Operational Drift", certPath: "certification/drift/reports/latest.json", scoreKey: "driftScore", passedKey: "passed", certify: "certify:drift" },
  { id: "accessibility", label: "Accessibility", certPath: "certification/accessibility/reports/latest.json", scoreKey: "accessibilityScore", passedKey: "passed", certify: "certify:accessibility" },
  { id: "production-smoke", label: "Production Smoke", certPath: "certification/production-smoke/reports/latest.json", scoreKey: "smokeScore", passedKey: "passed", certify: "smoke:production" },
  { id: "observability", label: "Observability", certPath: null },
  { id: "platform-health", label: "Platform Health", certPath: null },
  { id: "notifications", label: "Notifications", certPath: null },
  { id: "payments", label: "Payments", certPath: null },
  { id: "otp", label: "OTP", certPath: null },
  { id: "feature-flags", label: "Feature Flags", certPath: null },
  { id: "remote-config", label: "Remote Config", certPath: null },
  { id: "backups", label: "Backups", certPath: null },
  { id: "release-management", label: "Release Management", certPath: null },
  { id: "launch-readiness", label: "Launch Readiness", certPath: null },
  { id: "founder-certification", label: "Founder Certification", certPath: "certification/founder/reports/latest.json", scoreKey: "overallScore", passedKey: "passed", certify: "certify:founder" },
  { id: "founder-experience", label: "Founder Experience", certPath: "certification/founder-experience/reports/latest.json", scoreKey: null, passedKey: "passed", certify: "founder-experience" }
];

/** RC1 executive domain pillars — aggregate subsystem scores for the final report. */
export const RC1_DOMAIN_PILLARS = [
  {
    id: "architecture",
    label: "Architecture",
    subsystemIds: ["dependencies", "database", "data-integrity", "operational-drift"]
  },
  {
    id: "security",
    label: "Security",
    subsystemIds: ["security", "penetration"]
  },
  {
    id: "performance",
    label: "Performance",
    subsystemIds: ["performance", "platform-load"]
  },
  {
    id: "reliability",
    label: "Reliability",
    subsystemIds: ["reliability", "chaos"]
  },
  {
    id: "operations",
    label: "Operations",
    subsystemIds: ["observability", "platform-health", "notifications", "production-smoke"]
  },
  {
    id: "governance",
    label: "Governance",
    subsystemIds: ["backups", "release-management", "launch-readiness"]
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    subsystemIds: ["feature-flags", "remote-config", "payments", "otp"]
  },
  {
    id: "qa",
    label: "QA",
    subsystemIds: ["qa", "accessibility"]
  },
  {
    id: "founder-acceptance",
    label: "Founder Acceptance",
    subsystemIds: ["founder-certification", "founder-experience", "founder-acceptance"]
  }
];

export const RC_CERT_DECISIONS = {
  go: "GO",
  "go-with-conditions": "GO WITH CONDITIONS",
  "no-go": "NO GO"
};

export const RC_CERT_BLOCK_ON_NO_GO = true;

export function buildRc1Number(buildMeta, runId) {
  return `${RC1_LABEL}-${buildMeta.buildVersion}-${buildMeta.buildCode}-${runId}`;
}
