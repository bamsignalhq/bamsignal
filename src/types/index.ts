import type { SignalConciergeStatus } from "../constants/signalConcierge";

export type Theme = "dark" | "light";

export type NavTab = "home" | "discover" | "likes" | "chats" | "me";

export type RelationshipIntentId =
  | "SeriousRelationship"
  | "Marriage"
  | "Friendship"
  | "Companionship"
  | "OpenToPossibilities"
  | "MeaningfulConversations";

/** Relationship intents + paid Fast Connection flag (not part of What Brings You Here). */
export type IntentTag = RelationshipIntentId | "Quickie";

export type Gender = "Man" | "Woman" | "Non-binary";

export type LookingFor = "Men" | "Women";

export type Religion =
  | "Christian"
  | "Muslim"
  | "Traditional"
  | "Other"
  | "Prefer not to say";

export type {
  BodyType,
  EthnicBackground,
  Genotype,
  HasKidsOption,
  KidsPreference,
  Occupation,
  RelationshipIntention,
  SocialLifestyle,
  VerificationPreference,
  WantsKidsOption
} from "../constants/profileOptions";
import type {
  BodyType,
  EthnicBackground,
  Genotype,
  HasKidsOption,
  KidsPreference,
  Occupation,
  RelationshipIntention,
  SocialLifestyle,
  VerificationPreference,
  WantsKidsOption
} from "../constants/profileOptions";

export type PreferenceMode = "flexible" | "strict";

export type WhoCanSignalMe = "everyone" | "verified_only" | "matches_preferences";

export type DmControl = "everyone" | "matches_only" | "verified_only" | "nobody";

export type ActivityVisibility = "everyone" | "connections_only" | "nobody";

/** @deprecated Use connections_only — kept for legacy stored profiles */
export type LegacyActivityVisibility = "everyone" | "matches_only" | "nobody";

export type SafetySettings = {
  /** Who may send you a signal */
  whoCanSignalMe: WhoCanSignalMe;
  /** Only people matching your match preferences can signal you */
  onlyMatchingPreferencesCanSignal: boolean;
  /** Who may message you after a signal is accepted */
  dmControl: DmControl;
  /** Hide profile from discovery (pause) */
  hideFromDiscovery?: boolean;
  /** Who can see your last active label */
  lastSeenVisibility?: ActivityVisibility;
  /** Who can see online status */
  onlineStatusVisibility?: ActivityVisibility;
  /** @deprecated Use lastSeenVisibility / onlineStatusVisibility */
  activityVisibility?: LegacyActivityVisibility | ActivityVisibility;
  /** When false, neither side sees read receipts in chat */
  readReceiptsEnabled?: boolean;
};

export type ReportReason =
  | "fake_profile"
  | "scammer"
  | "asking_for_money"
  | "harassment"
  | "sexual_content"
  | "impersonation"
  | "underage_account"
  | "off_platform_solicitation"
  | "abusive_language"
  | "spam"
  | "other"
  /** @deprecated legacy stored reports */
  | "inappropriate_photos"
  /** @deprecated legacy stored reports */
  | "underage";

export type ReportRecord = {
  profileId: string;
  reason: ReportReason;
  details?: string;
  at: string;
  blocked?: boolean;
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

export type MemberCompliance = {
  tosAccepted?: boolean;
  tosAcceptedAt?: string;
  tosVersion?: string;
  privacyAccepted?: boolean;
  privacyAcceptedAt?: string;
  privacyVersion?: string;
  ageConfirmed18?: boolean;
  ageConfirmedAt?: string;
  safetyPledgeAccepted?: boolean;
  safetyPledgeAcceptedAt?: string;
  safetyPledgeVersion?: string;
  adultRiskAcknowledged?: boolean;
  adultRiskAcknowledgedAt?: string;
  adultRiskVersion?: string;
  offlineSafetyAcknowledged?: boolean;
  offlineSafetyAcknowledgedAt?: string;
  offlineSafetyVersion?: string;
  signupIp?: string;
  signupUserAgent?: string;
};

export type VerificationReviewStatus = "none" | "pending" | "approved" | "rejected";

export type PhotoReviewStatus = "approved" | "pending_review" | "rejected" | "hidden";

export type PhotoRiskFlag =
  | "no_face_detected"
  | "possible_ai"
  | "possible_logo"
  | "text_heavy"
  | "document_like"
  | "qr_detected"
  | "contact_info_detected";

export type PhotoReviewMeta = {
  photoReviewStatus: PhotoReviewStatus;
  photoRiskFlags: PhotoRiskFlag[];
  type: "profile" | "cover";
  uploadedAt: string;
  rejectReason?: string;
};

export type DatingProfile = {
  photos: string[];
  /** Primary profile photo URL — used for avatars and cards */
  mainPhotoUrl?: string;
  /** Per-photo moderation metadata keyed by storage URL */
  photoMeta?: Record<string, PhotoReviewMeta>;
  /** Wide hero backdrop — separate from profile gallery photos */
  coverPhotoUrl?: string;
  /** Supabase storage path for cover replace/delete */
  coverPhotoPath?: string;
  /** ISO timestamp — cache bust + merge tie-breaker */
  coverPhotoUpdatedAt?: string;
  /** @deprecated use coverPhotoUrl — kept for legacy reads/writes */
  coverPhoto?: string;
  /** Set only when member explicitly adds cover in Profile (not signup). */
  coverPhotoExplicit?: boolean;
  age: number;
  /** ISO date YYYY-MM-DD — source of truth for age when set */
  dateOfBirth?: string;
  gender: Gender;
  state?: string;
  city: string;
  bio: string;
  /** Who the member wants to meet — canonical “interested in” field (saved as lookingFor). */
  lookingFor?: LookingFor;
  /** Set when member picks interested-in during onboarding; prevents gender-based auto overrides. */
  interestedInManuallyChanged?: boolean;
  intents: IntentTag[];
  /** Selected during onboarding/profile — activates after paid Fast Connection pass. */
  fastConnectionInterested?: boolean;
  /** Private matchmaking — excluded from Discover, search, and public surfaces. */
  signalConciergeMember?: boolean;
  signalConciergeStatus?: SignalConciergeStatus;
  interests: string[];
  /** True once member picks interests in the picker (prevents stale auto-filled chips during onboarding). */
  interestsTouched?: boolean;
  religion?: Religion;
  /** Tribe / ethnic background — primary value for matching and legacy clients */
  ethnicity?: EthnicBackground;
  /** Up to 3 tribes; first entry mirrors ethnicity when saved */
  ethnicities?: EthnicBackground[];
  stateOfOrigin?: string;
  statesOfOrigin?: string[];
  occupation?: Occupation;
  occupations?: Occupation[];
  genotype?: Genotype;
  genotypes?: Genotype[];
  kidsPreference?: KidsPreference;
  hasKidsOptions?: HasKidsOption[];
  wantsKidsOptions?: WantsKidsOption[];
  lifestyle?: SocialLifestyle;
  lifestyles?: SocialLifestyle[];
  bodyTypes?: BodyType[];
  voiceIntroUrl?: string;
  /** Seconds — stored with voice vibe recording */
  voiceIntroDuration?: number;
  voiceIntroUpdatedAt?: string;
  /** Member-facing alias fields — mirror voiceIntro* when saved */
  voiceVibeUrl?: string;
  voiceVibeDuration?: number;
  voiceVibeTranscript?: string;
  voiceVibeCreatedAt?: string;
  visibility?: ProfileVisibility;
  matchingPrivacy?: MatchingPrivacy;
  safetySettings?: SafetySettings;
  verified: boolean;
  premium: boolean;
  /** Selfie submitted for manual identity review */
  verificationSelfie?: string;
  verificationStatus?: VerificationReviewStatus;
  onboardingComplete?: boolean;
  /** Legacy / explicit setup completion marker stored in profile JSON */
  setupCompleted?: boolean;
  onboardingCompletedAt?: string;
  profileCompletedAt?: string;
  completedAt?: string;
  createdAt?: string;
  reportCount?: number;
  /** Optional profile prompt answers (max 3) */
  profilePrompts?: { prompt: string; answer: string }[];
  /** Local-only until synced */
  screenshotPrivacyNoticeSeen?: boolean;
  profilePausedAt?: string;
  /** Legal and safety acknowledgements */
  compliance?: MemberCompliance;
};

export type MatchPreferences = {
  religions: Religion[];
  ethnicities: EthnicBackground[];
  lifestyles: SocialLifestyle[];
  cities: string[];
  states: string[];
  statesOfOrigin: string[];
  intents: IntentTag[];
  occupations: Occupation[];
  genotypes: Genotype[];
  bodyTypes: BodyType[];
  relationshipIntentions: RelationshipIntention[];
  hasKids: HasKidsOption[];
  wantsKids: WantsKidsOption[];
  verificationPreferences: VerificationPreference[];
  ageMin?: number;
  ageMax?: number;
  distanceMax?: number;
  preferenceMode: PreferenceMode;
  /** Optional discover filter — More About Me item ids */
  moreAboutMe: string[];
  /** Premium — prioritize recently active profiles */
  onlineNow?: boolean;
  /** Premium — minimum compatibility % (65–99) */
  minCompatibility?: number;
  /** Premium — only profiles with voice intro */
  requireVoiceIntro?: boolean;
  /** @deprecated Use verificationPreferences */
  requireVerified?: boolean;
  kidsPreferences?: KidsPreference[];
};

export type SavedSearch = {
  id: string;
  label: string;
  resultCount?: number;
  ageMin: number;
  ageMax: number;
  state: string;
  city: string;
  advanced: HomeAdvancedFilters;
  savedAt: string;
};

export type HomeAdvancedFilters = {
  tribes: EthnicBackground[];
  religions: Religion[];
  occupations: Occupation[];
  statesOfOrigin: string[];
  relationshipIntentions: RelationshipIntention[];
  genotypes: Genotype[];
  hasKids: HasKidsOption[];
  wantsKids: WantsKidsOption[];
  bodyTypes: BodyType[];
  verificationPreferences: VerificationPreference[];
  /** @deprecated Use verificationPreferences */
  verifiedOnly?: boolean;
};

/** Home / Search filters — advanced keys apply only when the user selects them */
export type MemberSearchFilters = {
  state?: string;
  city?: string;
  cities?: string[];
  ageMin?: number;
  ageMax?: number;
  excludeProfileIds?: string[];
  tribes?: EthnicBackground[];
  religions?: Religion[];
  occupations?: Occupation[];
  statesOfOrigin?: string[];
  relationshipIntentions?: IntentTag[];
  genotypes?: Genotype[];
  kidsPreferences?: KidsPreference[];
  bodyTypes?: BodyType[];
  limit?: number;
};

export type DiscoverProfile = {
  id: string;
  name: string;
  age: number;
  gender?: Gender;
  lookingFor?: LookingFor;
  city: string;
  state?: string;
  bio: string;
  photo: string;
  photos?: string[];
  mainPhotoUrl?: string;
  intents: IntentTag[];
  interests?: string[];
  religion?: Religion;
  /** Tribe / ethnic background — primary value for matching and legacy clients */
  ethnicity?: EthnicBackground;
  /** Up to 3 tribes; first entry mirrors ethnicity when saved */
  ethnicities?: EthnicBackground[];
  stateOfOrigin?: string;
  statesOfOrigin?: string[];
  occupation?: Occupation;
  occupations?: Occupation[];
  genotype?: Genotype;
  genotypes?: Genotype[];
  kidsPreference?: KidsPreference;
  hasKidsOptions?: HasKidsOption[];
  wantsKidsOptions?: WantsKidsOption[];
  lifestyle?: SocialLifestyle;
  lifestyles?: SocialLifestyle[];
  bodyTypes?: BodyType[];
  voiceIntroUrl?: string;
  voiceIntroDuration?: number;
  voiceIntroUpdatedAt?: string;
  voiceVibeUrl?: string;
  voiceVibeDuration?: number;
  voiceVibeTranscript?: string;
  voiceVibeCreatedAt?: string;
  distanceKm?: number;
  verified: boolean;
  safetySettings?: SafetySettings;
  premium?: boolean;
  fastConnectionActive?: boolean;
  fastConnectionInterested?: boolean;
  signalConciergeMember?: boolean;
  signalConciergeStatus?: SignalConciergeStatus;
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

export type ContactExchangeStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "completed"
  | "cancelled"
  | "expired";

export type ContactExchangeShared = {
  whatsapp?: string;
  phone?: string;
  telegram?: string;
  instagram?: string;
};

export type ContactExchangeState = {
  status: ContactExchangeStatus;
  requesterUserKey?: string;
  recipientUserKey?: string;
  requestedAt?: string;
  respondedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  expiredAt?: string;
  contactSharingEnabled?: boolean;
  contactSharingDisabledAt?: string;
  contactSharingDisabledBy?: string;
  sharedContacts?: Record<string, ContactExchangeShared>;
};

export type ChatThread = {
  matchId: string;
  messages: ChatMessage[];
  contactExchange?: ContactExchangeState;
  offPlatformApproved?: boolean;
  pendingOffPlatformRequest?: boolean;
  offPlatformDeclined?: boolean;
  pinned?: boolean;
  readAt?: string;
  /** When the other person last read (if both allow read receipts) */
  peerSeenAt?: string;
};

export type LikeEntry = {
  id?: string;
  profileId: string;
  name: string;
  photo: string;
  city: string;
  at: string;
  superLike?: boolean;
  /** Optional UI enrichment — demo/local only */
  age?: number;
  message?: string;
  distanceKm?: number;
  state?: string;
  verified?: boolean;
};

export type AuthMode = "login" | "signup" | "verify" | "reset";

export type AuthMeta = {
  isNewSignup?: boolean;
  recovered?: boolean;
  loginEmail?: string;
};

export type DiscoverMode = "signals" | "radar" | "trending";
