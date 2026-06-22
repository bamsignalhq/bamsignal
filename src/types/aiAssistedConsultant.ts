import type { AIAssistedSummaryId, AIAssistedVisibilityRoleId } from "../constants/aiAssistedConsultant";

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

export type AIAssistedObservation = AIAssistedInsight;

export type AIAssistedQuestion = {
  id: string;
  question: string;
  context: string;
};

export type AIAssistedSummarySection = {
  id: AIAssistedSummaryId;
  label: string;
  summary: string;
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
  summaries: AIAssistedSummarySection[];
  observations: AIAssistedObservation[];
  followUpTopics: AIAssistedDraftItem[];
  suggestedQuestions: AIAssistedQuestion[];
  compatibilityAreas: AIAssistedDraftItem[];
  /** @deprecated Use summaries */
  summary: string;
  /** @deprecated Use observations */
  insights: AIAssistedInsight[];
  /** @deprecated Use compatibilityAreas */
  compatibilityObservations: AIAssistedDraftItem[];
  meetingPreparation: AIAssistedMeetingPrep;
  /** @deprecated Use summaries journey section */
  journeySummary: AIAssistedDraftItem[];
  /** @deprecated Use followUpTopics */
  followUpSuggestions: AIAssistedDraftItem[];
  /** @deprecated Folded into observations */
  relationshipHealth: AIAssistedDraftItem[];
  updatedAt: string;
};

export type AIAssistedWorkspaceBundle = {
  members: { id: string; name: string; status: string }[];
  selected: AIAssistedMemberBundle | null;
  visibility: AIAssistedVisibilityRoleId[];
  updatedAt: string;
};
