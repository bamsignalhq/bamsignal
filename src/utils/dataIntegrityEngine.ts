import { isValidJourneyId, normalizeJourneyId } from "../constants/journeyId";
import { DATA_INTEGRITY_CHECKS } from "../constants/dataIntegrity";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../constants/journeyIntegrityAudit";
import type { DataIntegrityBundle, IntegrityIssue } from "../types/dataIntegrity";
import { listConsultationPayments } from "./ConsultationPaymentEngine";
import { listSchedulingEvents } from "./ConsultationSchedulingEngine";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { listConciergeConsultants } from "./conciergeConsultantDirectoryStore";
import { listIntroductionRecords } from "./conciergeIntroductionStore";
import { listArchivedMemberIds } from "./conciergeJourneyArchive";
import {
  findDuplicateJourneyIds,
  findFinanceRecordsMissingJourneyRef
} from "./journeyIntegrityAudit";
import { listMeetingInfrastructureRecords } from "./MeetingInfrastructureEngine";
import { buildNotificationOperationsBundle } from "./notificationOperationsEngine";
import { listRelationshipFollowUpRecords } from "./relationshipFollowUpStore";
import { listRelationshipLegacyIndexRecords } from "./relationshipLegacyIndexStore";
import { buildCheckResult, buildIntegritySummary } from "./dataIntegrityLogic";

function issue(
  checkId: IntegrityIssue["checkId"],
  id: string,
  title: string,
  detail: string,
  severity: IntegrityIssue["severity"] = "warning"
): IntegrityIssue {
  return { id, checkId, title, detail, severity };
}

function memberMap() {
  const members = listConciergeMembers();
  return {
    members,
    memberIds: new Set(members.map((member) => member.id)),
    journeyIds: new Set(members.map((member) => member.journeyId).filter(Boolean) as string[])
  };
}

function checkJourneyIds(): ReturnType<typeof buildCheckResult> {
  const { members } = memberMap();
  const issues: IntegrityIssue[] = [];

  const missing = members.filter((member) => !member.journeyId).map((member) => member.id);
  if (missing.length) {
    issues.push(
      issue(
        "journey-ids",
        "journey-missing",
        "Members missing journey ID",
        `${missing.length} member(s) without BS-JR journey backbone.`,
        "critical"
      )
    );
  }

  const invalid = members.filter(
    (member) => member.journeyId && !isValidJourneyId(member.journeyId)
  );
  if (invalid.length) {
    issues.push(
      issue(
        "journey-ids",
        "journey-invalid-format",
        "Invalid journey ID format",
        `${invalid.length} member(s) with non-canonical journey ID format.`,
        "critical"
      )
    );
  }

  const seen = new Map<string, string>();
  for (const member of members) {
    if (!member.journeyId) continue;
    const normalized = normalizeJourneyId(member.journeyId);
    const owner = seen.get(normalized);
    if (owner && owner !== member.id) {
      issues.push(
        issue(
          "journey-ids",
          `journey-dup-${normalized}`,
          "Duplicate journey ID",
          `${normalized} assigned to multiple members.`,
          "critical"
        )
      );
    } else {
      seen.set(normalized, member.id);
    }
  }

  const seedDuplicates = findDuplicateJourneyIds();
  if (seedDuplicates.length) {
    issues.push(
      issue(
        "journey-ids",
        "journey-seed-dup",
        "Seed registry duplicates",
        `${seedDuplicates.length} duplicate journey ID(s) in canonical seed registry.`,
        "warning"
      )
    );
  }

  const financeGaps = findFinanceRecordsMissingJourneyRef();
  if (financeGaps > 0) {
    issues.push(
      issue(
        "journey-ids",
        "journey-finance-ref",
        "Finance records missing journeyRef",
        `${financeGaps} finance operation record(s) with null journeyRef.`,
        "warning"
      )
    );
  }

  return buildCheckResult(
    "journey-ids",
    "Journey IDs",
    issues,
    "Journey ID backbone consistent across member registry."
  );
}

function checkConsultantAssignments(): ReturnType<typeof buildCheckResult> {
  const { members, memberIds } = memberMap();
  const consultantIds = new Set(listConciergeConsultants().map((consultant) => consultant.id));
  const issues: IntegrityIssue[] = [];
  const stewardRequired = new Set([
    "under-review",
    "matched",
    "exclusive",
    "engaged",
    "relationship",
    "introductions-in-progress"
  ]);

  let missingSteward = 0;
  for (const member of members) {
    if (!stewardRequired.has(member.status)) continue;
    if (!member.assignedConsultantId && !member.currentConsultantId) missingSteward += 1;
  }
  if (missingSteward) {
    issues.push(
      issue(
        "consultant-assignments",
        "assignment-missing-steward",
        "Active journeys without steward",
        `${missingSteward} member(s) in active stages without assigned consultant.`,
        "warning"
      )
    );
  }

  for (const member of members) {
    for (const consultantId of [member.assignedConsultantId, member.currentConsultantId]) {
      if (!consultantId || consultantIds.has(consultantId)) continue;
      issues.push(
        issue(
          "consultant-assignments",
          `assignment-invalid-${member.id}-${consultantId}`,
          "Unknown consultant reference",
          `${member.aboutYou.name} references missing consultant ${consultantId}.`,
          "critical"
        )
      );
    }
  }

  if (!memberIds.size) {
    issues.push(
      issue(
        "consultant-assignments",
        "assignment-empty-registry",
        "Empty member registry",
        "No concierge members loaded for assignment verification.",
        "critical"
      )
    );
  }

  return buildCheckResult(
    "consultant-assignments",
    "Consultant Assignments",
    issues,
    "Consultant assignments reference valid stewards."
  );
}

function checkIntroductions(): ReturnType<typeof buildCheckResult> {
  const { memberIds } = memberMap();
  const records = listIntroductionRecords();
  const issues: IntegrityIssue[] = [];
  const introIds = new Set<string>();

  for (const record of records) {
    if (introIds.has(record.introductionId)) {
      issues.push(
        issue(
          "introductions",
          `intro-dup-${record.introductionId}`,
          "Duplicate introduction ID",
          `${record.introductionId} appears more than once in the registry.`,
          "critical"
        )
      );
    }
    introIds.add(record.introductionId);

    if (!memberIds.has(record.memberAId) || !memberIds.has(record.memberBId)) {
      issues.push(
        issue(
          "introductions",
          `intro-member-${record.id}`,
          "Introduction member reference broken",
          `${record.introductionId} references unknown member pair.`,
          "critical"
        )
      );
    }

    if (!record.journeyAId || !record.journeyBId) {
      issues.push(
        issue(
          "introductions",
          `intro-journey-${record.id}`,
          "Introduction missing journey linkage",
          `${record.introductionId} missing journeyAId or journeyBId.`,
          "warning"
        )
      );
    }
  }

  return buildCheckResult(
    "introductions",
    "Introductions",
    issues,
    "Introduction registry links valid member and journey pairs."
  );
}

function checkFollowUps(): ReturnType<typeof buildCheckResult> {
  const { memberIds } = memberMap();
  const introIds = new Set(listIntroductionRecords().map((record) => record.introductionId));
  const records = listRelationshipFollowUpRecords();
  const issues: IntegrityIssue[] = [];

  for (const record of records) {
    if (!introIds.has(record.introductionId)) {
      issues.push(
        issue(
          "follow-ups",
          `followup-intro-${record.id}`,
          "Follow-up orphan introduction",
          `${record.introductionId} not found in introduction registry.`,
          "critical"
        )
      );
    }
    if (!memberIds.has(record.memberAId) || !memberIds.has(record.memberBId)) {
      issues.push(
        issue(
          "follow-ups",
          `followup-member-${record.id}`,
          "Follow-up member reference broken",
          `Follow-up on ${record.introductionId} references unknown members.`,
          "critical"
        )
      );
    }
  }

  return buildCheckResult(
    "follow-ups",
    "Follow-Ups",
    issues,
    "Follow-up records trace to live introductions and members."
  );
}

function checkArchives(): ReturnType<typeof buildCheckResult> {
  const { members, memberIds } = memberMap();
  const archivedIds = listArchivedMemberIds();
  const issues: IntegrityIssue[] = [];

  for (const memberId of archivedIds) {
    if (!memberIds.has(memberId)) {
      issues.push(
        issue(
          "archives",
          `archive-orphan-${memberId}`,
          "Archive registry orphan",
          `${memberId} listed in archive registry but absent from member store.`,
          "critical"
        )
      );
    }
  }

  for (const member of members) {
    if (member.journeyArchive?.isLegacyArchive && !archivedIds.includes(member.id)) {
      issues.push(
        issue(
          "archives",
          `archive-metadata-${member.id}`,
          "Archive metadata not registered",
          `${member.aboutYou.name} marked legacy archive without registry entry.`,
          "warning"
        )
      );
    }
    if (member.journeyArchive?.isLegacyArchive && !member.journeyId) {
      issues.push(
        issue(
          "archives",
          `archive-journey-${member.id}`,
          "Archived member missing journey ID",
          `${member.id} archived without journey backbone.`,
          "critical"
        )
      );
    }
  }

  return buildCheckResult(
    "archives",
    "Archives",
    issues,
    "Archive registry matches member journey archive metadata."
  );
}

function checkLegacyProfiles(): ReturnType<typeof buildCheckResult> {
  const { members } = memberMap();
  const memberById = new Map(members.map((member) => [member.id, member]));
  const legacyRecords = listRelationshipLegacyIndexRecords();
  const issues: IntegrityIssue[] = [];

  for (const record of legacyRecords) {
    const member = memberById.get(record.memberId);
    if (!member) {
      issues.push(
        issue(
          "legacy-profiles",
          `legacy-member-${record.journeyId}`,
          "Legacy profile orphan member",
          `${record.journeyId} references missing member ${record.memberId}.`,
          "critical"
        )
      );
      continue;
    }
    if (member.journeyId && normalizeJourneyId(member.journeyId) !== normalizeJourneyId(record.journeyId)) {
      issues.push(
        issue(
          "legacy-profiles",
          `legacy-journey-mismatch-${record.journeyId}`,
          "Legacy journey mismatch",
          `${record.journeyId} does not match member ${member.id} journey ${member.journeyId}.`,
          "critical"
        )
      );
    }
  }

  return buildCheckResult(
    "legacy-profiles",
    "Legacy Profiles",
    issues,
    "Legacy index entries align with member journey identities."
  );
}

function checkPayments(): ReturnType<typeof buildCheckResult> {
  const { memberIds } = memberMap();
  const payments = listConsultationPayments();
  const issues: IntegrityIssue[] = [];

  for (const payment of payments) {
    if (!memberIds.has(payment.memberId)) {
      issues.push(
        issue(
          "payments",
          `payment-member-${payment.id}`,
          "Payment orphan member",
          `${payment.paymentId} references unknown member ${payment.memberId}.`,
          "critical"
        )
      );
    }
    if (payment.status === "paid" && !payment.journeyId) {
      issues.push(
        issue(
          "payments",
          `payment-journey-${payment.id}`,
          "Paid consultation missing journey ID",
          `${payment.paymentId} paid without journey linkage.`,
          "warning"
        )
      );
    }
    if (payment.status === "failed") {
      issues.push(
        issue(
          "payments",
          `payment-failed-${payment.id}`,
          "Failed payment record",
          `${payment.paymentId} for ${payment.memberName} remains in failed state.`,
          "warning"
        )
      );
    }
  }

  return buildCheckResult(
    "payments",
    "Payments",
    issues,
    "Consultation payments link to members and journey IDs."
  );
}

function checkMeetings(): ReturnType<typeof buildCheckResult> {
  const { memberIds } = memberMap();
  const meetings = listMeetingInfrastructureRecords();
  const eventIds = new Set(listSchedulingEvents().map((event) => event.id));
  const issues: IntegrityIssue[] = [];

  for (const meeting of meetings) {
    if (!memberIds.has(meeting.memberId)) {
      issues.push(
        issue(
          "meetings",
          `meeting-member-${meeting.id}`,
          "Meeting orphan member",
          `${meeting.meetingId} references unknown member.`,
          "critical"
        )
      );
    }
    if (
      meeting.consultationEventId &&
      !eventIds.has(meeting.consultationEventId) &&
      ["scheduled", "ready", "in-progress"].includes(meeting.status)
    ) {
      issues.push(
        issue(
          "meetings",
          `meeting-event-${meeting.id}`,
          "Meeting missing scheduling event",
          `${meeting.meetingId} linked to missing consultation event.`,
          "warning"
        )
      );
    }
    if (!meeting.journeyId && meeting.status !== "cancelled") {
      issues.push(
        issue(
          "meetings",
          `meeting-journey-${meeting.id}`,
          "Active meeting missing journey ID",
          `${meeting.meetingId} has no journey linkage.`,
          "warning"
        )
      );
    }
  }

  return buildCheckResult(
    "meetings",
    "Meetings",
    issues,
    "Meeting infrastructure aligns with scheduling events and members."
  );
}

function checkNotifications(): ReturnType<typeof buildCheckResult> {
  const { memberIds } = memberMap();
  const bundle = buildNotificationOperationsBundle();
  const issues: IntegrityIssue[] = [];

  for (const record of bundle.failed) {
    issues.push(
      issue(
        "notifications",
        `notify-failed-${record.id}`,
        "Failed notification delivery",
        `${record.templateLabel} for ${record.memberName} (${record.channel}) failed.`,
        "warning"
      )
    );
  }

  for (const record of [...bundle.queue, ...bundle.failed]) {
    if (!memberIds.has(record.memberId)) {
      issues.push(
        issue(
          "notifications",
          `notify-member-${record.id}`,
          "Notification orphan member",
          `${record.id} references unknown member ${record.memberId}.`,
          "critical"
        )
      );
    }
  }

  return buildCheckResult(
    "notifications",
    "Notifications",
    issues,
    "Notification queue deliveries reference valid members."
  );
}

const CHECK_RUNNERS = {
  "journey-ids": checkJourneyIds,
  "consultant-assignments": checkConsultantAssignments,
  introductions: checkIntroductions,
  "follow-ups": checkFollowUps,
  archives: checkArchives,
  "legacy-profiles": checkLegacyProfiles,
  payments: checkPayments,
  meetings: checkMeetings,
  notifications: checkNotifications
} as const;

export function buildDataIntegrityBundle(): DataIntegrityBundle {
  const generatedAt = new Date().toISOString();
  const checks = DATA_INTEGRITY_CHECKS.map((definition) => CHECK_RUNNERS[definition.id]());

  return {
    generatedAt,
    summary: buildIntegritySummary(checks),
    checks
  };
}

/** Journey audit cross-link for journey ID drill-down. */
export const DATA_INTEGRITY_JOURNEY_AUDIT_PATH = JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH;
