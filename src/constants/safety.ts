import type { DmControl, Gender, ReportReason, SafetySettings, WhoCanSignalMe, ActivityVisibility } from "../types";

export const REPORT_REASONS: { id: ReportReason; label: string; hint: string }[] = [
  { id: "fake_profile", label: "Fake profile", hint: "Photos or identity seem misleading" },
  { id: "harassment", label: "Harassment", hint: "Rude, threatening, or unwanted behaviour" },
  { id: "scam", label: "Scam", hint: "Asking for money, crypto, or suspicious links" },
  { id: "underage", label: "Underage", hint: "Person appears under 18" },
  { id: "unsafe_behavior", label: "Unsafe behaviour", hint: "Pressure to meet unsafely or share location" },
  { id: "explicit_content", label: "Explicit content", hint: "Unwanted sexual messages or images" },
  { id: "other", label: "Other", hint: "Something else that made you uncomfortable" }
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
  { id: "matches_only", label: "Matches only", hint: "Only after you accept a signal (recommended)" },
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
  dmPaused: "You've paused incoming messages. Turn this off in Safety settings to chat again."
} as const;

export function isFemaleGender(gender?: Gender): boolean {
  return gender === "Woman";
}

export const ACTIVITY_VISIBILITY_OPTIONS: { id: ActivityVisibility; label: string; hint: string }[] = [
  { id: "everyone", label: "Everyone", hint: "Anyone can see Active now / Active today on your card" },
  { id: "matches_only", label: "Matches only", hint: "Only people you've matched with see your activity" },
  { id: "nobody", label: "Nobody", hint: "Hide activity status completely" }
];

export function defaultSafetySettings(gender?: Gender): SafetySettings {
  if (isFemaleGender(gender)) {
    return {
      whoCanSignalMe: "verified_only",
      onlyMatchingPreferencesCanSignal: true,
      dmControl: "matches_only",
      hideFromDiscovery: false,
      activityVisibility: "matches_only"
    };
  }
  return {
    whoCanSignalMe: "everyone",
    onlyMatchingPreferencesCanSignal: false,
    dmControl: "everyone",
    hideFromDiscovery: false,
    activityVisibility: "matches_only"
  };
}
