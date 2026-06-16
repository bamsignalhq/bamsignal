import type { DmControl, Gender, ReportReason, SafetySettings, WhoCanSignalMe, ActivityVisibility } from "../types";

export const REPORT_REASONS: { id: ReportReason; label: string; hint: string }[] = [
  { id: "fake_profile", label: "Fake profile", hint: "Photos or identity seem misleading" },
  { id: "harassment", label: "Harassment", hint: "Rude, threatening, or unwanted behaviour" },
  { id: "spam", label: "Spam", hint: "Repeated or unwanted promotional messages" },
  { id: "inappropriate_photos", label: "Inappropriate photos", hint: "Sexual or offensive images" },
  { id: "underage", label: "Underage concern", hint: "Person appears under 18" },
  {
    id: "off_platform_solicitation",
    label: "Off-platform solicitation",
    hint: "Pressure to chat or pay outside BamSignal"
  },
  { id: "scammer", label: "Scammer", hint: "Money requests, crypto, or suspicious links" },
  { id: "other", label: "Other", hint: "Add a short note below" }
];

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
