/** Internal Messaging™ — institutional operational communication. */

export const INTERNAL_MESSAGING_BRAND = "Internal Messaging™";

export const INTERNAL_MESSAGING_RULES = [
  "Institutional communication only.",
  "No member chat."
] as const;

export type MessageChannelId =
  | "operations"
  | "consultants"
  | "research"
  | "leadership"
  | "safety"
  | "support"
  | "announcements";

export type MessageTypeId =
  | "announcement"
  | "escalation"
  | "assignment"
  | "update"
  | "reminder"
  | "alert"
  | "handoff";

export type MessagePriorityId = "low" | "normal" | "high" | "urgent";

export const MESSAGE_CHANNELS: {
  id: MessageChannelId;
  label: string;
  hint: string;
}[] = [
  { id: "operations", label: "Operations", hint: "Operations center coordination." },
  { id: "consultants", label: "Consultants", hint: "Signal Concierge consultant comms." },
  { id: "research", label: "Research", hint: "Institute research updates." },
  { id: "leadership", label: "Leadership", hint: "Leadership directives and decisions." },
  { id: "safety", label: "Safety", hint: "Crisis and safety escalations." },
  { id: "support", label: "Support", hint: "Customer support operations." },
  { id: "announcements", label: "Announcements", hint: "Institution-wide announcements." }
];

export const MESSAGE_CHANNEL_LABELS: Record<MessageChannelId, string> = Object.fromEntries(
  MESSAGE_CHANNELS.map((item) => [item.id, item.label])
) as Record<MessageChannelId, string>;

export const MESSAGE_TYPES: {
  id: MessageTypeId;
  label: string;
}[] = [
  { id: "announcement", label: "Announcement" },
  { id: "escalation", label: "Escalation" },
  { id: "assignment", label: "Assignment" },
  { id: "update", label: "Update" },
  { id: "reminder", label: "Reminder" },
  { id: "alert", label: "Alert" },
  { id: "handoff", label: "Handoff" }
];

export const MESSAGE_TYPE_LABELS: Record<MessageTypeId, string> = Object.fromEntries(
  MESSAGE_TYPES.map((item) => [item.id, item.label])
) as Record<MessageTypeId, string>;

export const MESSAGE_PRIORITIES: {
  id: MessagePriorityId;
  label: string;
}[] = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" }
];

export const MESSAGE_PRIORITY_LABELS: Record<MessagePriorityId, string> = Object.fromEntries(
  MESSAGE_PRIORITIES.map((item) => [item.id, item.label])
) as Record<MessagePriorityId, string>;

/**
 * Future-ready messaging capabilities — documented only, not implemented.
 */
export const INTERNAL_MESSAGING_FUTURE_KINDS = [
  { id: "push-notifications", label: "Push notifications" },
  { id: "mobile-app", label: "Mobile app" },
  { id: "voice-notes", label: "Voice notes" }
] as const;
