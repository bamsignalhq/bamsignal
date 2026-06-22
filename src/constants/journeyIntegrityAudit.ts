/** Journey Integrity Audit™ — Journey ID backbone verification. */

export const JOURNEY_INTEGRITY_AUDIT_BRAND = "Journey Integrity Audit™";
export const JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH = "/hard/audit/journeys";

export type JourneyStageId =
  | "application"
  | "consultation"
  | "assignment"
  | "introduction"
  | "follow-up"
  | "relationship"
  | "archive"
  | "legacy"
  | "success-story"
  | "milestones"
  | "family"
  | "quotes"
  | "events";

export type JourneyHealthStatusId = "healthy" | "partial" | "broken" | "critical";

export const JOURNEY_STAGES: { id: JourneyStageId; label: string }[] = [
  { id: "application", label: "Application" },
  { id: "consultation", label: "Consultation" },
  { id: "assignment", label: "Assignment" },
  { id: "introduction", label: "Introduction" },
  { id: "follow-up", label: "Follow-up" },
  { id: "relationship", label: "Relationship" },
  { id: "archive", label: "Archive" },
  { id: "legacy", label: "Legacy" },
  { id: "success-story", label: "Success Story" },
  { id: "milestones", label: "Milestones" },
  { id: "family", label: "Family" },
  { id: "quotes", label: "Quotes" },
  { id: "events", label: "Events" }
];

export const JOURNEY_STAGE_LABELS: Record<JourneyStageId, string> = Object.fromEntries(
  JOURNEY_STAGES.map((item) => [item.id, item.label])
) as Record<JourneyStageId, string>;

export const JOURNEY_HEALTH_STATUSES: { id: JourneyHealthStatusId; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "partial", label: "Partial" },
  { id: "broken", label: "Broken" },
  { id: "critical", label: "Critical" }
];

export const JOURNEY_HEALTH_STATUS_LABELS: Record<JourneyHealthStatusId, string> = Object.fromEntries(
  JOURNEY_HEALTH_STATUSES.map((item) => [item.id, item.label])
) as Record<JourneyHealthStatusId, string>;
