import type {
  SignalConciergeConsultationChannel,
  SignalConciergeStatus,
  SignalConciergeTierId
} from "../constants/signalConcierge";

export type SignalConciergeAboutYou = {
  name: string;
  age: string;
  gender: string;
  city: string;
  occupation: string;
  education: string;
  religion: string;
  maritalStatus: string;
  children: string;
};

export type SignalConciergeRelationshipGoals = {
  whatHopingToFind?: string;
  marriageTimeline: string;
  childrenPreference?: string;
  partnerAgeRange?: string;
  partnerLocation?: string;
  dealBreakers: string;
  /** @deprecated use whatHopingToFind */
  partnerPreferences?: string;
  /** @deprecated use childrenPreference */
  familyGoals?: string;
};

export type SignalConciergeValuesLifestyle = {
  faithImportance: string;
  smoking: string;
  drinking: string;
  fitness: string;
  travel: string;
  loveLanguage: string;
  threeWords: string;
};

export type SignalConciergeStory = {
  whatMakesYouUnique: string;
  whatYouHopeToBuild: string;
  idealRelationship?: string;
  whatYouValueMost?: string;
  /** @deprecated legacy draft field */
  longFormStory?: string;
};

export type SignalConciergeVoiceVibe = {
  url?: string;
  duration?: number;
  transcript?: string;
  completed: boolean;
};

export type SignalConciergeVideoIntro = {
  url?: string;
  duration?: number;
  completed: boolean;
};

export type SignalConciergeConsultationPreferences = {
  preferredChannel?: SignalConciergeConsultationChannel;
  preferredDays: string;
  preferredTimeRange: string;
  additionalNotes: string;
};

export type SignalConciergeIdentity = {
  governmentIdNote: string;
  selfieVerified: boolean;
  linkedIn?: string;
  instagram?: string;
};

export type SignalConciergeApplication = {
  id: string;
  /** Permanent — assigned once at application start, never changed. */
  journeyId?: string;
  createdAt: string;
  updatedAt: string;
  status: SignalConciergeStatus;
  preferredTier?: SignalConciergeTierId;
  aboutYou: SignalConciergeAboutYou;
  relationshipGoals: SignalConciergeRelationshipGoals;
  valuesLifestyle: SignalConciergeValuesLifestyle;
  story: SignalConciergeStory;
  voiceVibe: SignalConciergeVoiceVibe;
  videoIntro: SignalConciergeVideoIntro;
  identity: SignalConciergeIdentity;
  consultationPreference?: SignalConciergeConsultationChannel;
  consultationPreferences?: SignalConciergeConsultationPreferences;
  consultationScheduledAt?: string;
  invitationCode?: string;
};

export type SignalConciergeApplicationDraft = Partial<SignalConciergeApplication> & {
  wizardStep?: number;
  savedAt?: string;
};

/** Future consultant dashboard models — not implemented. */
export type SignalConciergeConsultant = {
  id: string;
  name: string;
  title: string;
  regions: string[];
  seniority: "consultant" | "senior" | "specialist";
  active: boolean;
};

export type SignalConciergePrivateNote = {
  id: string;
  memberId: string;
  consultantId: string;
  body: string;
  createdAt: string;
};

export type SignalConciergeCompatibilityNote = {
  id: string;
  memberId: string;
  consultantId: string;
  summary: string;
  alignmentScore?: number;
  createdAt: string;
};

export type SignalConciergeIntroductionRecord = {
  id: string;
  memberAId: string;
  memberBId: string;
  consultantId: string;
  status: "proposed" | "accepted" | "declined" | "completed";
  consentedAt?: string;
  createdAt: string;
};

export type SignalConciergeMediaReview = {
  id: string;
  memberId: string;
  mediaType: "voice-vibe" | "video-intro" | "photo";
  status: "pending" | "approved" | "needs-update";
  notes?: string;
  reviewedAt?: string;
};

export type SignalConciergeDoNotMatchFlag = {
  id: string;
  memberAId: string;
  memberBId: string;
  reason: string;
  createdAt: string;
};

export type SignalConciergeTimelineEvent = {
  id: string;
  memberId: string;
  type: string;
  label: string;
  at: string;
};

export type SignalConciergeFollowUpReminder = {
  id: string;
  memberId: string;
  consultantId: string;
  dueAt: string;
  note: string;
  completed: boolean;
};

export type SignalConciergeSuccessStory = {
  id: string;
  headline: string;
  summary: string;
  published: boolean;
};

export function emptySignalConciergeApplication(): SignalConciergeApplication {
  const now = new Date().toISOString();
  return {
    id: `sc_${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    status: "applied",
    aboutYou: {
      name: "",
      age: "",
      gender: "",
      city: "",
      occupation: "",
      education: "",
      religion: "",
      maritalStatus: "",
      children: ""
    },
    relationshipGoals: {
      whatHopingToFind: "",
      marriageTimeline: "",
      childrenPreference: "",
      partnerAgeRange: "",
      partnerLocation: "",
      dealBreakers: ""
    },
    valuesLifestyle: {
      faithImportance: "",
      smoking: "",
      drinking: "",
      fitness: "",
      travel: "",
      loveLanguage: "",
      threeWords: ""
    },
    story: {
      whatMakesYouUnique: "",
      whatYouHopeToBuild: "",
      idealRelationship: "",
      whatYouValueMost: ""
    },
    voiceVibe: { completed: false },
    videoIntro: { completed: false },
    identity: {
      governmentIdNote: "",
      selfieVerified: false
    }
  };
}
