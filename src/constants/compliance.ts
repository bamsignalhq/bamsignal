export const TERMS_VERSION = "2026-06-18";
export const PRIVACY_VERSION = "2026-06-18";
export const SAFETY_PLEDGE_VERSION = "2026-06-18";
export const ADULT_RISK_VERSION = "2026-06-18";
export const OFFLINE_SAFETY_VERSION = "2026-06-18";

export const COMPLIANCE_SAVE_FAIL =
  "We couldn't save your confirmation. Please try again.";

export const SAFETY_PLEDGE_RULES = [
  "No scams or solicitation",
  "No harassment or abuse",
  "Respect privacy",
  "Never ask strangers for money",
  "Meet safely and use good judgment"
] as const;

export type ComplianceAckType =
  | "terms"
  | "privacy"
  | "age_18"
  | "safety_pledge"
  | "adult_risk"
  | "offline_safety";

export const ADULT_RISK_COPY = {
  title: "Never send money",
  body:
    "Romance scams are real. Never send money, airtime, gift cards, or bank details to someone you met on BamSignal — even if their story sounds urgent.",
  bullets: [
    "BamSignal will never ask you to pay outside the app",
    "Report anyone who asks for money or investments",
    "You are responsible for your own safety and judgment"
  ],
  cta: "I Understand"
} as const;

export const OFFLINE_SAFETY_COPY = {
  title: "Meet Safely ❤️",
  bullets: [
    "Meet in a public place",
    "Tell someone you trust",
    "Arrange your own transportation",
    "Never send money",
    "Leave if anything feels wrong"
  ],
  cta: "I Understand"
} as const;
