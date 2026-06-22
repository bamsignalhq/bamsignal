import type {
  ConciergeConsultantActivityType,
  ConciergeProfessionalChannel
} from "../types/conciergeConsultantDirectory";

export const CONCIERGE_PROFESSIONAL_CHANNELS: {
  id: ConciergeProfessionalChannel;
  label: string;
}[] = [
  { id: "microsoft-teams", label: "Microsoft Teams" },
  { id: "zoom", label: "Zoom" },
  { id: "google-meet", label: "Google Meet" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" }
];

export const CONCIERGE_PROFESSIONAL_CHANNEL_LABELS: Record<ConciergeProfessionalChannel, string> =
  Object.fromEntries(
    CONCIERGE_PROFESSIONAL_CHANNELS.map((channel) => [channel.id, channel.label])
  ) as Record<ConciergeProfessionalChannel, string>;

export const CONCIERGE_COMMUNICATION_POLICY_COPY =
  "No WhatsApp conversations. Professional channels only. All meetings must be scheduled and logged.";

export const CONCIERGE_CONSULTANT_ACTIVITY_LABELS: Record<ConciergeConsultantActivityType, string> = {
  "application-reviewed": "Application reviewed",
  "consultation-completed": "Consultation completed",
  "introduction-created": "Introduction created",
  "feedback-recorded": "Feedback recorded",
  "relationship-update": "Relationship update",
  "member-paused": "Member paused",
  "member-resumed": "Member resumed",
  "case-closed": "Case closed",
  "note-added": "Note added",
  "outcome-updated": "Outcome updated",
  "member-assigned": "Member assigned",
  "member-reassigned": "Member reassigned",
  "member-transferred": "Member transferred",
  "consultant-invited": "Consultant invited",
  "consultant-activated": "Consultant activated",
  "consultant-deactivated": "Consultant deactivated",
  "consultant-frozen": "Consultant access frozen",
  "meeting-scheduled": "Meeting scheduled",
  "follow-up-scheduled": "Follow-up scheduled",
  "introduction-sent": "Introduction sent",
  "search-resumed": "Search resumed",
  "portfolio-transferred": "Portfolio transferred",
  "consultant-promoted": "Consultant promoted",
  "journey-transition": "Journey transition",
  "consultant-exit": "Consultant exit protocol",
  "portfolio-frozen": "Portfolio frozen"
};

export const CONCIERGE_CONSULTANT_METRIC_LABELS = {
  activeMembers: "Active members",
  introductionsMade: "Introductions made",
  consultationsCompleted: "Consultations completed",
  matchesFormed: "Matches formed",
  relationshipsFormed: "Relationships formed",
  engagements: "Engagements",
  marriages: "Marriages",
  responseTimeHours: "Response time",
  memberSatisfaction: "Member satisfaction"
} as const;

export const CONCIERGE_SPECIALIST_FUTURE_LANES = [
  { id: "relationship-coach", label: "Relationship coaches" },
  { id: "psychologist", label: "Psychologists" },
  { id: "family-value-advisor", label: "Family-value advisors" },
  { id: "diaspora-specialist", label: "Diaspora specialists" },
  { id: "compatibility-analyst", label: "Compatibility analysts" },
  { id: "ai-summary", label: "AI summaries" }
] as const;
