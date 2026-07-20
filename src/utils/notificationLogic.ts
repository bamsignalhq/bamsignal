import {
  NOTIFICATION_DEFAULT_CHANNEL_PREFERENCES,
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_PRIVACY_COPY,
  NOTIFICATION_STATUS_LABELS
} from "../constants/notificationEvents";
import type { ConciergeTimelineEventType } from "../constants/conciergeConsultant";
import type { SignalConciergeStatus } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  MemberNotificationBundle,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEvent,
  NotificationEventType,
  NotificationHistoryEntry,
  NotificationPreference,
  NotificationTemplate
} from "../types/notificationEvents";

const RECENT_NOTIFICATION_LIMIT = 5;

const TEMPLATE_COPY: Record<
  NotificationEventType,
  { subject: string; preview: string; dignityNote: string }
> = {
  "application-received": {
    subject: "Your Signal Concierge application",
    preview: "We received your application privately. A steward will review with care.",
    dignityNote: "No public listing — your journey remains confidential."
  },
  "consultation-scheduled": {
    subject: "Consultation scheduled",
    preview: "Your private consultation is scheduled. Details shared only with you.",
    dignityNote: "Calendar details are never posted publicly."
  },
  "consultation-reminder": {
    subject: "Consultation reminder",
    preview: "A gentle reminder about your upcoming private consultation.",
    dignityNote: "Reminders are discreet — one steward, one member."
  },
  "consultation-completed": {
    subject: "Consultation complete",
    preview: "Thank you for your consultation. Your steward will guide next steps.",
    dignityNote: "Outcomes remain between you and BamSignal."
  },
  "application-approved": {
    subject: "Application approved",
    preview: "Your application was approved. Welcome to your private journey.",
    dignityNote: "Approval is personal — never announced on social feeds."
  },
  "introduction-presented": {
    subject: "Introduction presented",
    preview: "A confidential introduction was presented for your consideration.",
    dignityNote: "Introductions require mutual consent — always."
  },
  "introduction-accepted": {
    subject: "Introduction accepted",
    preview: "An introduction was accepted. Your steward will support next steps.",
    dignityNote: "Both parties choose privately before any connection."
  },
  "follow-up-reminder": {
    subject: "Follow-up reminder",
    preview: "Your steward noted a gentle follow-up on your journey.",
    dignityNote: "Follow-ups are human — never automated spam."
  },
  "milestone-recorded": {
    subject: "Milestone recorded",
    preview: "A relationship milestone was recorded in your permanent journey archive.",
    dignityNote: "Milestones are celebrated privately within BamSignal."
  },
  "relationship-archived": {
    subject: "Relationship archived",
    preview: "Your journey was archived with dignity. The record is permanent.",
    dignityNote: "Archives honor the journey — never deleted, never public."
  },
  "invoice-issued": {
    subject: "Invoice issued",
    preview: "Your consultant issued a private invoice for your Concierge engagement.",
    dignityNote: "Invoices never change membership — only your Concierge case advances after payment."
  },
  "invoice-paid": {
    subject: "Invoice paid",
    preview: "Payment received. Thank you — your case can continue.",
    dignityNote: "Receipts stay private. Membership products are unchanged."
  },
  "consultant-assigned": {
    subject: "Consultant assigned",
    preview: "A dedicated relationship consultant has been assigned to your journey.",
    dignityNote: "Your steward is private — introductions remain consent-based."
  },
  "status-updated": {
    subject: "Case status updated",
    preview: "Your Concierge case status was updated. Open your dashboard for details.",
    dignityNote: "Status changes are shared only with you and your steward."
  },
  "case-completed": {
    subject: "Case completed",
    preview: "Your Concierge case was marked complete. Congratulations.",
    dignityNote: "Completion is celebrated privately within BamSignal."
  }
};

const TIMELINE_EVENT_MAP: Partial<Record<ConciergeTimelineEventType, NotificationEventType>> = {
  "application-received": "application-received",
  "consultation-completed": "consultation-completed",
  accepted: "application-approved",
  introduction: "introduction-presented",
  "follow-up-call": "follow-up-reminder",
  archived: "relationship-archived",
  engagement: "milestone-recorded",
  marriage: "milestone-recorded"
};

const STATUS_EVENT_MAP: Partial<Record<SignalConciergeStatus, NotificationEventType>> = {
  applied: "application-received",
  "consultation-scheduled": "consultation-scheduled",
  accepted: "application-approved",
  "legacy-archive": "relationship-archived"
};

export function buildNotificationTemplate(eventType: NotificationEventType): NotificationTemplate {
  const copy = TEMPLATE_COPY[eventType];
  return {
    eventType,
    subject: copy.subject,
    preview: copy.preview,
    dignityNote: copy.dignityNote
  };
}

export function createDefaultNotificationPreferences(
  memberId: string,
  updatedAt = new Date().toISOString()
): NotificationPreference {
  return {
    memberId,
    channels: { ...NOTIFICATION_DEFAULT_CHANNEL_PREFERENCES },
    quietHoursEnabled: true,
    stewardCopyOnly: true,
    updatedAt
  };
}

function deriveDeliveryStatus(eventAt: string, eventType: NotificationEventType): NotificationDeliveryStatus {
  const age = Date.now() - Date.parse(eventAt);
  if (Number.isNaN(age)) return "queued";
  if (eventType === "follow-up-reminder" && age < 1000 * 60 * 60 * 24) return "queued";
  if (age < 1000 * 60 * 5) return "queued";
  if (age < 1000 * 60 * 60 * 24) return "sent";
  return "delivered";
}

function preferredChannelForMember(member: ConciergeMemberRecord): NotificationChannel {
  const pref = member.consultationPreferences?.preferredChannel ?? member.consultationPreference;
  if (pref === "whatsapp") return "whatsapp";
  if (pref === "phone") return "sms";
  return "email";
}

function historyEntryFromEvent(event: NotificationEvent): NotificationHistoryEntry {
  return {
    id: `hist_${event.id}`,
    notificationId: event.notificationId,
    memberId: event.memberId,
    journeyId: event.journeyId,
    eventType: event.eventType,
    channel: event.channel,
    status: event.status,
    subject: event.subject,
    preview: event.preview,
    recordedAt: event.deliveredAt ?? event.sentAt ?? event.queuedAt
  };
}

export function buildNotificationEventDraft(input: {
  id: string;
  notificationId: string;
  member: ConciergeMemberRecord;
  eventType: NotificationEventType;
  at: string;
  channel?: NotificationChannel;
  status?: NotificationDeliveryStatus;
}): NotificationEvent {
  const template = buildNotificationTemplate(input.eventType);
  const channel = input.channel ?? preferredChannelForMember(input.member);
  const status = input.status ?? deriveDeliveryStatus(input.at, input.eventType);

  return {
    id: input.id,
    notificationId: input.notificationId,
    memberId: input.member.id,
    journeyId: input.member.journeyId,
    memberName: input.member.aboutYou.name,
    eventType: input.eventType,
    channel,
    status,
    subject: template.subject,
    preview: template.preview,
    queuedAt: input.at,
    sentAt: status === "sent" || status === "delivered" ? input.at : undefined,
    deliveredAt: status === "delivered" ? input.at : undefined
  };
}

export function deriveNotificationEventsFromMember(
  member: ConciergeMemberRecord,
  assignNotificationId: (recordId: string, at: string) => string
): NotificationEvent[] {
  const events: NotificationEvent[] = [];
  const seen = new Set<NotificationEventType>();

  const pushEvent = (eventType: NotificationEventType, at: string, recordId: string) => {
    if (seen.has(eventType) && eventType !== "follow-up-reminder" && eventType !== "introduction-presented") {
      return;
    }
    seen.add(eventType);
    events.push(
      buildNotificationEventDraft({
        id: recordId,
        notificationId: assignNotificationId(recordId, at),
        member,
        eventType,
        at
      })
    );
  };

  const statusEvent = STATUS_EVENT_MAP[member.status];
  if (statusEvent) {
    pushEvent(statusEvent, member.createdAt, `notif_${member.id}_status_${statusEvent}`);
  }

  if (member.consultationScheduledAt) {
    pushEvent(
      "consultation-scheduled",
      member.consultationScheduledAt,
      `notif_${member.id}_consultation_scheduled`
    );
  }

  for (const timelineEvent of member.timeline) {
    const mapped = TIMELINE_EVENT_MAP[timelineEvent.type];
    if (mapped) {
      pushEvent(mapped, timelineEvent.at, `notif_${member.id}_tl_${timelineEvent.id}`);
    }
  }

  for (const introduction of member.introductions) {
    pushEvent(
      "introduction-presented",
      introduction.date,
      `notif_${member.id}_intro_${introduction.id}`
    );
    if (introduction.outcome === "relationship" || introduction.outcome === "exclusive") {
      pushEvent(
        "introduction-accepted",
        introduction.date,
        `notif_${member.id}_intro_accept_${introduction.id}`
      );
    }
  }

  for (const task of member.followUpTasks) {
    if (!task.completed) {
      const eventType =
        task.type === "schedule-consultation" || task.type === "pending-call"
          ? "consultation-reminder"
          : "follow-up-reminder";
      pushEvent(eventType, task.dueAt, `notif_${member.id}_task_${task.id}`);
    }
  }

  if (member.journeyMilestoneTimeline?.milestones?.length) {
    const milestones = member.journeyMilestoneTimeline.milestones;
    const latest = milestones[milestones.length - 1];
    if (latest) {
      pushEvent(
        "milestone-recorded",
        latest.recordedAt,
        `notif_${member.id}_milestone_${latest.id}`
      );
    }
  }

  if (member.status === "legacy-archive" || member.journeyArchive?.isLegacyArchive) {
    pushEvent(
      "relationship-archived",
      member.journeyArchive?.archivedAt ?? member.updatedAt ?? member.createdAt,
      `notif_${member.id}_archived`
    );
  }

  return events.sort((a, b) => Date.parse(b.queuedAt) - Date.parse(a.queuedAt));
}

const OPS_EVENT_MAP: Record<string, NotificationEventType> = {
  INVOICE_SENT: "invoice-issued",
  INVOICE_PAID: "invoice-paid",
  CONSULTANT_ASSIGNED: "consultant-assigned",
  CONSULTANT_TRANSFERRED: "consultant-assigned",
  STATUS_CHANGED: "status-updated",
  PROGRESS_RECORDED: "status-updated",
  CASE_COMPLETED: "case-completed",
  APPLICATION_ACCEPTED: "application-approved",
  APPLICATION_SUBMITTED: "application-received"
};

/** Map Operations case events into member notifications (CX layer). */
export function deriveNotificationEventsFromOpsHistory(
  member: ConciergeMemberRecord,
  history: Array<{
    id?: string;
    eventType?: string;
    event_type?: string;
    createdAt?: string | null;
    created_at?: string | null;
  }>,
  assignNotificationId: (recordId: string, at: string) => string
): NotificationEvent[] {
  const events: NotificationEvent[] = [];
  for (const row of history || []) {
    const eventTypeKey = String(row.eventType || row.event_type || "");
    const mapped = OPS_EVENT_MAP[eventTypeKey];
    if (!mapped) continue;
    const at = String(row.createdAt || row.created_at || member.updatedAt || member.createdAt);
    const recordId = `notif_ops_${member.id}_${row.id || eventTypeKey}_${at}`;
    events.push(
      buildNotificationEventDraft({
        id: recordId,
        notificationId: assignNotificationId(recordId, at),
        member,
        eventType: mapped,
        at
      })
    );
  }
  return events.sort((a, b) => Date.parse(b.queuedAt) - Date.parse(a.queuedAt));
}

export function buildMemberNotificationBundle(input: {
  member: ConciergeMemberRecord;
  preferences: NotificationPreference;
  events: NotificationEvent[];
}): MemberNotificationBundle {
  const history = input.events.map(historyEntryFromEvent);
  const recent = input.events.slice(0, RECENT_NOTIFICATION_LIMIT);
  const summaryStatus: NotificationDeliveryStatus =
    recent[0]?.status ??
    (input.events.some((event) => event.status === "failed")
      ? "failed"
      : input.events.some((event) => event.status === "queued")
        ? "queued"
        : "delivered");

  const narrative = `${NOTIFICATION_PRIVACY_COPY} ${recent.length} recent notification${
    recent.length === 1 ? "" : "s"
  }. Latest: ${recent[0] ? NOTIFICATION_EVENT_LABELS[recent[0].eventType] : "None yet"} — ${
    NOTIFICATION_STATUS_LABELS[summaryStatus]
  }.`;

  return {
    preferences: input.preferences,
    recent,
    history,
    summaryStatus,
    narrative
  };
}

export function updateNotificationPreferences(
  existing: NotificationPreference,
  patch: Partial<Pick<NotificationPreference, "channels" | "quietHoursEnabled" | "stewardCopyOnly">>
): NotificationPreference {
  return {
    ...existing,
    channels: patch.channels ? { ...existing.channels, ...patch.channels } : existing.channels,
    quietHoursEnabled: patch.quietHoursEnabled ?? existing.quietHoursEnabled,
    stewardCopyOnly: patch.stewardCopyOnly ?? existing.stewardCopyOnly,
    updatedAt: new Date().toISOString()
  };
}
