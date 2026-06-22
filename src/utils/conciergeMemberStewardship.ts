import { CONCIERGE_MEMBER_OWNERSHIP } from "../constants/conciergeMemberOwnership";
import type { ConciergeMemberRecord, ConciergeTimelineEvent } from "../types/conciergeConsultant";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import { normalizeJourneyArchive } from "./conciergeJourneyArchive";
import { getSuccessStoryConsent } from "./conciergeSuccessStoryConsentStore";
import { attachStoryProfileToConsent, getJourneyStoryProfile } from "./journeyStoryCategories";
import { getJourneyMilestoneTimeline } from "./journeyMilestoneStore";
import { getRelationshipLegacyIndex } from "./relationshipLegacyIndexStore";

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
    successStoryConsent: (() => {
      const consent =
        member.successStoryConsent ??
        (journeyId ? getSuccessStoryConsent(journeyId) ?? undefined : undefined);
      if (!consent) return undefined;
      const withProfile = attachStoryProfileToConsent(consent);
      const profile = journeyId ? getJourneyStoryProfile(journeyId) : null;
      return {
        ...withProfile,
        storyCategories: profile?.categories ?? withProfile.storyCategories,
        storyProfile: profile ?? withProfile.storyProfile
      };
    })(),
    ownership: CONCIERGE_MEMBER_OWNERSHIP,
    currentConsultantId,
    assignedConsultantId: currentConsultantId,
    assignedConsultantName: currentConsultantName,
    assignedBy: member.assignedBy ?? "BamSignal Admin",
    assignedAt: member.assignedAt ?? member.createdAt,
    stewardshipHistory: member.stewardshipHistory ?? [],
    communicationJournal: member.communicationJournal ?? [],
    timeline: stampTimelineJourneyId(member.timeline ?? [], journeyId),
    journeyMilestoneTimeline:
      member.journeyMilestoneTimeline ??
      (journeyId ? getJourneyMilestoneTimeline(journeyId) ?? undefined : undefined),
    relationshipLegacyIndex:
      member.relationshipLegacyIndex ??
      (journeyId ? getRelationshipLegacyIndex(journeyId) ?? undefined : undefined)
  });
}

export function getMemberStewardName(member: ConciergeMemberRecord): string | undefined {
  return member.assignedConsultantName;
}

export function getMemberStewardId(member: ConciergeMemberRecord): string | undefined {
  return member.currentConsultantId ?? member.assignedConsultantId;
}
