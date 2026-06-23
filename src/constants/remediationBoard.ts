/** Institutional Remediation Board™ — audit finding taxonomy. */

import type {
  RemediationCategoryId,
  RemediationSeverityId,
  RemediationStatusId
} from "../types/remediationBoard";

export const REMEDIATION_SEVERITIES: { id: RemediationSeverityId; label: string }[] = [
  { id: "P0", label: "P0 — Critical" },
  { id: "P1", label: "P1 — High" },
  { id: "P2", label: "P2 — Medium / Low" }
];

export const REMEDIATION_SEVERITY_LABELS: Record<RemediationSeverityId, string> = {
  P0: "P0 — Critical",
  P1: "P1 — High",
  P2: "P2 — Medium / Low"
};

export const REMEDIATION_STATUSES: { id: RemediationStatusId; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "in-progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "resolved", label: "Resolved" },
  { id: "deferred", label: "Deferred" }
];

export const REMEDIATION_STATUS_LABELS: Record<RemediationStatusId, string> = {
  open: "Open",
  "in-progress": "In Progress",
  blocked: "Blocked",
  resolved: "Resolved",
  deferred: "Deferred"
};

export const REMEDIATION_CATEGORIES: { id: RemediationCategoryId; label: string }[] = [
  { id: "routes", label: "Routes" },
  { id: "permissions", label: "Permissions" },
  { id: "journey-integrity", label: "Journey Integrity" },
  { id: "persistence", label: "Persistence" },
  { id: "operations", label: "Operations" },
  { id: "crm", label: "CRM" },
  { id: "notifications", label: "Notifications" },
  { id: "safety", label: "Safety" },
  { id: "executive", label: "Executive" },
  { id: "launch", label: "Launch" }
];

export const REMEDIATION_CATEGORY_LABELS: Record<RemediationCategoryId, string> = Object.fromEntries(
  REMEDIATION_CATEGORIES.map((item) => [item.id, item.label])
) as Record<RemediationCategoryId, string>;

export const REMEDIATION_STATUS_STORAGE_KEY = "bamsignal.remediationBoard.status.v1";
