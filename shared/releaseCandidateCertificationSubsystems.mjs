/** Release Candidate Certification™ — master subsystem registry. */

export const RC_CERT_SUBSYSTEMS = [
  { id: "qa", label: "QA", certPath: null },
  { id: "security", label: "Security", certPath: "certification/security/reports/latest.json", scoreKey: "securityScore", passedKey: "passed", certify: "certify:security" },
  { id: "performance", label: "Performance", certPath: "certification/performance/reports/latest.json", scoreKey: "performanceScore", passedKey: "passed", certify: "certify:performance" },
  { id: "reliability", label: "Reliability", certPath: "certification/reliability/reports/latest.json", scoreKey: "reliabilityScore", passedKey: "passed", certify: "certify:reliability" },
  { id: "data-integrity", label: "Data Integrity", certPath: "certification/data-integrity/reports/latest.json", scoreKey: "integrityScore", passedKey: "passed", certify: "certify:data-integrity" },
  { id: "database", label: "Database", certPath: "certification/database/reports/latest.json", scoreKey: "riskScore", passedKey: "passed", certify: "certify:database" },
  { id: "dependencies", label: "Dependencies", certPath: "certification/dependencies/reports/latest.json", scoreKey: "dependencyScore", passedKey: "passed", certify: "certify:dependencies" },
  { id: "operational-drift", label: "Operational Drift", certPath: "certification/drift/reports/latest.json", scoreKey: "driftScore", passedKey: "passed", certify: "certify:drift" },
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
  { id: "founder-certification", label: "Founder Certification", certPath: "certification/founder/reports/latest.json", scoreKey: "overallScore", passedKey: "passed", certify: "certify:founder" }
];

export const RC_CERT_DECISIONS = {
  go: "GO",
  "go-with-conditions": "GO WITH CONDITIONS",
  "no-go": "NO GO"
};

export const RC_CERT_BLOCK_ON_NO_GO = true;
