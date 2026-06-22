/** Customer Support Center™ — member and operations support infrastructure. */

export const SUPPORT_CENTER_BRAND = "Customer Support Center™";
export const SUPPORT_CENTER_TITLE = "Help & Support";

export type SupportTicketCategoryId =
  | "account"
  | "payments"
  | "consultation"
  | "scheduling"
  | "introductions"
  | "technical-issues"
  | "safety-concerns"
  | "other";

export type SupportTicketStatusId =
  | "open"
  | "in-progress"
  | "awaiting-response"
  | "escalated"
  | "resolved"
  | "closed";

export type SupportTicketPriorityId = "low" | "medium" | "high" | "critical";

export type SupportMetricId =
  | "open-tickets"
  | "escalated"
  | "resolved"
  | "average-response-time"
  | "average-resolution-time";

export const SUPPORT_TICKET_CATEGORIES: {
  id: SupportTicketCategoryId;
  label: string;
  hint: string;
}[] = [
  { id: "account", label: "Account", hint: "Login, PIN, profile, and account access." },
  { id: "payments", label: "Payments", hint: "Paystack, subscriptions, and billing." },
  { id: "consultation", label: "Consultation", hint: "Signal Concierge sessions and fees." },
  { id: "scheduling", label: "Scheduling", hint: "Calendar, slots, and meeting links." },
  { id: "introductions", label: "Introductions", hint: "Introduction Engine™ and consent." },
  { id: "technical-issues", label: "Technical Issues", hint: "App bugs, uploads, and performance." },
  { id: "safety-concerns", label: "Safety Concerns", hint: "Reports, shadow bans, and trust." },
  { id: "other", label: "Other", hint: "General questions not covered above." }
];

export const SUPPORT_TICKET_CATEGORY_LABELS: Record<SupportTicketCategoryId, string> =
  Object.fromEntries(SUPPORT_TICKET_CATEGORIES.map((item) => [item.id, item.label])) as Record<
    SupportTicketCategoryId,
    string
  >;

export const SUPPORT_TICKET_STATUSES: {
  id: SupportTicketStatusId;
  label: string;
}[] = [
  { id: "open", label: "Open" },
  { id: "in-progress", label: "In Progress" },
  { id: "awaiting-response", label: "Awaiting Response" },
  { id: "escalated", label: "Escalated" },
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

export const SUPPORT_TICKET_PRIORITY_LABELS: Record<SupportTicketPriorityId, string> =
  Object.fromEntries(SUPPORT_TICKET_PRIORITIES.map((item) => [item.id, item.label])) as Record<
    SupportTicketPriorityId,
    string
  >;

export const SUPPORT_CENTER_METRICS: {
  id: SupportMetricId;
  label: string;
  hint: string;
}[] = [
  { id: "open-tickets", label: "Open tickets", hint: "Open, in progress, awaiting response, and escalated." },
  { id: "escalated", label: "Escalated", hint: "Tickets requiring senior review." },
  { id: "resolved", label: "Resolved", hint: "Resolved and closed this period." },
  { id: "average-response-time", label: "Average response time", hint: "Time to first support response." },
  { id: "average-resolution-time", label: "Average resolution time", hint: "Time from open to resolved." }
];

/**
 * Future-ready support channels — documented only, not implemented.
 * Live chat, voice support, and video support will plug into SupportCenterEngine
 * when production-ready.
 */
export const SUPPORT_CENTER_FUTURE_KINDS = [
  { id: "live-chat", label: "Live chat" },
  { id: "voice-support", label: "Voice support" },
  { id: "video-support", label: "Video support" }
] as const;
