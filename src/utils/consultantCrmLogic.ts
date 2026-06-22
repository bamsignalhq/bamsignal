import {
  CONSULTANT_CRM_PIPELINE_LABELS,
  type ConsultantCrmSectionId,
  type ConsultantCrmViewId
} from "../constants/consultantCrm";
import { CONCIERGE_PROFESSIONAL_CHANNEL_LABELS } from "../constants/conciergeConsultantCommunication";
import { INTRODUCTION_PIPELINE_PHASES, INTRODUCTION_STATUS_LABELS } from "../constants/conciergeIntroduction";
import { APPLICATION_APPROVAL_STATUS_LABELS } from "../constants/applicationApproval";
import { CONSULTATION_PAYMENT_STATUS_LABELS } from "../constants/consultationPayment";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantActivity, ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type { ConsultationPayment } from "../types/consultationPayment";
import type {
  ConsultantCrmAgendaItem,
  ConsultantCrmActivityItem,
  ConsultantCrmBundle,
  ConsultantCrmPipelineStage,
  ConsultantCrmSectionRow,
  ConsultantCrmTask
} from "../types/consultantCrm";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";
import { listArchiveEligibleMembers } from "./conciergeJourneyArchive";
import {
  portfolioAssignedMembers,
  portfolioIntroductionsInProgress,
  portfolioOpenFollowUps,
  portfolioPendingConsultations,
  portfolioRelationshipUpdates,
  portfolioSuccessStories
} from "./conciergeConsultantMetrics";
import { listMeetingNotesForMember } from "./MeetingNotesEngine";
import { listConsultationPayments } from "./ConsultationPaymentEngine";

const PENDING_APPLICATION_STATUSES = new Set(["submitted", "under-review", "additional-information"]);
const PENDING_INTRO_STATUSES = new Set([
  "pending-review",
  "compatibility-review",
  "presented",
  "awaiting-response"
]);
const PENDING_INTRO_PHASES = new Set([
  "candidate-identified",
  "internal-review",
  "compatibility-review",
  "approved"
]);
const OPEN_PAYMENT_STATUSES = new Set(["pending", "initialized"]);

function emptySectionCounts(): Record<ConsultantCrmSectionId, number> {
  return {
    members: 0,
    applications: 0,
    consultations: 0,
    payments: 0,
    introductions: 0,
    "follow-ups": 0,
    "meeting-notes": 0,
    archives: 0,
    legacy: 0,
    stories: 0,
    performance: 0
  };
}

function emptySectionRows(): Record<ConsultantCrmSectionId, ConsultantCrmSectionRow[]> {
  return {
    members: [],
    applications: [],
    consultations: [],
    payments: [],
    introductions: [],
    "follow-ups": [],
    "meeting-notes": [],
    archives: [],
    legacy: [],
    stories: [],
    performance: []
  };
}

function pipelinePhaseLabel(phase: IntroductionRecord["pipelinePhase"]): string {
  return INTRODUCTION_PIPELINE_PHASES.find((entry) => entry.id === phase)?.label ?? phase;
}

function memberLabel(memberId: string, members: ConciergeMemberRecord[]): string {
  return members.find((member) => member.id === memberId)?.aboutYou.name ?? memberId;
}

function memberName(member: ConciergeMemberRecord): string {
  return member.aboutYou.name;
}

function introductionPairLabel(record: IntroductionRecord, members: ConciergeMemberRecord[]): string {
  return `${memberLabel(record.memberAId, members)} · ${memberLabel(record.memberBId, members)}`;
}

function buildPipeline(members: ConciergeMemberRecord[]): ConsultantCrmPipelineStage[] {
  const applications = members.filter(
    (member) =>
      member.status === "applied" ||
      member.status === "under-review" ||
      PENDING_APPLICATION_STATUSES.has(getApplicationReviewSummaryForMember(member).status)
  ).length;
  const consultations = portfolioPendingConsultations(members).length;
  const activeSearch = members.filter((member) => member.status === "active-search").length;
  const introductions = portfolioIntroductionsInProgress(members).length;
  const followUps = portfolioOpenFollowUps(members).length;
  const relationships = members.filter((member) =>
    ["relationship", "matched", "exclusive", "engaged", "married"].includes(member.status)
  ).length;

  return [
    {
      id: "applications",
      label: CONSULTANT_CRM_PIPELINE_LABELS.applications,
      count: applications,
      hint: "Awaiting review or decision"
    },
    {
      id: "consultations",
      label: CONSULTANT_CRM_PIPELINE_LABELS.consultations,
      count: consultations,
      hint: "Scheduled or needs booking"
    },
    {
      id: "active-search",
      label: CONSULTANT_CRM_PIPELINE_LABELS["active-search"],
      count: activeSearch,
      hint: "Actively searching"
    },
    {
      id: "introductions",
      label: CONSULTANT_CRM_PIPELINE_LABELS.introductions,
      count: introductions,
      hint: "Introductions in motion"
    },
    {
      id: "follow-ups",
      label: CONSULTANT_CRM_PIPELINE_LABELS["follow-ups"],
      count: followUps,
      hint: "Open consultant tasks"
    },
    {
      id: "relationships",
      label: CONSULTANT_CRM_PIPELINE_LABELS.relationships,
      count: relationships,
      hint: "Matched or in relationship"
    }
  ];
}

function buildTasks(members: ConciergeMemberRecord[]): ConsultantCrmTask[] {
  const now = Date.now();
  return portfolioOpenFollowUps(members).map(({ member, task }) => ({
    id: task.id,
    memberId: member.id,
    memberName: memberName(member),
    title: task.title,
    dueAt: task.dueAt,
    overdue: new Date(task.dueAt).getTime() < now,
    type: task.type
  }));
}

function buildAgenda(meetings: ConciergeScheduledMeeting[]): ConsultantCrmAgendaItem[] {
  const now = Date.now();
  return meetings
    .filter((meeting) => new Date(meeting.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((meeting) => ({
      id: meeting.id,
      memberId: meeting.memberId,
      memberName: meeting.memberName,
      scheduledAt: meeting.scheduledAt,
      channel: CONCIERGE_PROFESSIONAL_CHANNEL_LABELS[meeting.channel],
      notes: meeting.notes
    }));
}

function buildActivity(activity: ConciergeConsultantActivity[]): ConsultantCrmActivityItem[] {
  return [...activity]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 12)
    .map((entry) => ({
      id: entry.id,
      at: entry.at,
      label: entry.label,
      detail: entry.detail
    }));
}

function pendingApplicationMembers(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return members.filter((member) => {
    if (member.status === "applied" || member.status === "under-review") return true;
    const summary = getApplicationReviewSummaryForMember(member);
    return PENDING_APPLICATION_STATUSES.has(summary.status);
  });
}

function pendingIntroductionRecords(
  consultantId: string,
  introductions: IntroductionRecord[],
  members: ConciergeMemberRecord[]
): IntroductionRecord[] {
  const memberIds = new Set(members.map((member) => member.id));
  return introductions.filter(
    (record) =>
      record.consultantId === consultantId &&
      (PENDING_INTRO_STATUSES.has(record.status) || PENDING_INTRO_PHASES.has(record.pipelinePhase)) &&
      (memberIds.has(record.memberAId) || memberIds.has(record.memberBId))
  );
}

function healthAlertMembers(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  const now = Date.now();
  return members.filter((member) => {
    const flagged = member.flags.some(
      (flag) => flag === "high-priority" || flag === "sensitive-case"
    );
    const overdue = member.followUpTasks.some(
      (task) => !task.completed && new Date(task.dueAt).getTime() < now
    );
    return flagged || overdue;
  });
}

function buildSectionRows(input: {
  members: ConciergeMemberRecord[];
  meetings: ConciergeScheduledMeeting[];
  introductions: IntroductionRecord[];
  payments: ConsultationPayment[];
  consultantId: string;
}): { counts: Record<ConsultantCrmSectionId, number>; rows: Record<ConsultantCrmSectionId, ConsultantCrmSectionRow[]> } {
  const { members, meetings, introductions, payments, consultantId } = input;
  const counts = emptySectionCounts();
  const rows = emptySectionRows();

  const assigned = portfolioAssignedMembers(members);
  counts.members = assigned.length;
  rows.members = assigned.map((member) => ({
    id: member.id,
    primary: memberName(member),
    secondary: member.aboutYou.city,
    meta: member.status
  }));

  const pendingApps = pendingApplicationMembers(members);
  counts.applications = pendingApps.length;
  rows.applications = pendingApps.map((member) => {
    const summary = getApplicationReviewSummaryForMember(member);
    return {
      id: member.id,
      primary: memberName(member),
      secondary: APPLICATION_APPROVAL_STATUS_LABELS[summary.status],
      meta: member.status
    };
  });

  const pendingConsults = portfolioPendingConsultations(members);
  counts.consultations = pendingConsults.length;
  rows.consultations = pendingConsults.map((member) => ({
    id: member.id,
    primary: memberName(member),
    secondary: member.status,
    meta: meetings.find((meeting) => meeting.memberId === member.id)?.scheduledAt
  }));

  const openPayments = payments.filter((payment) => OPEN_PAYMENT_STATUSES.has(payment.status));
  counts.payments = openPayments.length;
  rows.payments = openPayments.map((payment) => ({
    id: payment.id,
    primary: payment.memberName,
    secondary: CONSULTATION_PAYMENT_STATUS_LABELS[payment.status],
    meta: payment.paymentId
  }));

  const pendingIntros = pendingIntroductionRecords(consultantId, introductions, members);
  counts.introductions = pendingIntros.length;
  rows.introductions = pendingIntros.map((record) => ({
    id: record.id,
    primary: introductionPairLabel(record, members),
    secondary: INTRODUCTION_STATUS_LABELS[record.status],
    meta: pipelinePhaseLabel(record.pipelinePhase)
  }));

  const followUpRows = portfolioOpenFollowUps(members);
  counts["follow-ups"] = followUpRows.length;
  rows["follow-ups"] = followUpRows.map(({ member, task }) => ({
    id: task.id,
    primary: memberName(member),
    secondary: task.title,
    meta: task.dueAt
  }));

  const noteRows = members.flatMap((member) =>
    listMeetingNotesForMember(member.id).map((note) => ({
      id: note.id,
      primary: memberName(member),
      secondary: note.title,
      meta: note.heldAt
    }))
  );
  counts["meeting-notes"] = noteRows.length;
  rows["meeting-notes"] = noteRows.slice(0, 20);

  const archiveEligible = listArchiveEligibleMembers(members);
  counts.archives = archiveEligible.length;
  rows.archives = archiveEligible.map((member) => ({
    id: member.id,
    primary: memberName(member),
    secondary: member.status,
    meta: member.updatedAt
  }));

  const legacyMembers = members.filter((member) => Boolean(member.relationshipLegacyIndex));
  counts.legacy = legacyMembers.length;
  rows.legacy = legacyMembers.map((member) => ({
    id: member.id,
    primary: memberName(member),
    secondary: member.relationshipLegacyIndex?.legacyStatus ?? "registered",
    meta: member.relationshipLegacyIndex?.journeyId
  }));

  const stories = portfolioSuccessStories(members);
  counts.stories = stories.length;
  rows.stories = stories.map((member) => ({
    id: member.id,
    primary: memberName(member),
    secondary: member.aboutYou.city,
    meta: "success-story"
  }));

  const relationshipUpdates = portfolioRelationshipUpdates(members);
  counts.performance = relationshipUpdates.length;
  rows.performance = relationshipUpdates.map((member) => ({
    id: member.id,
    primary: memberName(member),
    secondary: "Relationship update",
    meta: member.updatedAt
  }));

  return { counts, rows };
}

export function buildConsultantCrmBundle(input: {
  consultantId: string;
  members: ConciergeMemberRecord[];
  meetings: ConciergeScheduledMeeting[];
  activity: ConciergeConsultantActivity[];
  introductions: IntroductionRecord[];
  payments: ConsultationPayment[];
}): ConsultantCrmBundle {
  const { members, meetings, activity } = input;
  const { counts, rows } = buildSectionRows(input);

  return {
    pipeline: buildPipeline(members),
    tasks: buildTasks(members),
    agenda: buildAgenda(meetings),
    activity: buildActivity(activity),
    sectionCounts: counts,
    sectionRows: rows
  };
}

export function resolveCrmViewSection(view: ConsultantCrmViewId): ConsultantCrmSectionId {
  switch (view) {
    case "my-members":
      return "members";
    case "my-meetings":
      return "consultations";
    case "pending-applications":
      return "applications";
    case "pending-introductions":
      return "introductions";
    case "follow-ups":
      return "follow-ups";
    case "health-alerts":
      return "members";
    default:
      return "members";
  }
}

export function filterCrmSectionRows(
  bundle: ConsultantCrmBundle,
  section: ConsultantCrmSectionId,
  view: ConsultantCrmViewId | null,
  members: ConciergeMemberRecord[],
  consultantId: string,
  introductions: IntroductionRecord[]
): ConsultantCrmSectionRow[] {
  if (!view) return bundle.sectionRows[section];

  if (view === "health-alerts" && section === "members") {
    return healthAlertMembers(members).map((member) => ({
      id: member.id,
      primary: memberName(member),
      secondary: member.flags.join(", ") || "Overdue follow-up",
      meta: member.status
    }));
  }

  if (view === "my-meetings" && section === "consultations") {
    return bundle.agenda.map((item) => ({
      id: item.id,
      primary: item.memberName,
      secondary: item.channel,
      meta: item.scheduledAt
    }));
  }

  if (view === "pending-applications") {
    return bundle.sectionRows.applications;
  }

  if (view === "pending-introductions") {
    return pendingIntroductionRecords(consultantId, introductions, members).map((record) => ({
      id: record.id,
      primary: introductionPairLabel(record, members),
      secondary: INTRODUCTION_STATUS_LABELS[record.status],
      meta: record.introductionId
    }));
  }

  if (view === "follow-ups") {
    return bundle.sectionRows["follow-ups"];
  }

  if (view === "my-members") {
    return bundle.sectionRows.members;
  }

  return bundle.sectionRows[section];
}

export function openPaymentRowsForMembers(members: ConciergeMemberRecord[]): ConsultationPayment[] {
  const memberIds = new Set(members.map((member) => member.id));
  return listConsultationPayments().filter(
    (payment) => memberIds.has(payment.memberId) && OPEN_PAYMENT_STATUSES.has(payment.status)
  );
}
