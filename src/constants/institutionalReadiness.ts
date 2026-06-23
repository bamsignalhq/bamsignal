import type {
  HealthSectionId,
  HealthStatusId,
  GoNoGoVerdictId
} from "../types/institutionalReadiness";

export const HEALTH_SECTIONS: { id: HealthSectionId; label: string }[] = [
  { id: "routes", label: "Route Health" },
  { id: "permissions", label: "Permission Health" },
  { id: "journey", label: "Journey Health" },
  { id: "persistence", label: "Persistence Health" },
  { id: "operations", label: "Operations Health" },
  { id: "safety", label: "Safety Health" },
  { id: "executive", label: "Executive Health" },
  { id: "launch", label: "Launch Readiness" }
];

export const HEALTH_SECTION_LABELS: Record<HealthSectionId, string> = Object.fromEntries(
  HEALTH_SECTIONS.map((section) => [section.id, section.label])
) as Record<HealthSectionId, string>;

export const HEALTH_STATUSES: { id: HealthStatusId; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "partial", label: "Partial" },
  { id: "critical", label: "Critical" }
];

export const HEALTH_STATUS_LABELS: Record<HealthStatusId, string> = {
  healthy: "Healthy",
  partial: "Partial",
  critical: "Critical"
};

export const GO_NO_GO_LABELS: Record<GoNoGoVerdictId, string> = {
  go: "GO",
  "go-with-conditions": "GO — with conditions",
  "no-go-member-only": "NO-GO — member app only",
  "no-go": "NO-GO"
};
