export const TERMS_VERSION = "2026-06-18";
export const PRIVACY_VERSION = "2026-06-18";
export const SAFETY_PLEDGE_VERSION = "2026-06-18";

export const COMPLIANCE_SAVE_FAIL =
  "We couldn't save your confirmation. Please try again.";

export const SAFETY_PLEDGE_RULES = [
  "No scams or solicitation",
  "No harassment or abuse",
  "Respect privacy",
  "Never ask strangers for money",
  "Meet safely and use good judgment"
] as const;

export type ComplianceAckType = "terms" | "privacy" | "age_18" | "safety_pledge";
