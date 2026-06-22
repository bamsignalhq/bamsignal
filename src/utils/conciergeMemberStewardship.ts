import { CONCIERGE_MEMBER_OWNERSHIP } from "../constants/conciergeMemberOwnership";
import type { ConciergeMemberRecord, ConciergeTimelineEvent } from "../types/conciergeConsultant";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import { normalizeJourneyArchive } from "./conciergeJourneyArchive";
import { getSuccessStoryConsent } from "./conciergeSuccessStoryConsentStore";

export function stampTimelineJourneyId(
  events: ConciergeTimelineEvent[],
  journeyId: string
): ConciergeTimelineEvent[] {
  return events.map((event) => ({
    ...event,
    journeyId: event.journeyId ?? journeyId
  }));
}

export function normalizeConciergeMember(member: ConciergeMemberRecord): ConciergeMemberRecord {
  const journeyId = ensureMemberJourneyId(member.id, member.createdAt, member.journeyId);
  const currentConsultantId = member.currentConsultantId ?? member.assignedConsultantId;
  const currentConsultantName = member.assignedConsultantName;
  return normalizeJourneyArchive({
    ...member,
    journeyId,
    successStoryConsent:
      member.successStoryConsent ??
      (journeyId ? getSuccessStoryConsent(journeyId) ?? undefined : undefined),
    ownership: CONCIERGE_MEMBER_OWNERSHIP,
    currentConsultantId,
    assignedConsultantId: currentConsultantId,
    assignedConsultantName: currentConsultantName,
    assignedBy: member.assignedBy ?? "BamSignal Admin",
    assignedAt: member.assignedAt ?? member.createdAt,
    stewardshipHistory: member.stewardshipHistory ?? [],
    communicationJournal: member.communicationJournal ?? [],
    timeline: stampTimelineJourneyId(member.timeline ?? [], journeyId)
  });
}

export function getMemberStewardName(member: ConciergeMemberRecord): string | undefined {
  return member.assignedConsultantName;
}

export function getMemberStewardId(member: ConciergeMemberRecord): string | undefined {
  return member.currentConsultantId ?? member.assignedConsultantId;
}
