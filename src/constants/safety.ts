import type { DmControl, Gender, ReportReason, SafetySettings, WhoCanSignalMe, ActivityVisibility } from "../types";

export const BACKGROUND_CHECK_DISCLAIMER =
  "BamSignal does not conduct criminal background checks on users. Users are responsible for exercising caution and making safe decisions when interacting with others online or offline. BamSignal is not responsible for the conduct of users outside the platform.";

export const REPORT_REASONS: { id: ReportReason; label: string; hint: string }[] = [
  { id: "fake_profile", label: "Fake profile", hint: "Photos or identity seem misleading" },
  { id: "scammer", label: "Scammer", hint: "Suspicious behaviour or fraud attempts" },
  { id: "asking_for_money", label: "Asking for money", hint: "Requests for cash, transfers, or gifts" },
  { id: "harassment", label: "Harassment", hint: "Rude, threatening, or unwanted behaviour" },
  { id: "sexual_content", label: "Sexual content", hint: "Unwanted sexual messages or images" },
  { id: "impersonation", label: "Impersonation", hint: "Pretending to be someone else" },
  { id: "underage_account", label: "Underage account", hint: "Person appears under 18" },
  {
    id: "off_platform_solicitation",
    label: "Off-platform solicitation",
    hint: "Pressure to chat or pay outside BamSignal"
  },
  { id: "abusive_language", label: "Abusive language", hint: "Hate speech or severe insults" },
  { id: "spam", label: "Spam", hint: "Repeated or unwanted promotional messages" },
  { id: "other", label: "Other", hint: "Add a short note below" }
];

/** Panic flow uses a focused subset — same ids, shorter list in UI. */
export const PANIC_REPORT_REASONS = REPORT_REASONS.filter((item) =>
  [
    "fake_profile",
    "scammer",
    "asking_for_money",
    "harassment",
    "sexual_content",
    "impersonation",
    "underage_account",
    "off_platform_solicitation",
    "other"
  ].includes(item.id)
);

const LEGACY_REASON_LABELS: Partial<Record<ReportReason, string>> = {
  inappropriate_photos: "Sexual content",
  underage: "Underage account"
};

export function reportReasonLabel(reason: ReportReason): string {
  return REPORT_REASONS.find((item) => item.id === reason)?.label || LEGACY_REASON_LABELS[reason] || reason.replace(/_/g, " ");
}

export const SAFETY_CENTER_SECTIONS = [
  {
    title: "Meet Safely",
    body: "Meet in public places and tell someone you trust."
  },
  {
    title: "Never Send Money",
    body: "BamSignal will never ask you to send money to another user."
  },
  {
    title: "Avoid OTP Fraud",
    body: "Never share verification codes or login codes."
  },
  {
    title: "Protect Your Privacy",
    body: "Do not rush to share personal information."
  },
  {
    title: "Block & Report",
    body: "If someone makes you uncomfortable, block and report them immediately."
  }
] as const;

export const WHO_CAN_SIGNAL_OPTIONS: { id: WhoCanSignalMe; label: string; hint: string }[] = [
  { id: "everyone", label: "Everyone", hint: "Any verified BamSignal member can signal you" },
  {
    id: "verified_only",
    label: "Verified members only",
    hint: "Only phone + selfie verified profiles can signal you"
  },
  {
    id: "matches_preferences",
    label: "Preference matches only",
    hint: "Only people who fit your match preferences can signal you"
  }
];

export const DM_CONTROL_OPTIONS: { id: DmControl; label: string; hint: string }[] = [
  { id: "everyone", label: "Open inbox", hint: "Matched connections can message you" },
  { id: "matches_only", label: "Connections only", hint: "Only after you accept a signal (recommended)" },
  { id: "verified_only", label: "Verified only", hint: "Only verified members can message you" },
  { id: "nobody", label: "Pause DMs", hint: "Temporarily stop new messages — existing chats stay visible" }
];

export const FEMALE_SAFETY_COPY = {
  onboardingTitle: "Your safety, your rules",
  onboardingBody:
    "BamSignal is built with women in mind. These settings are optional — change them anytime in Profile → Safety.",
  dashboardTitle: "Safety centre",
  dashboardBody:
    "You're in control. Report, block, or restrict who can signal and message you — instantly.",
  reportConfirm: "Thank you. Our team reviews every report. You can also block this person.",
  signalBlocked: "This person has restricted who can signal them.",
  dmPaused: "You've paused incoming messages. Turn this off in Safety settings to chat again.",
  screenshotNotice: "Respect privacy and keep conversations safe."
} as const;

export function isFemaleGender(gender?: Gender): boolean {
  return gender === "Woman";
}

export const PRIVACY_VISIBILITY_OPTIONS: { id: ActivityVisibility; label: string; hint: string }[] = [
  { id: "everyone", label: "Everyone", hint: "Any member can see this" },
  { id: "connections_only", label: "Connections only", hint: "Only people you've connected with" },
  { id: "nobody", label: "Nobody", hint: "Hidden completely" }
];

/** @deprecated */
export const ACTIVITY_VISIBILITY_OPTIONS = PRIVACY_VISIBILITY_OPTIONS;

export function normalizePrivacyVisibility(
  value?: ActivityVisibility | "matches_only"
): ActivityVisibility {
  if (value === "matches_only") return "connections_only";
  if (value === "everyone" || value === "connections_only" || value === "nobody") return value;
  return "connections_only";
}

export function defaultSafetySettings(gender?: Gender): SafetySettings {
  const base: SafetySettings = {
    whoCanSignalMe: "everyone",
    onlyMatchingPreferencesCanSignal: false,
    dmControl: "everyone",
    hideFromDiscovery: false,
    lastSeenVisibility: "connections_only",
    onlineStatusVisibility: "connections_only",
    readReceiptsEnabled: true
  };

  if (isFemaleGender(gender)) {
    return {
      ...base,
      whoCanSignalMe: "verified_only",
      onlyMatchingPreferencesCanSignal: true,
      dmControl: "matches_only"
    };
  }
  return base;
}