import {
  WHATSAPP_PRIVACY_COPY,
  WHATSAPP_PROHIBITED_PATTERNS,
  WHATSAPP_STATUS_LABELS,
  WHATSAPP_TEMPLATE_LABELS,
  getWhatsappTemplate
} from "../constants/whatsappTemplates";
import type { ConciergeTimelineEventType } from "../constants/conciergeConsultant";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConciergeWhatsappHistoryEntry,
  ConciergeWhatsappRecord,
  MemberWhatsappBundle,
  WhatsappDeliveryStatus,
  WhatsappTemplateId,
  WhatsappTimelineEntry,
  WhatsappVariables
} from "../types/conciergeWhatsapp";

const RECENT_WHATSAPP_LIMIT = 5;

const TIMELINE_TEMPLATE_MAP: Partial<Record<ConciergeTimelineEventType, WhatsappTemplateId>> = {
  introduction: "introduction-accepted",
  engagement: "milestone-congratulations",
  marriage: "milestone-congratulations"
};

export function containsProhibitedWhatsappContent(value: string): boolean {
  const text = String(value || "").trim();
  if (!text) return false;
  return WHATSAPP_PROHIBITED_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateWhatsappVariables(variables: WhatsappVariables = {}): string | null {
  for (const value of Object.values(variables)) {
    const text = String(value || "").trim();
    if (!text) continue;
    if (containsProhibitedWhatsappContent(text)) {
      return "WhatsApp content must stay professional and operational only.";
    }
    if (text.length > 240) {
      return "WhatsApp variable exceeds safe length.";
    }
  }
  return null;
}

export function appendWhatsappTimelineEntry(
  timeline: WhatsappTimelineEntry[],
  status: WhatsappDeliveryStatus,
  at = new Date().toISOString(),
  detail?: string
): WhatsappTimelineEntry[] {
  const last = timeline[timeline.length - 1];
  if (last?.status === status) return timeline;
  return [...timeline, { status, at, ...(detail ? { detail } : {}) }];
}

export function latestWhatsappStatus(timeline: WhatsappTimelineEntry[]): WhatsappDeliveryStatus {
  return timeline[timeline.length - 1]?.status ?? "queued";
}

export function buildWhatsappPreview(
  templateId: WhatsappTemplateId,
  variables: WhatsappVariables = {}
): string {
  const template = getWhatsappTemplate(templateId);
  const firstName = String(variables.firstName || variables.memberName || "there").trim() || "there";
  const consultantName = String(variables.consultantName || "your steward").trim();
  const scheduledLabel =
    String(variables.scheduledAtLabel || "").trim() ||
    (variables.scheduledAt ? new Date(variables.scheduledAt).toLocaleString() : "");
  const milestoneLabel = String(variables.milestoneLabel || "your milestone").trim();
  const introductionName = String(variables.introductionName || "a member").trim();

  switch (templateId) {
    case "consultation-reminder":
      return scheduledLabel
        ? `Reminder: your consultation with ${consultantName} is on ${scheduledLabel}.`
        : `Reminder: your consultation with ${consultantName} is coming up.`;
    case "meeting-starting-soon":
      return `Hi ${firstName}, your consultation begins shortly. Open BamSignal for access details.`;
    case "introduction-accepted":
      return `Hi ${firstName}, an introduction to ${introductionName} was accepted. Next steps stay in BamSignal.`;
    case "follow-up-reminder":
      return `Hi ${firstName}, steward follow-up reminder. Check your BamSignal journey status.`;
    case "milestone-congratulations":
      return `Congratulations, ${firstName} — milestone recorded: ${milestoneLabel}.`;
    default:
      return template.preview;
  }
}

export function historyEntryFromWhatsappRecord(
  record: ConciergeWhatsappRecord
): ConciergeWhatsappHistoryEntry {
  const status = latestWhatsappStatus(record.timeline);
  const recordedAt =
    record.timeline.find((entry) => entry.status === status)?.at ??
    record.timeline[record.timeline.length - 1]?.at ??
    record.updatedAt;

  return {
    id: `wa_hist_${record.id}`,
    messageId: record.messageId,
    memberId: record.memberId,
    journeyId: record.journeyId,
    templateId: record.templateId,
    status,
    preview: record.preview,
    recordedAt
  };
}

export function buildMemberWhatsappBundle(input: {
  member: ConciergeMemberRecord;
  records: ConciergeWhatsappRecord[];
}): MemberWhatsappBundle {
  const memberRecords = input.records
    .filter((record) => record.memberId === input.member.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const history = memberRecords.map(historyEntryFromWhatsappRecord);
  const recent = memberRecords.slice(0, RECENT_WHATSAPP_LIMIT);
  const summaryStatus: WhatsappDeliveryStatus = recent[0]
    ? latestWhatsappStatus(recent[0].timeline)
    : "queued";

  const narrative = `${WHATSAPP_PRIVACY_COPY} ${recent.length} recent WhatsApp message${
    recent.length === 1 ? "" : "s"
  }. Latest: ${
    recent[0] ? WHATSAPP_TEMPLATE_LABELS[recent[0].templateId] : "None sent yet"
  } — ${WHATSAPP_STATUS_LABELS[summaryStatus]}.`;

  return {
    recent,
    history,
    summaryStatus,
    narrative
  };
}

export function derivePendingWhatsappTemplates(member: ConciergeMemberRecord): WhatsappTemplateId[] {
  const pending: WhatsappTemplateId[] = [];
  const seen = new Set<WhatsappTemplateId>();

  const push = (templateId: WhatsappTemplateId) => {
    if (seen.has(templateId)) return;
    seen.add(templateId);
    pending.push(templateId);
  };

  if (member.consultationScheduledAt) {
    push("consultation-reminder");
    push("meeting-starting-soon");
  }

  for (const timelineEvent of member.timeline) {
    const mapped = TIMELINE_TEMPLATE_MAP[timelineEvent.type];
    if (mapped) push(mapped);
  }

  for (const introduction of member.introductions) {
    if (introduction.outcome === "relationship" || introduction.outcome === "exclusive") {
      push("introduction-accepted");
    }
  }

  for (const task of member.followUpTasks) {
    if (!task.completed) {
      push("follow-up-reminder");
    }
  }

  if (member.journeyMilestoneTimeline?.milestones?.length) {
    push("milestone-congratulations");
  }

  return pending;
}
