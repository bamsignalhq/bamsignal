/** Founder Launch Certification™ — master subsystem registry. */

export const FOUNDER_CERT_SUBSYSTEMS = [
  { id: "qa", label: "QA" },
  { id: "security", label: "Security" },
  { id: "performance", label: "Performance" },
  { id: "reliability", label: "Reliability" },
  { id: "observability", label: "Observability" },
  { id: "platform-health", label: "Platform Health" },
  { id: "payments", label: "Payments" },
  { id: "otp", label: "OTP" },
  { id: "messaging", label: "Messaging" },
  { id: "notifications", label: "Notifications" },
  { id: "concierge", label: "Concierge" },
  { id: "abuse-protection", label: "Abuse Protection" },
  { id: "readiness", label: "Readiness" },
  { id: "release", label: "Release" },
  { id: "backup", label: "Backup" },
  { id: "governance", label: "Governance" },
  { id: "api", label: "API" },
  { id: "feature-flags", label: "Feature Flags" },
  { id: "remote-config", label: "Remote Config" }
];

export const FOUNDER_CERT_DECISIONS = {
  go: "GO",
  "go-with-conditions": "GO WITH CONDITIONS",
  "no-go": "NO GO"
};

export const FOUNDER_CERT_BLOCK_ON_NO_GO = true;
