export const CONSULTANT_CRM_BRAND = "Consultant CRM™";
export const CONSULTANT_CRM_TAGLINE = "Your relationship workspace";

export const CONSULTANT_CRM_SECTIONS = [
  { id: "members", label: "Members" },
  { id: "applications", label: "Applications" },
  { id: "consultations", label: "Consultations" },
  { id: "payments", label: "Payments" },
  { id: "introductions", label: "Introductions" },
  { id: "follow-ups", label: "Follow-Ups" },
  { id: "meeting-notes", label: "Meeting Notes" },
  { id: "archives", label: "Archives" },
  { id: "legacy", label: "Legacy" },
  { id: "stories", label: "Stories" },
  { id: "performance", label: "Performance" }
] as const;

export const CONSULTANT_CRM_VIEWS = [
  { id: "my-members", label: "My Members" },
  { id: "my-meetings", label: "My Meetings" },
  { id: "pending-applications", label: "Pending Applications" },
  { id: "pending-introductions", label: "Pending Introductions" },
  { id: "follow-ups", label: "Follow-Ups" },
  { id: "health-alerts", label: "Health Alerts" }
] as const;

export type ConsultantCrmSectionId = (typeof CONSULTANT_CRM_SECTIONS)[number]["id"];
export type ConsultantCrmViewId = (typeof CONSULTANT_CRM_VIEWS)[number]["id"];

/** Documented future modules — not implemented in this release. */
export const CONSULTANT_CRM_FUTURE_MODULES = [
  {
    id: "regional-teams",
    label: "Regional Teams",
    description: "Shared caseloads and handoffs across city teams."
  },
  {
    id: "senior-matchmakers",
    label: "Senior Matchmakers",
    description: "Escalation lane for complex introductions."
  },
  {
    id: "ai-assistance",
    label: "AI Assistance",
    description: "Drafting support for notes and follow-up plans."
  }
] as const;

export const CONSULTANT_CRM_PIPELINE_LABELS: Record<string, string> = {
  applications: "Applications",
  consultations: "Consultations",
  "active-search": "Active Search",
  introductions: "Introductions",
  "follow-ups": "Follow-Ups",
  relationships: "Relationships"
};
