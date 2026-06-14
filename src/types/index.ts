export type Theme = "dark" | "light";

export type NavTab = "home" | "discover" | "likes" | "chats" | "me";

export type IntentTag =
  | "Relationship"
  | "Friendship"
  | "Networking"
  | "Social Events"
  | "Chat";

export type Gender = "Man" | "Woman" | "Non-binary" | "Prefer not to say";

export type LookingFor = "Men" | "Women" | "Everyone";

export type Religion =
  | "Christian"
  | "Muslim"
  | "Traditional"
  | "Other"
  | "Prefer not to say";

export type { EthnicBackground, SocialLifestyle } from "../constants/profileOptions";
import type { EthnicBackground, SocialLifestyle } from "../constants/profileOptions";

export type PreferenceMode = "flexible" | "strict";

export type WhoCanSignalMe = "everyone" | "verified_only" | "matches_preferences";

export type DmControl = "everyone" | "matches_only" | "verified_only" | "nobody";

export type SafetySettings = {
  /** Who may send you a signal */
  whoCanSignalMe: WhoCanSignalMe;
  /** Only people matching your match preferences can signal you */
  onlyMatchingPreferencesCanSignal: boolean;
  /** Who may message you after a signal is accepted */
  dmControl: DmControl;
  /** Hide profile from discovery (pause) */
  hideFromDiscovery?: boolean;
};

export type ReportReason =
  | "fake_profile"
  | "harassment"
  | "scam"
  | "underage"
  | "unsafe_behavior"
  | "explicit_content"
  | "other";

export type ReportRecord = {
  profileId: string;
  reason: ReportReason;
  details?: string;
  at: string;
};

export type ProfileVisibility = {
  showReligion: boolean;
  showEthnicity: boolean;
  showState: boolean;
};

export type MatchingPrivacy = {
  useReligionForMatching: boolean;
  useEthnicityForMatching: boolean;
  useStateForMatching: boolean;
};

export type UserProfile = {
  name: string;
  username?: string;
  email: string;
  phone: string;
  avatar?: string;
  referralCode?: string;
  phoneVerified?: boolean;
};

export type DatingProfile = {
  photos: string[];
  age: number;
  gender: Gender;
  state?: string;
  city: string;
  bio: string;
  lookingFor: LookingFor;
  intents: IntentTag[];
  interests: string[];
  religion?: Religion;
  ethnicity?: EthnicBackground;
  stateOfOrigin?: string;
  lifestyle?: SocialLifestyle;
  voiceIntroUrl?: string;
  visibility?: ProfileVisibility;
  matchingPrivacy?: MatchingPrivacy;
  safetySettings?: SafetySettings;
  verified: boolean;
  premium: boolean;
  onboardingComplete?: boolean;
  createdAt?: string;
  reportCount?: number;
};

export type MatchPreferences = {
  religions: Religion[];
  ethnicities: EthnicBackground[];
  lifestyles: SocialLifestyle[];
  cities: string[];
  states: string[];
  intents: IntentTag[];
  ageMin?: number;
  ageMax?: number;
  distanceMax?: number;
  preferenceMode: PreferenceMode;
  /** Premium — prioritize recently active profiles */
  onlineNow?: boolean;
  /** Premium — minimum compatibility % (65–99) */
  minCompatibility?: number;
  /** Premium — only profiles with voice intro */
  requireVoiceIntro?: boolean;
  /** Premium — verified profiles only */
  requireVerified?: boolean;
};

export type DiscoverProfile = {
  id: string;
  name: string;
  age: number;
  gender?: Gender;
  lookingFor?: LookingFor;
  city: string;
  bio: string;
  photo: string;
  intents: IntentTag[];
  interests?: string[];
  religion?: Religion;
  ethnicity?: EthnicBackground;
  stateOfOrigin?: string;
  lifestyle?: SocialLifestyle;
  voiceIntroUrl?: string;
  distanceKm?: number;
  verified: boolean;
  safetySettings?: SafetySettings;
  premium?: boolean;
  createdAt?: string;
  lastActiveAt?: string;
  isFoundingMember?: boolean;
};

export type RadarNode = {
  id: string;
  name: string;
  age: number;
  distanceKm: number;
  photo: string;
  x: number;
  y: number;
};

export type Match = {
  id: string;
  profileId: string;
  name: string;
  photo: string;
  matchedAt: string;
  city: string;
  lastActiveAt?: string;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
  blocked?: boolean;
};

export type ChatThread = {
  matchId: string;
  messages: ChatMessage[];
  offPlatformApproved?: boolean;
  pendingOffPlatformRequest?: boolean;
  offPlatformDeclined?: boolean;
};

export type LikeEntry = {
  profileId: string;
  name: string;
  photo: string;
  city: string;
  at: string;
  superLike?: boolean;
};

export type AuthMode = "login" | "signup" | "verify" | "reset";

export type AuthMeta = {
  isNewSignup?: boolean;
};

export type DiscoverMode = "signals" | "radar" | "trending";
