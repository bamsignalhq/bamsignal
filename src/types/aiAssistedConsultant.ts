export type AIAssistedDraftItem = {
  id: string;
  label: string;
  body: string;
  capability: string;
  requiresReview: true;
};

export type AIAssistedInsight = {
  id: string;
  title: string;
  detail: string;
  tone: "neutral" | "attention" | "positive";
};

export type AIAssistedQuestion = {
  id: string;
  question: string;
  context: string;
};

export type AIAssistedMeetingPrep = {
  memberName: string;
  scheduledHint?: string;
  focusAreas: string[];
  priorThemes: string[];
  consultantReminders: string[];
};

export type AIAssistedMemberBundle = {
  memberId: string;
  memberName: string;
  summary: string;
  insights: AIAssistedInsight[];
  compatibilityObservations: AIAssistedDraftItem[];
  suggestedQuestions: AIAssistedQuestion[];
  meetingPreparation: AIAssistedMeetingPrep;
  journeySummary: AIAssistedDraftItem[];
  followUpSuggestions: AIAssistedDraftItem[];
  relationshipHealth: AIAssistedDraftItem[];
  updatedAt: string;
};

export type AIAssistedWorkspaceBundle = {
  members: { id: string; name: string; status: string }[];
  selected: AIAssistedMemberBundle | null;
  updatedAt: string;
};
