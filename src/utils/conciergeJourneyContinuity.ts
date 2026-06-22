import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import type { ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord, ConciergeStewardshipTransfer } from "../types/conciergeConsultant";

export type JourneyTransitionSummary = {
  currentConsultant?: string;
  previousConsultant?: string;
  transitionDate?: string;
  reason?: string;
  openTasksCount: number;
  openTasks: ConciergeMemberRecord["followUpTasks"];
  upcomingMeetings: ConciergeScheduledMeeting[];
  relationshipStatus: string;
  consultantSummaryLines: string[];
};

export function getLatestJourneyTransition(
  transfers: ConciergeStewardshipTransfer[]
): ConciergeStewardshipTransfer | null {
  if (!transfers.length) return null;
  return [...transfers].sort(
    (a, b) => new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime()
  )[0];
}

export function buildJourneyTransitionSummary(
  member: ConciergeMemberRecord,
  upcomingMeetings: ConciergeScheduledMeeting[] = []
): JourneyTransitionSummary {
  const latest = getLatestJourneyTransition(member.stewardshipHistory ?? []);
  const openTasks = member.followUpTasks.filter((task) => !task.completed);

  return {
    currentConsultant: member.assignedConsultantName,
    previousConsultant: latest?.fromConsultantName,
    transitionDate: latest?.transferredAt ?? member.reassignedAt,
    reason: latest?.reason ?? latest?.note,
    openTasksCount: openTasks.length,
    openTasks,
    upcomingMeetings: upcomingMeetings.filter(
      (meeting) =>
        meeting.memberId === member.id &&
        new Date(meeting.scheduledAt).getTime() >= Date.now()
    ),
    relationshipStatus: SIGNAL_CONCIERGE_STATUS_LABELS[member.status],
    consultantSummaryLines: member.consultantSummary?.lines ?? []
  };
}

export function journeyTransitionMessage(
  fromName: string | undefined,
  toName: string
): string {
  if (!fromName) {
    return `Journey steward assigned to ${toName} under BamSignal continuity support.`;
  }
  return `Journey transitioned from ${fromName} to ${toName} to ensure continuity and support.`;
}

export type JourneyContinuityEvent = {
  id: string;
  at: string;
  label: string;
  detail?: string;
  kind: "transition" | "timeline" | "activity" | "meeting";
};

export function buildJourneyContinuityEvents(input: {
  transfers: ConciergeStewardshipTransfer[];
  timeline: ConciergeMemberRecord["timeline"];
  activity: { id: string; at: string; label: string; detail?: string; changes?: string }[];
  meetings: ConciergeScheduledMeeting[];
}): JourneyContinuityEvent[] {
  const events: JourneyContinuityEvent[] = [];

  for (const transfer of input.transfers) {
    events.push({
      id: transfer.id,
      at: transfer.transferredAt,
      label: transfer.fromConsultantName
        ? `Journey transitioned from ${transfer.fromConsultantName} to ${transfer.toConsultantName}`
        : `Steward assigned: ${transfer.toConsultantName}`,
      detail: transfer.reason ?? transfer.note,
      kind: "transition"
    });
  }

  for (const item of input.timeline) {
    events.push({
      id: item.id,
      at: item.at,
      label: item.label,
      detail: item.detail,
      kind: "timeline"
    });
  }

  for (const item of input.activity) {
    events.push({
      id: item.id,
      at: item.at,
      label: item.label,
      detail: item.detail ?? item.changes,
      kind: "activity"
    });
  }

  for (const meeting of input.meetings) {
    events.push({
      id: meeting.id,
      at: meeting.scheduledAt,
      label: `Meeting · ${meeting.memberName}`,
      detail: meeting.notes,
      kind: "meeting"
    });
  }

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
