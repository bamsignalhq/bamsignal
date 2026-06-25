/** Automation & Workflow Engine™ — institutional operational automation layer. */

import { WORKFLOW_ENGINE_ADMIN_BRAND } from "./workflowEngineAdmin";

export const WORKFLOW_ENGINE_BRAND = WORKFLOW_ENGINE_ADMIN_BRAND;

export const WORKFLOW_DEFINITIONS = [
  { id: "application-received", label: "Application Received" },
  { id: "consultation-scheduled", label: "Consultation Scheduled" },
  { id: "payment-confirmed", label: "Payment Confirmed" },
  { id: "consultant-assigned", label: "Consultant Assigned" },
  { id: "reminder-sent", label: "Reminder Sent" },
  { id: "consultation-completed", label: "Consultation Completed" },
  { id: "application-approved", label: "Application Approved" },
  { id: "introduction-created", label: "Introduction Created" },
  { id: "follow-up-scheduled", label: "Follow-up Scheduled" },
  { id: "archive-completed", label: "Archive Completed" },
  { id: "success-story-requested", label: "Success Story Requested" }
] as const;

export type WorkflowDefinitionId = (typeof WORKFLOW_DEFINITIONS)[number]["id"];

export const WORKFLOW_DEFINITION_LABELS: Record<WorkflowDefinitionId, string> =
  Object.fromEntries(WORKFLOW_DEFINITIONS.map((item) => [item.id, item.label])) as Record<
    WorkflowDefinitionId,
    string
  >;

export const WORKFLOW_STATUSES = ["active", "paused", "disabled", "draft"] as const;

export type WorkflowStatusId = (typeof WORKFLOW_STATUSES)[number];

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatusId, string> = {
  active: "Active",
  paused: "Paused",
  disabled: "Disabled",
  draft: "Draft"
};

export const WORKFLOW_TRIGGERS = [
  { id: "payment", label: "Payment" },
  { id: "status-change", label: "Status Change" },
  { id: "date", label: "Date" },
  { id: "consultant-action", label: "Consultant Action" },
  { id: "admin-action", label: "Admin Action" },
  { id: "journey-milestone", label: "Journey Milestone" }
] as const;

export type WorkflowTriggerId = (typeof WORKFLOW_TRIGGERS)[number]["id"];

export const WORKFLOW_TRIGGER_LABELS: Record<WorkflowTriggerId, string> =
  Object.fromEntries(WORKFLOW_TRIGGERS.map((item) => [item.id, item.label])) as Record<
    WorkflowTriggerId,
    string
  >;

export const WORKFLOW_ACTIONS = [
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "calendar", label: "Calendar" },
  { id: "assignment", label: "Assignment" },
  { id: "notification", label: "Notification" },
  { id: "crm-update", label: "CRM Update" },
  { id: "archive", label: "Archive" }
] as const;

export type WorkflowActionId = (typeof WORKFLOW_ACTIONS)[number]["id"];

export const WORKFLOW_ACTION_LABELS: Record<WorkflowActionId, string> =
  Object.fromEntries(WORKFLOW_ACTIONS.map((item) => [item.id, item.label])) as Record<
    WorkflowActionId,
    string
  >;

export const WORKFLOW_RUN_STATUSES = ["completed", "failed", "running", "skipped"] as const;
export type WorkflowRunStatusId = (typeof WORKFLOW_RUN_STATUSES)[number];

export const WORKFLOW_ENGINE_DB_TABLES = [
  "workflow_definitions",
  "workflow_triggers",
  "workflow_actions",
  "workflow_run_history",
  "workflow_step_logs",
  "workflow_automation_snapshots"
] as const;

export const WORKFLOW_AUDIT_ACTIONS = [
  "workflow-activated",
  "workflow-paused",
  "workflow-disabled",
  "workflow-run-completed",
  "workflow-run-failed",
  "workflow-updated"
] as const;

export type WorkflowAuditActionId = (typeof WORKFLOW_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const WORKFLOW_FUTURE_ARCHITECTURE = [
  { id: "conditional-branching", label: "Conditional Branching" },
  { id: "visual-workflow-builder", label: "Visual Workflow Builder" },
  { id: "ai-recommendations", label: "AI Recommendations" },
  { id: "multi-step-automations", label: "Multi-step Automations" }
] as const;
