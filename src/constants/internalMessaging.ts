/** Internal Messaging Center™ — institutional communication infrastructure. */

export const INTERNAL_MESSAGING_BRAND = "Internal Messaging Center™";

export const INTERNAL_MESSAGING_RULES = [
  "Institutional communication only — not social chat.",
  "No member chat. Operational information stays inside BamSignal."
] as const;

export type MessageChannelId =
  | "operations"
  | "consultants"
  | "support"
  | "research"
  | "leadership"
  | "announcements";

export type MessageTypeId = "announcement" | "escalation" | "handoff" | "update" | "alert";

export type MessagePriorityId = "low" | "normal" | "high" | "urgent";

export type MessagingMetricId = "messages" | "unread" | "escalations" | "announcements";

export const MESSAGE_CHANNELS: {
  id: MessageChannelId;
  label: string;
  hint: string;
  department: string;
}[] = [
  { id: "operations", label: "Operations", hint: "Operations center coordination.", department: "Operations" },
  { id: "consultants", label: "Consultants", hint: "Signal Concierge consultant comms.", department: "Consultants" },
  { id: "support", label: "Support", hint: "Customer support operations.", department: "Support" },
  { id: "research", label: "Research", hint: "Institute research updates.", department: "Research" },
  { id: "leadership", label: "Leadership", hint: "Leadership directives and decisions.", department: "Leadership" },
  { id: "announcements", label: "Announcements", hint: "Institution-wide announcements.", department: "All" }
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
  { id: "handoff", label: "Handoff" },
  { id: "update", label: "Update" },
  { id: "alert", label: "Alert" }
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

export const MESSAGING_CENTER_METRICS: {
  id: MessagingMetricId;
  label: string;
}[] = [
  { id: "messages", label: "Messages" },
  { id: "unread", label: "Unread" },
  { id: "escalations", label: "Escalations" },
  { id: "announcements", label: "Announcements" }
];

/**
 * Institutional messaging features — active in this release.
 */
export const INTERNAL_MESSAGING_FEATURES = [
  { id: "unread-tracking", label: "Unread tracking" },
  { id: "priority-flags", label: "Priority flags" },
  { id: "department-routing", label: "Department routing" },
  { id: "read-receipts", label: "Read receipts" }
] as const;

/**
 * Future-ready messaging capabilities — documented only, not implemented.
 */
export const INTERNAL_MESSAGING_FUTURE_KINDS = [
  { id: "mobile-notifications", label: "Mobile notifications" },
  { id: "voice-notes", label: "Voice notes" },
  { id: "department-chat", label: "Department chat" }
] as const;
