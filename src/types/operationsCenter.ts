import type { ConsultationEventStatus } from "./consultationScheduling";
import type { ConsultationPaymentStatus } from "./consultationPayment";
import type { NotificationOperationsBundle } from "./notificationOperations";
import type { AssignmentConfidence, RecommendationLevel } from "./consultantAssignment";
import type { WorkloadHealth } from "./consultantAssignment";

export type OperationsCenterSectionId =
  | "consultations"
  | "payments"
  | "scheduling"
  | "assignment-queue"
  | "notifications"
  | "introductions"
  | "follow-up";

export type OperationsCenterMetricId =
  | "applications"
  | "consultations"
  | "payments"
  | "assignments"
  | "introductions"
  | "relationships"
  | "engagements"
  | "marriages"
  | "legacy-families";

export type OperationsCenterConsultationBucket =
  | "upcoming"
  | "completed"
  | "no-show"
  | "cancelled"
  | "rescheduled";

export type OperationsCenterPaymentBucket = ConsultationPaymentStatus;

export type OperationsCenterIntroductionBucket =
  | "awaiting-review"
  | "awaiting-consent"
  | "active"
  | "completed";

export type OperationsCenterFollowUpBucket =
  | "needs-attention"
  | "paused"
  | "healthy"
  | "escalated";

export type OperationsCenterMetric = {
  id: OperationsCenterMetricId;
  label: string;
  count: number;
  hint?: string;
};

export type OperationsCenterConsultationRow = {
  id: string;
  memberName: string;
  journeyId?: string;
  consultantName: string;
  scheduledAt: string;
  status: ConsultationEventStatus;
  channel: string;
  reviewId?: string;
  outcomeLabel?: string;
  recommendationLabel?: string;
};

export type OperationsCenterPaymentRow = {
  id: string;
  paymentId: string;
  memberName: string;
  journeyId?: string;
  status: ConsultationPaymentStatus;
  amountLabel: string;
  updatedAt: string;
};

export type OperationsCenterSchedulingRow = {
  id: string;
  label: string;
  detail: string;
  at?: string;
};

export type OperationsCenterMeetingLinkRow = {
  id: string;
  memberName: string;
  channel: string;
  status: string;
  accessPreview: string;
  scheduledAt?: string;
};

export type OperationsCenterAssignmentRow = {
  id: string;
  memberName: string;
  journeyId?: string;
  journeyStage: string;
  city: string;
  currentStewardName?: string;
  recommendedConsultantName?: string;
  confidence?: AssignmentConfidence;
  level?: RecommendationLevel;
  reason?: string;
};

export type OperationsCenterWorkloadRow = {
  consultantId: string;
  consultantName: string;
  health: WorkloadHealth;
  capacityLevel: RecommendationLevel;
  activeMembers: number;
  pendingConsultations: number;
  introductionsInProgress: number;
  pendingFollowUps: number;
  upcomingMeetings: number;
  responseTimeHours: number | null;
  regionLabel: string;
  workloadScore: number;
  summary: string;
};

export type OperationsCenterNotificationRow = {
  id: string;
  channel: "email" | "whatsapp";
  memberName: string;
  journeyId?: string;
  templateLabel: string;
  status: string;
  updatedAt: string;
  preview: string;
};

export type OperationsCenterIntroductionRow = {
  id: string;
  introductionId: string;
  pairLabel: string;
  consultantName?: string;
  status: string;
  updatedAt: string;
};

export type OperationsCenterFollowUpRow = {
  id: string;
  introductionId: string;
  pairLabel: string;
  consultantName?: string;
  healthLevel?: string;
  stage: string;
  updatedAt: string;
  paused: boolean;
};

export type OperationsCenterBundle = {
  generatedAt: string;
  metrics: OperationsCenterMetric[];
  consultations: Record<OperationsCenterConsultationBucket, OperationsCenterConsultationRow[]>;
  payments: Record<OperationsCenterPaymentBucket, OperationsCenterPaymentRow[]>;
  scheduling: {
    todayCalendar: OperationsCenterSchedulingRow[];
    upcomingBookings: OperationsCenterSchedulingRow[];
    availableSlots: OperationsCenterSchedulingRow[];
    consultantCalendars: OperationsCenterSchedulingRow[];
    meetingLinks: OperationsCenterMeetingLinkRow[];
  };
  assignmentQueue: {
    unassignedApplications: OperationsCenterAssignmentRow[];
    pendingReview: OperationsCenterAssignmentRow[];
    workloadOverview: OperationsCenterWorkloadRow[];
    recommendations: OperationsCenterAssignmentRow[];
  };
  notifications: NotificationOperationsBundle;
  introductions: Record<OperationsCenterIntroductionBucket, OperationsCenterIntroductionRow[]>;
  followUps: Record<OperationsCenterFollowUpBucket, OperationsCenterFollowUpRow[]>;
};
