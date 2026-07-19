import type { Gender, LookingFor } from "./index";

export type ExperienceIntent = "discover" | "discreet" | "concierge";

export type JourneyChapter = "welcome" | "intent" | "you" | "secure" | "profile" | "ready";

export type JourneyScreenId =
  | "j1-welcome"
  | "j2-intent"
  | "j3-name"
  | "j4-dob"
  | "j5-meet"
  | "j6-location";

export type JourneyDraft = {
  version: 1;
  screen: JourneyScreenId;
  experienceIntent?: ExperienceIntent;
  name?: string;
  dateOfBirth?: string;
  gender?: Gender;
  lookingFor?: LookingFor;
  state?: string;
  city?: string;
  updatedAt: string;
};

export const JOURNEY_DRAFT_VERSION = 1 as const;
