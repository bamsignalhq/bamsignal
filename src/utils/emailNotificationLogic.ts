import {
  CONCIERGE_EMAIL_PRIVACY_COPY,
  CONCIERGE_EMAIL_STATUS_LABELS,
  CONCIERGE_EMAIL_TEMPLATE_LABELS,
  getConciergeEmailTemplate
} from "../constants/emailTemplates";
import type { ConciergeTimelineEventType } from "../constants/conciergeConsultant";
import type { SignalConciergeStatus } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConciergeEmailHistoryEntry,
  ConciergeEmailRecord,
  ConciergeEmailTemplateId,
  ConciergeEmailVariables,
  EmailDeliveryStatus,
  EmailTimelineEntry,
  MemberEmailBundle
} from "../types/conciergeEmail";

const RECENT_EMAIL_LIMIT = 5;

const STATUS_TEMPLATE_MAP: Partial<Record<SignalConciergeStatus, ConciergeEmailTemplateId>> = {
  applied: "application-received",
  "consultation-scheduled": "consultation-scheduled",
  accepted: "application-approved",
  "legacy-archive": "archive-congratulations"
};

const TIMELINE_TEMPLATE_MAP: Partial<Record<ConciergeTimelineEventType, ConciergeEmailTemplateId>> = {
  "application-received": "application-received",
  accepted: "application-approved",
  introduction: "introduction-presented",
  engagement: "relationship-milestone",
  marriage: "relationship-milestone",
  archived: "archive-congratulations"
};

export function appendEmailTimelineEntry(
  timeline: EmailTimelineEntry[],
  status: EmailDeliveryStatus,
  at = new Date().toISOString(),
  detail?: string
): EmailTimelineEntry[] {
  const last = timeline[timeline.length - 1];
  if (last?.status === status) return timeline;
  return [...timeline, { status, at, ...(detail ? { detail } : {}) }];
}

export function latestEmailStatus(timeline: EmailTimelineEntry[]): EmailDeliveryStatus {
  return timeline[timeline.length - 1]?.status ?? "queued";
}

export function buildConciergeEmailPreview(
  templateId: ConciergeEmailTemplateId,
  variables: ConciergeEmailVariables = {}
): { subject: string; preview: string } {
  const template = getConciergeEmailTemplate(templateId);
  const firstName = String(variables.firstName || variables.memberName || "there").trim() || "there";

  if (templateId === "consultation-scheduled" && variables.consultantName) {
    return {
      subject: template.subject,
      preview: `Your consultation with ${variables.consultantName} is confirmed.`
    };
  }
  if (templateId === "introduction-presented" && variables.introductionName) {
    return {
      subject: template.subject,
      preview: `A confidential introduction to ${variables.introductionName} was presented.`
    };
  }
  if (templateId === "relationship-milestone" && variables.milestoneLabel) {
    return {
      subject: template.subject,
      preview: `Milestone recorded: ${variables.milestoneLabel}.`
    };
  }
  if (templateId === "archive-congratulations") {
    return {
      subject: template.subject,
      preview: template.preview.replace("there", firstName)
    };
  }

  return {
    subject: template.subject,
    preview: template.preview
  };
}

export function historyEntryFromEmailRecord(record: ConciergeEmailRecord): ConciergeEmailHistoryEntry {
  const status = latestEmailStatus(record.timeline);
  const recordedAt =
    record.timeline.find((entry) => entry.status === status)?.at ??
    record.timeline[record.timeline.length - 1]?.at ??
    record.updatedAt;

  return {
    id: `email_hist_${record.id}`,
    emailId: record.emailId,
    memberId: record.memberId,
    journeyId: record.journeyId,
    templateId: record.templateId,
    status,
    subject: record.subject,
    preview: record.preview,
    recordedAt
  };
}

export function derivePendingEmailTemplates(
  member: ConciergeMemberRecord
): ConciergeEmailTemplateId[] {
  const pending: ConciergeEmailTemplateId[] = [];
  const seen = new Set<ConciergeEmailTemplateId>();

  const push = (templateId: ConciergeEmailTemplateId) => {
    if (seen.has(templateId)) return;
    seen.add(templateId);
    pending.push(templateId);
  };

  const statusTemplate = STATUS_TEMPLATE_MAP[member.status];
  if (statusTemplate) push(statusTemplate);

  if (member.consultationScheduledAt) {
    push("consultation-scheduled");
  }

  for (const timelineEvent of member.timeline) {
    const mapped = TIMELINE_TEMPLATE_MAP[timelineEvent.type];
    if (mapped) push(mapped);
  }

  for (const introduction of member.introductions) {
    push("introduction-presented");
  }

  for (const task of member.followUpTasks) {
    if (
      !task.completed &&
      (task.type === "schedule-consultation" || task.type === "pending-call")
    ) {
      push("consultation-reminder");
    }
  }

  if (member.journeyMilestoneTimeline?.milestones?.length) {
    push("relationship-milestone");
  }

  if (member.status === "legacy-archive" || member.journeyArchive?.isLegacyArchive) {
    push("archive-congratulations");
  }

  return pending;
}

export function buildMemberEmailBundle(input: {
  member: ConciergeMemberRecord;
  records: ConciergeEmailRecord[];
}): MemberEmailBundle {
  const memberRecords = input.records
    .filter((record) => record.memberId === input.member.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const history = memberRecords.map(historyEntryFromEmailRecord);
  const recent = memberRecords.slice(0, RECENT_EMAIL_LIMIT);
  const summaryStatus: EmailDeliveryStatus =
    recent[0] ? latestEmailStatus(recent[0].timeline) : "queued";

  const narrative = `${CONCIERGE_EMAIL_PRIVACY_COPY} ${recent.length} recent email${
    recent.length === 1 ? "" : "s"
  }. Latest: ${
    recent[0] ? CONCIERGE_EMAIL_TEMPLATE_LABELS[recent[0].templateId] : "None sent yet"
  } — ${CONCIERGE_EMAIL_STATUS_LABELS[summaryStatus]}.`;

  return {
    recent,
    history,
    summaryStatus,
    narrative
  };
}
