export const AI_ASSISTED_CONSULTANT_BRAND = "AI-Assisted Consultant Workspace™";
export const AI_ASSISTED_CONSULTANT_TAGLINE =
  "Consultant assistance only. Human always decides — never automated decision making.";

export const AI_ASSISTED_SUMMARY_FEATURES = [
  { id: "application", label: "Application summary" },
  { id: "consultation", label: "Consultation summary" },
  { id: "introduction", label: "Introduction summary" },
  { id: "relationship", label: "Relationship summary" },
  { id: "journey", label: "Journey summary" }
] as const;

export type AIAssistedSummaryId = (typeof AI_ASSISTED_SUMMARY_FEATURES)[number]["id"];

export const AI_ASSISTED_OUTPUT_TYPES = [
  { id: "summary", label: "Summary" },
  { id: "observations", label: "Suggested observations" },
  { id: "follow-up-topics", label: "Suggested follow-up topics" },
  { id: "questions", label: "Suggested questions" },
  { id: "compatibility-areas", label: "Suggested compatibility areas" }
] as const;

export type AIAssistedOutputTypeId = (typeof AI_ASSISTED_OUTPUT_TYPES)[number]["id"];

export const AI_ASSISTED_AUTHORITY_COPY =
  "Human consultant remains final authority. AI drafts are suggestions only — consultants decide.";

export const AI_ASSISTED_RULES = [
  "AI never approves.",
  "AI never rejects.",
  "AI never assigns.",
  "AI never introduces.",
  "AI never decides.",
  "Consultants decide."
] as const;

export const AI_ASSISTED_FORBIDDEN_ACTIONS = [
  "approve-application",
  "reject-application",
  "decline-application",
  "assign-consultant",
  "create-introduction",
  "override-consultant",
  "send-member-message",
  "automated-decision"
] as const;

export const AI_ASSISTED_VISIBILITY_ROLES = [
  { id: "consultant", label: "Consultants" },
  { id: "senior-matchmaker", label: "Senior Matchmakers" },
  { id: "admin", label: "Admin" }
] as const;

export type AIAssistedVisibilityRoleId = (typeof AI_ASSISTED_VISIBILITY_ROLES)[number]["id"];

export const AI_ASSISTED_VISIBILITY_COPY =
  "Visible to consultants, senior matchmakers, and admin only — never members or public surfaces.";

/** @deprecated Use AI_ASSISTED_SUMMARY_FEATURES */
export const AI_ASSISTED_CAPABILITIES = AI_ASSISTED_SUMMARY_FEATURES.map((feature) => ({
  id: feature.id,
  label: feature.label
}));

export type AIAssistedCapabilityId = AIAssistedSummaryId;

export const AI_ASSISTED_DRAFT_LABEL = "AI draft — not final";
export const AI_ASSISTED_REVIEW_LABEL = "Consultant review required";

/** Documented future modules — not implemented. */
export const AI_ASSISTED_FUTURE_MODULES = [
  {
    id: "openai-integration",
    label: "OpenAI integration",
    description: "Optional model-backed drafts with steward review before any action."
  },
  {
    id: "transcript-analysis",
    label: "Transcript analysis",
    description: "Consultation transcript assistance — human approval required before storage."
  },
  {
    id: "call-summaries",
    label: "Call summaries",
    description: "Post-call draft summaries for consultant editing — never auto-sent to members."
  }
] as const;
