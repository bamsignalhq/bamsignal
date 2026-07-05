import type { ReportReason } from "../types";

export const COMMUNITY_TRUST_MISSION =
  "Make BamSignal one of the safest social platforms in Nigeria — trust is the product.";

export type CommunityTrustHubSectionId =
  | "safety_tips"
  | "blocked_users"
  | "reports"
  | "verification"
  | "emergency_help"
  | "trust_education";

export type CommunityTrustReportId =
  | "fake_account"
  | "harassment"
  | "spam"
  | "scam"
  | "inappropriate_content"
  | "underage"
  | "impersonation";

export type SafetyInteractionId = "block" | "mute" | "hide" | "restrict";

export type TrustEducationTopicId = "trust_score" | "verification" | "community_standards";

export const COMMUNITY_TRUST_HUB_SECTIONS: {
  id: CommunityTrustHubSectionId;
  label: string;
  summary: string;
}[] = [
  { id: "safety_tips", label: "Safety Tips", summary: "Meet safely, avoid fraud, protect privacy" },
  { id: "blocked_users", label: "Blocked Users", summary: "People you have blocked" },
  { id: "reports", label: "Reports", summary: "Reports you have submitted" },
  { id: "verification", label: "Verification", summary: "Build trust with phone and profile checks" },
  { id: "emergency_help", label: "Emergency Help", summary: "Nigeria emergency contacts" },
  { id: "trust_education", label: "Trust & Standards", summary: "How trust, verification, and standards work" },
];

/** Milestone report types mapped to stored ReportReason ids */
export const COMMUNITY_TRUST_REPORT_REASONS: {
  id: CommunityTrustReportId;
  label: string;
  hint: string;
  reasons: ReportReason[];
}[] = [
  {
    id: "fake_account",
    label: "Fake Account",
    hint: "Misleading photos or identity",
    reasons: ["fake_profile"],
  },
  {
    id: "harassment",
    label: "Harassment",
    hint: "Threatening or unwanted behaviour",
    reasons: ["harassment", "abusive_language"],
  },
  {
    id: "spam",
    label: "Spam",
    hint: "Unwanted promotional messages",
    reasons: ["spam"],
  },
  {
    id: "scam",
    label: "Scam",
    hint: "Fraud, money requests, or off-platform pressure",
    reasons: ["scammer", "asking_for_money", "off_platform_solicitation"],
  },
  {
    id: "inappropriate_content",
    label: "Inappropriate Content",
    hint: "Unwanted sexual content or media",
    reasons: ["sexual_content", "inappropriate_photos"],
  },
  {
    id: "underage",
    label: "Underage",
    hint: "Person appears under 18",
    reasons: ["underage_account", "underage"],
  },
  {
    id: "impersonation",
    label: "Impersonation",
    hint: "Pretending to be someone else",
    reasons: ["impersonation"],
  },
];

export const SAFETY_INTERACTIONS: {
  id: SafetyInteractionId;
  label: string;
  description: string;
}[] = [
  {
    id: "block",
    label: "Block",
    description: "Stop all contact — they cannot signal or message you.",
  },
  {
    id: "mute",
    label: "Mute",
    description: "Silence notifications from this person without blocking.",
  },
  {
    id: "hide",
    label: "Hide",
    description: "Remove them from your discovery feed.",
  },
  {
    id: "restrict",
    label: "Restrict",
    description: "Limit signals and messages without a full block.",
  },
];

export const TRUST_EDUCATION_TOPICS: {
  id: TrustEducationTopicId;
  title: string;
  body: string;
}[] = [
  {
    id: "trust_score",
    title: "Trust Score",
    body:
      "BamSignal uses a private trust score to rank discovery and protect the community. It rewards complete profiles, verification, and respectful behaviour — and lowers visibility for reports and inactivity. You never see a numeric score; you see the result: better matches and safer feeds.",
  },
  {
    id: "verification",
    title: "Verification",
    body:
      "Verified members complete phone checks and profile review. Verification unlocks trust badges, priority in recommendations, and access to members who only accept verified signals.",
  },
  {
    id: "community_standards",
    title: "Community Standards",
    body:
      "Every member agrees to respect boundaries, report scams, and meet safely. Reports are reviewed by our team. Repeat offenders lose visibility or access. Full guidelines live in Community Guidelines and Terms.",
  },
];

export const NIGERIA_EMERGENCY_CONTACTS = [
  { label: "Police Emergency", number: "112", tel: "112" },
  { label: "Lagos Emergency (767)", number: "767", tel: "767" },
  { label: "Federal Fire Service", number: "112", tel: "112" },
] as const;

export const COMMUNITY_TRUST_SAFETY_TIPS = [
  {
    title: "Meet in public",
    body: "Choose a public place and tell someone you trust where you are going.",
  },
  {
    title: "Never send money",
    body: "Report anyone asking for transfers, airtime, crypto, or gifts.",
  },
  {
    title: "Protect OTP codes",
    body: "BamSignal will never ask for your login or verification codes.",
  },
  {
    title: "Block and report",
    body: "If something feels wrong, block immediately and report from their profile.",
  },
  {
    title: "Trust your instincts",
    body: "You can pause DMs, hide from discovery, and control who signals you.",
  },
] as const;
