import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import { ensureJourneyStoryProfile } from "./journeyStoryCategories";
import { ensureJourneyMilestoneTimeline } from "./journeyMilestoneStore";
import {
  buildLegacyProfileViewModel,
  type LegacyProfileViewModel
} from "./relationshipLegacyIndexLogic";
import {
  ensureRelationshipLegacyIndex,
  getRelationshipLegacyIndex
} from "./relationshipLegacyIndexStore";

export function buildLegacyProfileForMember(
  member: ConciergeMemberRecord
): LegacyProfileViewModel | null {
  if (!member.journeyId) return null;

  const index =
    member.relationshipLegacyIndex ??
    getRelationshipLegacyIndex(member.journeyId) ??
    ensureRelationshipLegacyIndex({
      journeyId: member.journeyId,
      memberId: member.id,
      country: "Nigeria"
    });

  const milestones =
    member.journeyMilestoneTimeline?.milestones ??
    ensureJourneyMilestoneTimeline(member.journeyId).milestones;

  const storyCategories =
    member.successStoryConsent?.storyProfile?.categories ??
    member.successStoryConsent?.storyCategories ??
    ensureJourneyStoryProfile(member.journeyId).categories;

  return buildLegacyProfileViewModel({
    member,
    index,
    storyCategories,
    milestones
  });
}
