export const TERMS_VERSION = "2026-06-18";
export const PRIVACY_VERSION = "2026-06-18";
export const SAFETY_PLEDGE_VERSION = "2026-06-25";
export const OFFLINE_SAFETY_VERSION = "2026-06-25";

export const COMPLIANCE_SAVE_FAIL =
  "We couldn't save your confirmation. Please try again.";

export const SAFETY_PLEDGE_RULES = [
  "No scams or solicitation",
  "No harassment or abuse",
  "Respect privacy",
  "Meet safely and use good judgment"
] as const;

export type ComplianceAckType =
  | "terms"
  | "privacy"
  | "age_18"
  | "safety_pledge"
  | "offline_safety";

export const OFFLINE_SAFETY_COPY = {
  title: "Meet Safely ❤️",
  bullets: [
    "Meet in a public place",
    "Tell someone you trust",
    "Arrange your own transportation",
    "Leave if anything feels wrong"
  ],
  cta: "I Understand"
} as const;
