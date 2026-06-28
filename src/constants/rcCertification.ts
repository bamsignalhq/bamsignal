import type { RcCertificationSubsystemId } from "../types/rcCertification";

export const RC_CERTIFICATION_SUBSYSTEMS: Array<{
  id: RcCertificationSubsystemId;
  label: string;
}> = [
  { id: "qa", label: "QA" },
  { id: "security", label: "Security" },
  { id: "performance", label: "Performance" },
  { id: "reliability", label: "Reliability" },
  { id: "data-integrity", label: "Data Integrity" },
  { id: "database", label: "Database" },
  { id: "dependencies", label: "Dependencies" },
  { id: "operational-drift", label: "Operational Drift" },
  { id: "observability", label: "Observability" },
  { id: "platform-health", label: "Platform Health" },
  { id: "notifications", label: "Notifications" },
  { id: "payments", label: "Payments" },
  { id: "otp", label: "OTP" },
  { id: "feature-flags", label: "Feature Flags" },
  { id: "remote-config", label: "Remote Config" },
  { id: "backups", label: "Backups" },
  { id: "release-management", label: "Release Management" },
  { id: "launch-readiness", label: "Launch Readiness" },
  { id: "founder-certification", label: "Founder Certification" }
];

export const RC_CERTIFICATION_DECISIONS = {
  go: "GO",
  "go-with-conditions": "GO WITH CONDITIONS",
  "no-go": "NO GO"
} as const;

export const RC_CERTIFICATION_RELEASE_RULE =
  "Official production release requires CERTIFICATION_PROFILE=production RC GO with fresh staging integration reports; local runs are advisory only.";
