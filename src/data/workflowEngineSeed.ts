import type {
  WorkflowActionRecord,
  WorkflowHistoryRecord,
  WorkflowRecord,
  WorkflowStepLog,
  WorkflowTriggerRecord
} from "../types/workflowEngine";
import { WORKFLOW_DEFINITIONS } from "../constants/workflowEngine";

const NOW = "2026-06-25T15:00:00.000Z";

const STATUS_CYCLE: Array<WorkflowRecord["status"]> = [
  "active",
  "active",
  "active",
  "paused",
  "active",
  "active",
  "draft",
  "active",
  "paused",
  "disabled",
  "active"
];

export const WORKFLOW_RECORD_SEED: WorkflowRecord[] = WORKFLOW_DEFINITIONS.map((def, index) => ({
  id: `wf_${index + 1}`,
  workflowRef: `WF-${def.id.toUpperCase().replace(/-/g, "_")}`,
  workflowId: def.id,
  title: def.label,
  status: STATUS_CYCLE[index % STATUS_CYCLE.length],
  ownerEmail: index < 6 ? "ops@bamsignal.com" : "founder@bamsignal.com",
  lastRunAt: index % 3 === 0 ? NOW : "2026-06-24T18:00:00.000Z",
  runCount: 120 + index * 37,
  description:
    def.id === "payment-confirmed"
      ? "Activates membership products and sends purchase confirmation email after Paystack verification"
      : def.id === "consultant-assigned"
        ? "Routes journey to consultant CRM and notifies both parties"
        : undefined
}));

export const WORKFLOW_TRIGGER_SEED: WorkflowTriggerRecord[] = [
  {
    id: "trg_001",
    triggerRef: "TRG-APP-RECEIVED",
    workflowId: "application-received",
    triggerType: "status-change",
    config: { from: null, to: "received" },
    enabled: true
  },
  {
    id: "trg_002",
    triggerRef: "TRG-PAYMENT",
    workflowId: "payment-confirmed",
    triggerType: "payment",
    config: { provider: "paystack", event: "charge.success" },
    enabled: true
  },
  {
    id: "trg_003",
    triggerRef: "TRG-SCHEDULE",
    workflowId: "consultation-scheduled",
    triggerType: "date",
    config: { offsetHours: -24 },
    enabled: true
  },
  {
    id: "trg_004",
    triggerRef: "TRG-ASSIGN",
    workflowId: "consultant-assigned",
    triggerType: "admin-action",
    config: { action: "assign-consultant" },
    enabled: true
  },
  {
    id: "trg_005",
    triggerRef: "TRG-REMINDER",
    workflowId: "reminder-sent",
    triggerType: "date",
    config: { offsetHours: -2 },
    enabled: true
  },
  {
    id: "trg_006",
    triggerRef: "TRG-COMPLETE",
    workflowId: "consultation-completed",
    triggerType: "consultant-action",
    config: { action: "mark-complete" },
    enabled: true
  },
  {
    id: "trg_007",
    triggerRef: "TRG-APPROVE",
    workflowId: "application-approved",
    triggerType: "admin-action",
    config: { action: "approve-application" },
    enabled: true
  },
  {
    id: "trg_008",
    triggerRef: "TRG-INTRO",
    workflowId: "introduction-created",
    triggerType: "journey-milestone",
    config: { milestone: "introduction" },
    enabled: true
  },
  {
    id: "trg_009",
    triggerRef: "TRG-FOLLOWUP",
    workflowId: "follow-up-scheduled",
    triggerType: "journey-milestone",
    config: { milestone: "follow-up" },
    enabled: true
  },
  {
    id: "trg_010",
    triggerRef: "TRG-ARCHIVE",
    workflowId: "archive-completed",
    triggerType: "status-change",
    config: { to: "archived" },
    enabled: true
  },
  {
    id: "trg_011",
    triggerRef: "TRG-STORY",
    workflowId: "success-story-requested",
    triggerType: "journey-milestone",
    config: { milestone: "success-story" },
    enabled: false
  }
];

export const WORKFLOW_ACTION_SEED: WorkflowActionRecord[] = [
  {
    id: "act_001",
    actionRef: "ACT-APP-EMAIL",
    workflowId: "application-received",
    actionType: "email",
    sequence: 1,
    config: { template: "application-received-v1" },
    enabled: true
  },
  {
    id: "act_002",
    actionRef: "ACT-APP-NOTIFY",
    workflowId: "application-received",
    actionType: "notification",
    sequence: 2,
    config: { channel: "operations-center" },
    enabled: true
  },
  {
    id: "act_003",
    actionRef: "ACT-PAY-EMAIL",
    workflowId: "payment-confirmed",
    actionType: "email",
    sequence: 1,
    config: { template: "purchase-confirmation-v1" },
    enabled: true
  },
  {
    id: "act_004",
    actionRef: "ACT-PAY-CRM",
    workflowId: "payment-confirmed",
    actionType: "crm-update",
    sequence: 2,
    config: { field: "payment_status", value: "confirmed" },
    enabled: true
  },
  {
    id: "act_005",
    actionRef: "ACT-SCHED-CAL",
    workflowId: "consultation-scheduled",
    actionType: "calendar",
    sequence: 1,
    config: { provider: "google-calendar" },
    enabled: true
  },
  {
    id: "act_006",
    actionRef: "ACT-SCHED-WA",
    workflowId: "consultation-scheduled",
    actionType: "whatsapp",
    sequence: 2,
    config: { template: "consultation-scheduled-v1" },
    enabled: true
  },
  {
    id: "act_007",
    actionRef: "ACT-ASSIGN",
    workflowId: "consultant-assigned",
    actionType: "assignment",
    sequence: 1,
    config: { pool: "concierge-consultants" },
    enabled: true
  },
  {
    id: "act_008",
    actionRef: "ACT-REMIND-WA",
    workflowId: "reminder-sent",
    actionType: "whatsapp",
    sequence: 1,
    config: { template: "consultation-reminder-v1" },
    enabled: true
  },
  {
    id: "act_009",
    actionRef: "ACT-COMPLETE-CRM",
    workflowId: "consultation-completed",
    actionType: "crm-update",
    sequence: 1,
    config: { field: "consultation_status", value: "completed" },
    enabled: true
  },
  {
    id: "act_010",
    actionRef: "ACT-APPROVE-NOTIFY",
    workflowId: "application-approved",
    actionType: "notification",
    sequence: 1,
    config: { channel: "member-app" },
    enabled: true
  },
  {
    id: "act_011",
    actionRef: "ACT-INTRO-EMAIL",
    workflowId: "introduction-created",
    actionType: "email",
    sequence: 1,
    config: { template: "introduction-created-v1" },
    enabled: true
  },
  {
    id: "act_012",
    actionRef: "ACT-FOLLOW-CAL",
    workflowId: "follow-up-scheduled",
    actionType: "calendar",
    sequence: 1,
    config: { offsetDays: 3 },
    enabled: true
  },
  {
    id: "act_013",
    actionRef: "ACT-ARCHIVE",
    workflowId: "archive-completed",
    actionType: "archive",
    sequence: 1,
    config: { target: "journey-record" },
    enabled: true
  },
  {
    id: "act_014",
    actionRef: "ACT-STORY-EMAIL",
    workflowId: "success-story-requested",
    actionType: "email",
    sequence: 1,
    config: { template: "success-story-request-v1" },
    enabled: false
  }
];

export const WORKFLOW_HISTORY_SEED: WorkflowHistoryRecord[] = [
  {
    id: "run_001",
    historyRef: "RUN-2026-06-25-0042",
    workflowId: "payment-confirmed",
    status: "completed",
    triggeredBy: "paystack-webhook",
    triggerType: "payment",
    startedAt: "2026-06-25T14:55:00.000Z",
    completedAt: "2026-06-25T14:55:02.000Z",
    resultSummary: "Purchase email sent · CRM updated"
  },
  {
    id: "run_002",
    historyRef: "RUN-2026-06-25-0041",
    workflowId: "consultant-assigned",
    status: "completed",
    triggeredBy: "ops@bamsignal.com",
    triggerType: "admin-action",
    startedAt: "2026-06-25T14:30:00.000Z",
    completedAt: "2026-06-25T14:30:01.000Z",
    resultSummary: "Consultant assigned · notifications queued"
  },
  {
    id: "run_003",
    historyRef: "RUN-2026-06-25-0040",
    workflowId: "reminder-sent",
    status: "failed",
    triggeredBy: "cron-scheduler",
    triggerType: "date",
    startedAt: "2026-06-25T12:00:00.000Z",
    completedAt: "2026-06-25T12:00:03.000Z",
    resultSummary: "WhatsApp delivery timeout — retry scheduled"
  },
  {
    id: "run_004",
    historyRef: "RUN-2026-06-24-0188",
    workflowId: "application-received",
    status: "completed",
    triggeredBy: "status-engine",
    triggerType: "status-change",
    startedAt: "2026-06-24T16:20:00.000Z",
    completedAt: "2026-06-24T16:20:01.000Z",
    resultSummary: "Acknowledgement email sent"
  },
  {
    id: "run_005",
    historyRef: "RUN-2026-06-24-0187",
    workflowId: "introduction-created",
    status: "completed",
    triggeredBy: "journey-engine",
    triggerType: "journey-milestone",
    startedAt: "2026-06-24T15:10:00.000Z",
    completedAt: "2026-06-24T15:10:02.000Z",
    resultSummary: "Introduction email sent to both members"
  }
];

export const WORKFLOW_STEP_LOG_SEED: WorkflowStepLog[] = [
  {
    id: "step_001",
    runId: "run_001",
    actionType: "email",
    status: "completed",
    detail: "purchase-confirmation-v1 → member@example.com",
    executedAt: "2026-06-25T14:55:01.000Z"
  },
  {
    id: "step_002",
    runId: "run_001",
    actionType: "crm-update",
    status: "completed",
    detail: "payment_status=confirmed",
    executedAt: "2026-06-25T14:55:02.000Z"
  },
  {
    id: "step_003",
    runId: "run_003",
    actionType: "whatsapp",
    status: "failed",
    detail: "Sendchamp timeout after 3s",
    executedAt: "2026-06-25T12:00:03.000Z"
  }
];
