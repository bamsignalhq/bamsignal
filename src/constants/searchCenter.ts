/** Enterprise Search Center™ — unified admin discovery across every institutional entity. */

import { SEARCH_CENTER_ADMIN_BRAND } from "./searchCenterAdmin";

export const SEARCH_CENTER_BRAND = SEARCH_CENTER_ADMIN_BRAND;

export const SEARCH_CENTER_KEYBOARD_SHORTCUT = "mod+k";

export type SearchEntityId =
  | "members"
  | "consultants"
  | "applications"
  | "journeys"
  | "relationships"
  | "payments"
  | "reports"
  | "messages"
  | "signals"
  | "support"
  | "notifications"
  | "research"
  | "events"
  | "documents";

export type SearchQuickActionId =
  | "open-member"
  | "assign-consultant"
  | "view-journey"
  | "refund-payment"
  | "export-report"
  | "retry-notification";

export const SEARCH_ENTITIES: { id: SearchEntityId; label: string }[] = [
  { id: "members", label: "Members" },
  { id: "consultants", label: "Consultants" },
  { id: "applications", label: "Applications" },
  { id: "journeys", label: "Journeys" },
  { id: "relationships", label: "Relationships" },
  { id: "payments", label: "Payments" },
  { id: "reports", label: "Reports" },
  { id: "messages", label: "Messages" },
  { id: "signals", label: "Signals" },
  { id: "support", label: "Support" },
  { id: "notifications", label: "Notifications" },
  { id: "research", label: "Research" },
  { id: "events", label: "Events" },
  { id: "documents", label: "Documents" }
];

export const SEARCH_ENTITY_LABELS: Record<SearchEntityId, string> = Object.fromEntries(
  SEARCH_ENTITIES.map((item) => [item.id, item.label])
) as Record<SearchEntityId, string>;

export const SEARCH_QUICK_ACTIONS: { id: SearchQuickActionId; label: string; hint: string }[] = [
  { id: "open-member", label: "Open member", hint: "Jump to concierge member record" },
  { id: "assign-consultant", label: "Assign consultant", hint: "Open assignment workflow" },
  { id: "view-journey", label: "View journey", hint: "Open journey intelligence" },
  { id: "refund-payment", label: "Refund payment", hint: "Open finance operations" },
  { id: "export-report", label: "Export report", hint: "Open reporting center" },
  { id: "retry-notification", label: "Retry notification", hint: "Open notification center" }
];

export const SEARCH_CENTER_FEATURES = [
  "global-search",
  "filters",
  "saved-searches",
  "recent-searches",
  "quick-actions",
  "keyboard-shortcut",
  "command-palette"
] as const;

export const SEARCH_CENTER_DB_TABLES = [
  "search_index_snapshots",
  "search_saved_queries",
  "search_recent_queries"
] as const;
