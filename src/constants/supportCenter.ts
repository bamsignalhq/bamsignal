/** Customer Support Center™ — member and operations support infrastructure. */

export const SUPPORT_CENTER_BRAND = "Customer Support Center™";
export const SUPPORT_CENTER_TITLE = "Help & Support";

export type SupportTicketTypeId =
  | "technical-support"
  | "billing"
  | "consultation-issues"
  | "account-recovery"
  | "profile-issues"
  | "safety-reports"
  | "general-questions"
  | "feedback";

/** @deprecated Use SupportTicketTypeId */
export type SupportTicketCategoryId = SupportTicketTypeId;

export type SupportTicketStatusId =
  | "open"
  | "pending"
  | "in-progress"
  | "waiting-for-member"
  | "resolved"
  | "closed";

export type SupportTicketPriorityId = "low" | "medium" | "high" | "critical";

export type SupportMetricId =
  | "open-tickets"
  | "average-response-time"
  | "resolution-time"
  | "escalations"
  | "member-satisfaction";

export const SUPPORT_TICKET_TYPES: {
  id: SupportTicketTypeId;
  label: string;
  hint: string;
}[] = [
  { id: "technical-support", label: "Technical Support", hint: "App bugs, uploads, and performance." },
  { id: "billing", label: "Billing", hint: "Paystack, subscriptions, and payment issues." },
  { id: "consultation-issues", label: "Consultation Issues", hint: "Signal Concierge sessions, scheduling, and fees." },
  { id: "account-recovery", label: "Account Recovery", hint: "Login, PIN reset, and account access." },
  { id: "profile-issues", label: "Profile Issues", hint: "Photos, prompts, and discovery visibility." },
  { id: "safety-reports", label: "Safety Reports", hint: "Member reports, trust, and safety review." },
  { id: "general-questions", label: "General Questions", hint: "Product questions not covered above." },
  { id: "feedback", label: "Feedback", hint: "Suggestions and experience feedback." }
];

/** @deprecated Use SUPPORT_TICKET_TYPES */
export const SUPPORT_TICKET_CATEGORIES = SUPPORT_TICKET_TYPES;

export const SUPPORT_TICKET_TYPE_LABELS: Record<SupportTicketTypeId, string> = Object.fromEntries(
  SUPPORT_TICKET_TYPES.map((item) => [item.id, item.label])
) as Record<SupportTicketTypeId, string>;

/** @deprecated Use SUPPORT_TICKET_TYPE_LABELS */
export const SUPPORT_TICKET_CATEGORY_LABELS = SUPPORT_TICKET_TYPE_LABELS;

export const SUPPORT_TICKET_STATUSES: {
  id: SupportTicketStatusId;
  label: string;
}[] = [
  { id: "open", label: "Open" },
  { id: "pending", label: "Pending" },
  { id: "in-progress", label: "In Progress" },
  { id: "waiting-for-member", label: "Waiting For Member" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" }
];

export const SUPPORT_TICKET_STATUS_LABELS: Record<SupportTicketStatusId, string> = Object.fromEntries(
  SUPPORT_TICKET_STATUSES.map((item) => [item.id, item.label])
) as Record<SupportTicketStatusId, string>;

export const SUPPORT_TICKET_PRIORITIES: {
  id: SupportTicketPriorityId;
  label: string;
}[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" }
];

export const SUPPORT_TICKET_PRIORITY_LABELS: Record<SupportTicketPriorityId, string> = Object.fromEntries(
  SUPPORT_TICKET_PRIORITIES.map((item) => [item.id, item.label])
) as Record<SupportTicketPriorityId, string>;

export const SUPPORT_CENTER_METRICS: {
  id: SupportMetricId;
  label: string;
  hint: string;
}[] = [
  { id: "open-tickets", label: "Open Tickets", hint: "Open, pending, in progress, and waiting for member." },
  { id: "average-response-time", label: "Average Response Time", hint: "Time to first support response." },
  { id: "resolution-time", label: "Resolution Time", hint: "Average time from open to resolved." },
  { id: "escalations", label: "Escalations", hint: "Tickets requiring senior review." },
  { id: "member-satisfaction", label: "Member Satisfaction", hint: "Post-resolution satisfaction score." }
];

/**
 * Future-ready support channels — documented only, not implemented.
 */
export const SUPPORT_CENTER_FUTURE_KINDS = [
  { id: "live-chat", label: "Live chat" },
  { id: "ai-support-assistant", label: "AI support assistant" },
  { id: "voice-support", label: "Voice support" }
] as const;
