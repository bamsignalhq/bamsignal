import { APPLICATION_APPROVAL_STATUS_LABELS } from "../constants/applicationApproval";
import { CONSULTATION_EVENT_STATUS_LABELS } from "../constants/consultationScheduling";
import { CONCIERGE_PROFESSIONAL_CHANNEL_LABELS } from "../constants/conciergeConsultantCommunication";
import { INTRODUCTION_STATUS_LABELS } from "../constants/conciergeIntroduction";
import {
  OPERATIONS_CENTER_METRICS,
  OPERATIONS_CONSULTATION_BUCKETS,
  OPERATIONS_FOLLOW_UP_BUCKETS,
  OPERATIONS_INTRODUCTION_BUCKETS,
  OPERATIONS_PAYMENT_BUCKETS
} from "../constants/operationsCenter";
import { RELATIONSHIP_HEALTH_LABELS } from "../constants/relationshipFollowUp";
import { MEETING_LINK_CHANNEL_LABELS } from "../constants/meetingLink";
import { MEETING_STATUS_LABELS } from "../constants/meetingInfrastructure";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type { RelationshipFollowUpRecord } from "../types/relationshipFollowUp";
import type {
  OperationsCenterAssignmentRow,
  OperationsCenterBundle,
  OperationsCenterConsultationBucket,
  OperationsCenterConsultationRow,
  OperationsCenterFollowUpBucket,
  OperationsCenterFollowUpRow,
  OperationsCenterIntroductionBucket,
  OperationsCenterIntroductionRow,
  OperationsCenterMeetingLinkRow,
  OperationsCenterMetric,
  OperationsCenterNotificationRow,
  OperationsCenterPaymentRow,
  OperationsCenterSchedulingRow,
  OperationsCenterWorkloadRow
} from "../types/operationsCenter";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";
import {
  buildAssignmentSummary,
  listConsultantWorkloadProfiles,
  recommendConsultantForMember
} from "./consultantAssignmentEngine";
import { listConciergeMembers } from "./conciergeConsultantStore";
import {
  listOpenConsultationSlots,
  listSchedulingAvailability,
  listSchedulingEvents,
  syncSchedulingAvailability
} from "./ConsultationSchedulingEngine";
import { listConsultationPayments } from "./ConsultationPaymentEngine";
import { listConciergeEmailRecords, markConciergeEmailStatus } from "./EmailNotificationEngine";
import { listIntroductionRecords } from "./conciergeIntroductionStore";
import { meetingAccessLabel } from "./meetingLinkLogic";
import { listMeetingInfrastructureRecords } from "./MeetingInfrastructureEngine";
import { listRelationshipFollowUpRecords } from "./relationshipFollowUpStore";
import { getRelationshipSupportQueue } from "./RelationshipHealthAlertsEngine";
import { listRelationshipLegacyIndexRecords } from "./relationshipLegacyIndexStore";
import { latestEmailStatus } from "./emailNotificationLogic";
import { latestWhatsappStatus } from "./whatsappNotificationLogic";
import { listConciergeWhatsappRecords, applyWhatsappSendResult } from "./WhatsappNotificationEngine";
import { appendWhatsappTimelineEntry } from "./whatsappNotificationLogic";

const PENDING_APPLICATION_STATUSES = new Set(["submitted", "under-review", "additional-information"]);
const ACTIVE_INTRO_STATUSES = new Set([
  "accepted",
  "active-conversation",
  "exclusive",
  "relationship",
  "engaged"
]);
const COMPLETED_INTRO_STATUSES = new Set(["married", "closed", "declined"]);
const REVIEW_INTRO_STATUSES = new Set(["pending-review", "compatibility-review"]);

function emptyConsultationBuckets(): OperationsCenterBundle["consultations"] {
  return {
    upcoming: [],
    completed: [],
    "no-show": [],
    cancelled: [],
    rescheduled: []
  };
}

function emptyPaymentBuckets(): OperationsCenterBundle["payments"] {
  return {
    pending: [],
    initialized: [],
    paid: [],
    refunded: [],
    failed: [],
    cancelled: []
  };
}

function emptyIntroductionBuckets(): OperationsCenterBundle["introductions"] {
  return {
    "awaiting-review": [],
    "awaiting-consent": [],
    active: [],
    completed: []
  };
}

function emptyFollowUpBuckets(): OperationsCenterBundle["followUps"] {
  return {
    "needs-attention": [],
    paused: [],
    healthy: [],
    escalated: []
  };
}

function memberLabel(memberId: string, members: ConciergeMemberRecord[]): string {
  return members.find((member) => member.id === memberId)?.aboutYou.name ?? memberId;
}

function consultationBucketForStatus(
  status: OperationsCenterConsultationRow["status"],
  scheduledAt: string
): OperationsCenterConsultationBucket {
  if (status === "completed") return "completed";
  if (status === "no-show") return "no-show";
  if (status === "cancelled") return "cancelled";
  if (status === "rescheduled") return "rescheduled";
  if (status === "scheduled" || status === "confirmed") {
    return new Date(scheduledAt).getTime() >= Date.now() ? "upcoming" : "completed";
  }
  return "upcoming";
}

function introductionBucket(record: IntroductionRecord): OperationsCenterIntroductionBucket {
  if (COMPLETED_INTRO_STATUSES.has(record.status)) return "completed";
  if (REVIEW_INTRO_STATUSES.has(record.status)) return "awaiting-review";
  if (
    record.status === "presented" ||
    record.status === "awaiting-response" ||
    !record.bothConsented
  ) {
    return "awaiting-consent";
  }
  if (ACTIVE_INTRO_STATUSES.has(record.status)) return "active";
  return "awaiting-review";
}

function followUpBucket(
  record: RelationshipFollowUpRecord,
  escalatedIntroductionIds: Set<string>
): OperationsCenterFollowUpBucket {
  if (escalatedIntroductionIds.has(record.introductionId)) return "escalated";
  if (record.paused) return "paused";
  if (
    record.healthLevel === "requires-attention" ||
    record.healthLevel === "needs-support" ||
    record.recoveryNotes.some((note) => !note.resolved)
  ) {
    return "needs-attention";
  }
  return "healthy";
}

function buildMetrics(members: ConciergeMemberRecord[]): OperationsCenterMetric[] {
  const applications = members.filter(
    (member) =>
      member.status === "applied" ||
      member.status === "under-review" ||
      PENDING_APPLICATION_STATUSES.has(getApplicationReviewSummaryForMember(member).status)
  ).length;
  const consultations = listSchedulingEvents().length;
  const payments = listConsultationPayments().length;
  const assignments = members.filter(
    (member) => !member.currentConsultantId && !member.assignedConsultantId
  ).length;
  const introductions = listIntroductionRecords().length;
  const relationships = members.filter((member) =>
    ["relationship", "matched", "exclusive", "engaged"].includes(member.status)
  ).length;
  const engagements = members.filter((member) => member.status === "engaged").length;
  const marriages = members.filter((member) => member.status === "married").length;
  const legacyFamilies = listRelationshipLegacyIndexRecords().length;

  const counts: Record<string, number> = {
    applications,
    consultations,
    payments,
    assignments,
    introductions,
    relationships,
    engagements,
    marriages,
    "legacy-families": legacyFamilies
  };

  return OPERATIONS_CENTER_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    count: counts[metric.id] ?? 0
  }));
}

function buildConsultations(): OperationsCenterBundle["consultations"] {
  const buckets = emptyConsultationBuckets();
  for (const event of listSchedulingEvents()) {
    const row: OperationsCenterConsultationRow = {
      id: event.id,
      memberName: event.memberName,
      journeyId: event.journeyId,
      consultantName: event.consultantName,
      scheduledAt: event.scheduledAt,
      status: event.status,
      channel:
        CONCIERGE_PROFESSIONAL_CHANNEL_LABELS[
          event.channel as keyof typeof CONCIERGE_PROFESSIONAL_CHANNEL_LABELS
        ] ?? event.channel
    };
    const bucket = consultationBucketForStatus(event.status, event.scheduledAt);
    buckets[bucket].push(row);
  }

  for (const bucket of OPERATIONS_CONSULTATION_BUCKETS) {
    buckets[bucket].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }
  return buckets;
}

function buildPayments(): OperationsCenterBundle["payments"] {
  const buckets = emptyPaymentBuckets();
  for (const payment of listConsultationPayments()) {
    const row: OperationsCenterPaymentRow = {
      id: payment.id,
      paymentId: payment.paymentId,
      memberName: payment.memberName,
      journeyId: payment.journeyId,
      status: payment.status,
      amountLabel: payment.amountLabel,
      updatedAt: payment.updatedAt
    };
    buckets[payment.status].push(row);
  }
  for (const bucket of OPERATIONS_PAYMENT_BUCKETS) {
    buckets[bucket].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  return buckets;
}

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function buildScheduling(): OperationsCenterBundle["scheduling"] {
  const events = listSchedulingEvents();
  const todayCalendar: OperationsCenterSchedulingRow[] = events
    .filter((event) => isToday(event.scheduledAt))
    .map((event) => ({
      id: event.id,
      label: `${event.memberName} · ${CONSULTATION_EVENT_STATUS_LABELS[event.status]}`,
      detail: `${event.consultantName} · ${new Date(event.scheduledAt).toLocaleTimeString()}`,
      at: event.scheduledAt
    }));

  const upcomingBookings: OperationsCenterSchedulingRow[] = events
    .filter(
      (event) =>
        ["scheduled", "confirmed"].includes(event.status) &&
        new Date(event.scheduledAt).getTime() >= Date.now()
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((event) => ({
      id: event.id,
      label: event.memberName,
      detail: `${event.consultantName} · ${new Date(event.scheduledAt).toLocaleString()}`,
      at: event.scheduledAt
    }));

  const availableSlots: OperationsCenterSchedulingRow[] = listSchedulingAvailability()
    .flatMap((availability) =>
      listOpenConsultationSlots(availability.consultantId).map((slot) => ({
        id: slot.id,
        label: availability.consultantName,
        detail: new Date(slot.startsAt).toLocaleString(),
        at: slot.startsAt
      }))
    )
    .sort((a, b) => new Date(a.at ?? 0).getTime() - new Date(b.at ?? 0).getTime());

  const consultantCalendars: OperationsCenterSchedulingRow[] = listSchedulingAvailability().map(
    (availability) => ({
      id: availability.consultantId,
      label: availability.consultantName,
      detail: `${availability.slots.filter((slot) => slot.available).length} open slots · ${availability.timezone}`,
      at: availability.updatedAt
    })
  );

  const meetingLinks: OperationsCenterMeetingLinkRow[] = listMeetingInfrastructureRecords().map(
    (record) => ({
      id: record.id,
      memberName: record.memberName,
      channel: MEETING_LINK_CHANNEL_LABELS[record.channel] ?? record.channel,
      status: MEETING_STATUS_LABELS[record.status] ?? record.status,
      accessPreview: meetingAccessLabel(record.channel, record.access),
      scheduledAt: record.scheduledAt
    })
  );

  return {
    todayCalendar,
    upcomingBookings,
    availableSlots,
    consultantCalendars,
    meetingLinks
  };
}

function buildAssignmentQueue(members: ConciergeMemberRecord[]): OperationsCenterBundle["assignmentQueue"] {
  const unassignedApplications: OperationsCenterAssignmentRow[] = [];
  const pendingReview: OperationsCenterAssignmentRow[] = [];
  const recommendations: OperationsCenterAssignmentRow[] = [];

  for (const member of members) {
    const unassigned = !member.currentConsultantId && !member.assignedConsultantId;
    const review = getApplicationReviewSummaryForMember(member);
    const pending = PENDING_APPLICATION_STATUSES.has(review.status);

    if (unassigned && (member.status === "applied" || member.status === "under-review" || pending)) {
      unassignedApplications.push({
        id: member.id,
        memberName: member.aboutYou.name,
        journeyId: member.journeyId,
        journeyStage: SIGNAL_CONCIERGE_STATUS_LABELS[member.status],
        city: member.aboutYou.city,
        reason: "No steward assigned"
      });
    }

    if (pending) {
      pendingReview.push({
        id: member.id,
        memberName: member.aboutYou.name,
        journeyId: member.journeyId,
        journeyStage: APPLICATION_APPROVAL_STATUS_LABELS[review.status],
        city: member.aboutYou.city,
        currentStewardName: member.assignedConsultantName
      });
    }

    if (unassigned) {
      const summary = buildAssignmentSummary(member);
      const recommendation = recommendConsultantForMember(member);
      if (summary || recommendation) {
        recommendations.push({
          id: member.id,
          memberName: member.aboutYou.name,
          journeyId: member.journeyId,
          journeyStage: SIGNAL_CONCIERGE_STATUS_LABELS[member.status],
          city: member.aboutYou.city,
          currentStewardName: summary?.currentStewardName,
          recommendedConsultantName:
            summary?.recommendedConsultantName ?? recommendation?.consultantName,
          confidence: summary?.confidence ?? recommendation?.confidence,
          level: summary?.level ?? recommendation?.level,
          reason: summary?.reason.label ?? recommendation?.reason.label
        });
      }
    }
  }

  const workloadOverview: OperationsCenterWorkloadRow[] = listConsultantWorkloadProfiles().map(
    (workload) => ({
      consultantId: workload.consultantId,
      consultantName: workload.consultantName,
      health: workload.health,
      capacityLevel: workload.capacityLevel,
      activeMembers: workload.activeMembers,
      pendingConsultations: workload.pendingConsultations,
      introductionsInProgress: workload.introductionsInProgress,
      pendingFollowUps: workload.pendingFollowUps,
      upcomingMeetings: workload.upcomingMeetings,
      responseTimeHours: workload.responseTimeHours,
      regionLabel: workload.regionLabel,
      workloadScore: workload.workloadScore,
      summary: workload.summary
    })
  );

  return {
    unassignedApplications,
    pendingReview,
    workloadOverview,
    recommendations
  };
}

function buildNotifications(): OperationsCenterBundle["notifications"] {
  const emailQueue: OperationsCenterNotificationRow[] = [];
  const whatsappQueue: OperationsCenterNotificationRow[] = [];
  const failedDeliveries: OperationsCenterNotificationRow[] = [];

  for (const record of listConciergeEmailRecords()) {
    const status = latestEmailStatus(record.timeline);
    const row: OperationsCenterNotificationRow = {
      id: record.id,
      channel: "email",
      memberName: record.memberName,
      journeyId: record.journeyId,
      templateLabel: record.templateId,
      status,
      updatedAt: record.updatedAt,
      preview: record.preview
    };
    if (status === "queued") emailQueue.push(row);
    if (status === "failed") failedDeliveries.push(row);
  }

  for (const record of listConciergeWhatsappRecords()) {
    const status = latestWhatsappStatus(record.timeline);
    const row: OperationsCenterNotificationRow = {
      id: record.id,
      channel: "whatsapp",
      memberName: record.memberName,
      journeyId: record.journeyId,
      templateLabel: record.templateId,
      status,
      updatedAt: record.updatedAt,
      preview: record.preview
    };
    if (status === "queued") whatsappQueue.push(row);
    if (status === "failed") failedDeliveries.push(row);
  }

  return { emailQueue, whatsappQueue, failedDeliveries };
}

function buildIntroductions(members: ConciergeMemberRecord[]): OperationsCenterBundle["introductions"] {
  const buckets = emptyIntroductionBuckets();
  for (const record of listIntroductionRecords()) {
    const row: OperationsCenterIntroductionRow = {
      id: record.id,
      introductionId: record.introductionId,
      pairLabel: `${memberLabel(record.memberAId, members)} · ${memberLabel(record.memberBId, members)}`,
      consultantName: record.consultantName,
      status: INTRODUCTION_STATUS_LABELS[record.status],
      updatedAt: record.updatedAt
    };
    buckets[introductionBucket(record)].push(row);
  }
  for (const bucket of OPERATIONS_INTRODUCTION_BUCKETS) {
    buckets[bucket].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  return buckets;
}

function buildFollowUps(members: ConciergeMemberRecord[]): OperationsCenterBundle["followUps"] {
  const buckets = emptyFollowUpBuckets();
  const escalatedIntroductionIds = new Set(
    getRelationshipSupportQueue()
      .map((alert) => alert.introductionId)
      .filter((id): id is string => Boolean(id))
  );

  for (const record of listRelationshipFollowUpRecords()) {
    const row: OperationsCenterFollowUpRow = {
      id: record.id,
      introductionId: record.introductionId,
      pairLabel: `${memberLabel(record.memberAId, members)} · ${memberLabel(record.memberBId, members)}`,
      consultantName: record.consultantName,
      healthLevel: record.healthLevel ? RELATIONSHIP_HEALTH_LABELS[record.healthLevel] : undefined,
      stage: record.stage,
      updatedAt: record.updatedAt,
      paused: record.paused
    };
    buckets[followUpBucket(record, escalatedIntroductionIds)].push(row);
  }

  for (const bucket of OPERATIONS_FOLLOW_UP_BUCKETS) {
    buckets[bucket].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  return buckets;
}

export function buildOperationsCenterBundle(): OperationsCenterBundle {
  syncSchedulingAvailability();
  const members = listConciergeMembers();

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildMetrics(members),
    consultations: buildConsultations(),
    payments: buildPayments(),
    scheduling: buildScheduling(),
    assignmentQueue: buildAssignmentQueue(members),
    notifications: buildNotifications(),
    introductions: buildIntroductions(members),
    followUps: buildFollowUps(members)
  };
}

export function retryOperationsCenterNotification(
  row: OperationsCenterNotificationRow
): OperationsCenterNotificationRow | null {
  if (row.channel === "email") {
    const updated = markConciergeEmailStatus(row.id, "queued", "Retry queued from Operations Center™");
    if (!updated) return null;
    return { ...row, status: "queued", updatedAt: updated.updatedAt };
  }

  const existing = listConciergeWhatsappRecords().find((record) => record.id === row.id);
  if (!existing) return null;
  const timeline = appendWhatsappTimelineEntry(existing.timeline, "queued", new Date().toISOString(), "Retry queued from Operations Center™");
  const updated = applyWhatsappSendResult({ recordId: row.id, timeline });
  if (!updated) return null;
  return { ...row, status: "queued", updatedAt: updated.updatedAt };
}
