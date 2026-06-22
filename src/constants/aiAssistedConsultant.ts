export const AI_ASSISTED_CONSULTANT_BRAND = "AI-Assisted Consultant Workspace™";
export const AI_ASSISTED_CONSULTANT_TAGLINE =
  "Human-led. AI-assisted. Never AI-driven — the consultant always decides.";

export const AI_ASSISTED_CAPABILITIES = [
  { id: "meeting-summaries", label: "Meeting summaries" },
  { id: "application-summaries", label: "Application summaries" },
  { id: "compatibility-observations", label: "Compatibility observations" },
  { id: "follow-up-suggestions", label: "Follow-up suggestions" },
  { id: "relationship-health", label: "Relationship health observations" },
  { id: "timeline-summaries", label: "Timeline summaries" }
] as const;

export type AIAssistedCapabilityId = (typeof AI_ASSISTED_CAPABILITIES)[number]["id"];

export const AI_ASSISTED_AUTHORITY_COPY =
  "Human consultant remains final authority. AI drafts are suggestions only.";

export const AI_ASSISTED_RULES = [
  "AI never approves applications.",
  "AI never introduces members.",
  "AI never overrides consultants.",
  "Every draft requires consultant review before action."
] as const;

export const AI_ASSISTED_FORBIDDEN_ACTIONS = [
  "approve-application",
  "decline-application",
  "create-introduction",
  "override-consultant",
  "send-member-message"
] as const;

/** Documented future modules — not implemented in this release. */
export const AI_ASSISTED_FUTURE_MODULES = [
  {
    id: "voice-transcription",
    label: "Voice Transcription",
    description: "Transcribe consultations with steward approval before storage."
  },
  {
    id: "multilingual-support",
    label: "Multilingual Support",
    description: "Draft assistance in Pidgin, Yoruba, Igbo, and Hausa — consultant-reviewed."
  },
  {
    id: "private-models",
    label: "Private Models",
    description: "On-premise inference for sensitive legacy journeys."
  }
] as const;

export const AI_ASSISTED_DRAFT_LABEL = "AI draft — not final";
export const AI_ASSISTED_REVIEW_LABEL = "Consultant review required";
