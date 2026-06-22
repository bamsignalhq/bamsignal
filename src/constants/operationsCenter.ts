import type {
  OperationsCenterConsultationBucket,
  OperationsCenterFollowUpBucket,
  OperationsCenterIntroductionBucket,
  OperationsCenterMetricId,
  OperationsCenterPaymentBucket,
  OperationsCenterSectionId
} from "../types/operationsCenter";

export const OPERATIONS_CENTER_BRAND = "Signal Concierge Operations Center™";
export const OPERATIONS_CENTER_NAV_LABEL = "Operations Center™";
export const OPERATIONS_CENTER_PATH = "/hard/concierge/operations";
export const CONCIERGE_ADMIN_DASHBOARD_PATH = "/hard/concierge";

export const OPERATIONS_CENTER_SECTIONS: {
  id: OperationsCenterSectionId;
  label: string;
  hint: string;
}[] = [
  { id: "consultations", label: "Consultations", hint: "Scheduled concierge sessions across the pipeline." },
  { id: "payments", label: "Payments", hint: "Consultation fee lifecycle from Paystack." },
  { id: "scheduling", label: "Scheduling", hint: "Calendar, slots, and meeting infrastructure." },
  { id: "assignment-queue", label: "Assignment Queue", hint: "Unassigned journeys and consultant workload." },
  { id: "notifications", label: "Notifications", hint: "Notification Operations Center™ — delivery queues and metrics." },
  { id: "introductions", label: "Introductions", hint: "Introduction Engine™ review and consent pipeline." },
  { id: "follow-up", label: "Relationship Follow-up", hint: "Active relationship stewardship and escalations." },
  {
    id: "regional-teams",
    label: "Regional Teams",
    hint: "Regional Consultant Teams™ — directors, coverage, and assignments."
  }
];

export const OPERATIONS_CENTER_METRICS: {
  id: OperationsCenterMetricId;
  label: string;
}[] = [
  { id: "applications", label: "Applications" },
  { id: "consultations", label: "Consultations" },
  { id: "payments", label: "Payments" },
  { id: "assignments", label: "Assignments" },
  { id: "introductions", label: "Introductions" },
  { id: "relationships", label: "Relationships" },
  { id: "engagements", label: "Engagements" },
  { id: "marriages", label: "Marriages" },
  { id: "legacy-families", label: "Legacy Families" }
];

export const OPERATIONS_CONSULTATION_BUCKETS: OperationsCenterConsultationBucket[] = [
  "upcoming",
  "completed",
  "no-show",
  "cancelled",
  "rescheduled"
];

export const OPERATIONS_CONSULTATION_BUCKET_LABELS: Record<OperationsCenterConsultationBucket, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  "no-show": "No-show",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled"
};

export const OPERATIONS_PAYMENT_BUCKETS: OperationsCenterPaymentBucket[] = [
  "pending",
  "initialized",
  "paid",
  "refunded",
  "failed",
  "cancelled"
];

export const OPERATIONS_INTRODUCTION_BUCKETS: OperationsCenterIntroductionBucket[] = [
  "awaiting-review",
  "awaiting-consent",
  "active",
  "completed"
];

export const OPERATIONS_INTRODUCTION_BUCKET_LABELS: Record<OperationsCenterIntroductionBucket, string> = {
  "awaiting-review": "Awaiting Review",
  "awaiting-consent": "Awaiting Consent",
  active: "Active Introductions",
  completed: "Completed Introductions"
};

export const OPERATIONS_FOLLOW_UP_BUCKETS: OperationsCenterFollowUpBucket[] = [
  "needs-attention",
  "paused",
  "healthy",
  "escalated"
];

export const OPERATIONS_FOLLOW_UP_BUCKET_LABELS: Record<OperationsCenterFollowUpBucket, string> = {
  "needs-attention": "Needs Attention",
  paused: "Paused",
  healthy: "Healthy",
  escalated: "Escalated"
};
