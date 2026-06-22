/** Journey continuity & consultant exit — members belong to BamSignal. */

export const JOURNEY_OWNERSHIP_TITLE = "Relationship Journey";
export const JOURNEY_OWNERSHIP_HEADLINE = "This journey belongs to BamSignal";
export const JOURNEY_OWNERSHIP_SUBCOPY =
  "Consultants steward the path. The relationship journey survives every steward change.";

export const JOURNEY_TRANSITION_TITLE = "Journey Transition";
export const JOURNEY_TRANSITION_SUBCOPY =
  "Continuity support when stewardship changes — never a client transfer or account handover.";

export const CONTINUITY_SUMMARY_TITLE = "Continuity Summary";
export const CONTINUITY_SUMMARY_SUBCOPY =
  "Everything preserved: notes, introductions, voice and video observations, meetings, and follow-ups.";

export const CONSULTANT_EXIT_PROTOCOL_TITLE = "Consultant Exit Protocol";
export const CONSULTANT_EXIT_PROTOCOL_SUBCOPY =
  "When a consultant leaves, access is frozen, knowledge is preserved, and journeys continue under BamSignal.";

export const JOURNEY_CONTINUITY_TIMELINE_TITLE = "Journey Continuity";
export const JOURNEY_CONTINUITY_TIMELINE_SUBCOPY =
  "Transitions, meetings, introductions, and relationship updates — never deleted.";

export const JOURNEY_MEMBER_TRUST_COPY =
  "Members trust BamSignal — not individual consultants. Continuity is the promise.";

export const JOURNEY_PRESERVED_ASSETS = [
  "Private notes",
  "Introductions",
  "Voice observations",
  "Video observations",
  "Communication journals",
  "Meeting summaries",
  "Relationship updates",
  "Consultant summaries",
  "Timeline history",
  "Follow-up tasks"
] as const;

export const CONSULTANT_EXIT_WORKFLOW_STEPS = [
  { id: "resign", label: "Consultant resigns" },
  { id: "access-frozen", label: "Access frozen" },
  { id: "portfolio-frozen", label: "Portfolio frozen" },
  { id: "admin-review", label: "Admin review" },
  { id: "journey-transition", label: "Journey Transition" },
  { id: "new-steward", label: "New consultant assigned" },
  { id: "journey-resumes", label: "Member journey resumes" }
] as const;

export type ConsultantExitWorkflowStepId = (typeof CONSULTANT_EXIT_WORKFLOW_STEPS)[number]["id"];

export type ConsultantExitWorkflowFutureConfig = {
  step?: ConsultantExitWorkflowStepId;
  consultantId?: string;
  successorConsultantId?: string;
  enabled?: boolean;
};
