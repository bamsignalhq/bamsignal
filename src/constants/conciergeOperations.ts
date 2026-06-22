import type {
  OperationHealth,
  OperationStage,
  OperationStatus
} from "../types/conciergeOperations";

export const CONCIERGE_OPERATIONS_BRAND = "Signal Concierge Operations Engine™";

export const OPERATION_PIPELINE_STAGES: OperationStage[] = [
  "application-received",
  "consultation-scheduled",
  "consultation-completed",
  "consultant-assignment",
  "application-review",
  "approved",
  "introduction-process",
  "relationship-follow-up",
  "marriage",
  "legacy-archive"
];

export const OPERATION_STAGE_LABELS: Record<OperationStage, string> = {
  "application-received": "Application Received",
  "consultation-scheduled": "Consultation Scheduled",
  "consultation-completed": "Consultation Completed",
  "consultant-assignment": "Consultant Assignment",
  "application-review": "Application Review",
  approved: "Approved",
  "introduction-process": "Introduction Process",
  "relationship-follow-up": "Relationship Follow-Up",
  marriage: "Marriage",
  "legacy-archive": "Legacy Archive"
};

export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  pending: "Pending",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived"
};

export const OPERATION_HEALTH_LEVELS: { id: OperationHealth; label: string; hint: string }[] = [
  { id: "healthy", label: "Healthy", hint: "On track with no open concerns." },
  {
    id: "requires-attention",
    label: "Requires Attention",
    hint: "Priority flags, sensitive case, or overdue follow-up."
  },
  { id: "paused", label: "Paused", hint: "Journey intentionally paused." },
  { id: "completed", label: "Completed", hint: "Marriage milestone reached." },
  { id: "archived", label: "Archived", hint: "Moved to legacy archive." }
];

export const OPERATION_HEALTH_LABELS: Record<OperationHealth, string> = Object.fromEntries(
  OPERATION_HEALTH_LEVELS.map((level) => [level.id, level.label])
) as Record<OperationHealth, string>;

export const CONCIERGE_OPERATIONS_FUTURE_CAPABILITIES: {
  id: import("../types/conciergeOperations").ConciergeOperationsFutureCapability;
  label: string;
}[] = [
  { id: "recommendations", label: "Recommendations" },
  { id: "ai-summaries", label: "AI summaries" },
  { id: "workflow-automation", label: "Workflow automation" },
  { id: "regional-operations-teams", label: "Regional operations teams" }
];
