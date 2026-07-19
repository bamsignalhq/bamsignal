import type { JourneyChapter, JourneyScreenId } from "../types/journey";

export const JOURNEY_SCREENS: JourneyScreenId[] = [
  "j1-welcome",
  "j2-intent",
  "j3-name",
  "j4-dob",
  "j5-meet",
  "j6-location"
];

export const JOURNEY_SCREEN_CHAPTER: Record<JourneyScreenId, JourneyChapter> = {
  "j1-welcome": "welcome",
  "j2-intent": "intent",
  "j3-name": "you",
  "j4-dob": "you",
  "j5-meet": "you",
  "j6-location": "you"
};

export const JOURNEY_STRENGTH: Record<JourneyScreenId, { fill: number; label: string; hint: string }> = {
  "j1-welcome": { fill: 8, label: "Starting your journey", hint: "" },
  "j2-intent": { fill: 18, label: "Building your journey", hint: "Choose how you want to meet." },
  "j3-name": { fill: 32, label: "Your profile is taking shape", hint: "Just you — one step at a time." },
  "j4-dob": { fill: 42, label: "Your profile is taking shape", hint: "" },
  "j5-meet": { fill: 52, label: "Your profile is taking shape", hint: "" },
  "j6-location": { fill: 68, label: "Almost ready", hint: "" }
};

export const JOURNEY_GUIDE: Partial<Record<JourneyScreenId, string>> = {
  "j4-dob": "Almost there.",
  "j5-meet": "You're doing great.",
  "j6-location": "Ready?"
};

export const JOURNEY_TRUST: Partial<Record<JourneyScreenId, string>> = {
  "j1-welcome": "Your privacy comes first.",
  "j2-intent": "No payment on this step.",
  "j3-name": "This is how people will know you.",
  "j4-dob": "We use this to keep BamSignal adult and accurate.",
  "j5-meet": "Built for meaningful matches, not noise.",
  "j6-location": "We use this to recommend people near you."
};

export const JOURNEY_MIN_AGE = 18;

export function prevJourneyScreen(current: JourneyScreenId): JourneyScreenId | null {
  const index = JOURNEY_SCREENS.indexOf(current);
  if (index <= 0) return null;
  return JOURNEY_SCREENS[index - 1] ?? null;
}
