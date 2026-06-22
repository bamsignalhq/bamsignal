import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type { RelationshipHealthAlertEntry } from "../types/relationshipHealthAlerts";
import type { SuccessStoryConsentRecord } from "../types/conciergeSuccessStoryConsent";
import { CONCIERGE_CONSULTANT_SEED } from "./conciergeConsultantSeed";
import { CONCIERGE_DIRECTORY_SEED } from "./conciergeConsultantDirectorySeed";
import { CONCIERGE_INTRODUCTION_SEED } from "./conciergeIntroductionSeed";
import { CONCIERGE_SUCCESS_STORY_CONSENT_SEED } from "./conciergeSuccessStoryConsentSeed";
import { CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED } from "./conciergeRelationshipLegacyIndexSeed";
import { RELATIONSHIP_HEALTH_ALERTS_SEED } from "./relationshipHealthAlertsSeed";

export type ConciergePersistenceBootstrapPayload = {
  consultants: ConciergeConsultantRecord[];
  members: ConciergeMemberRecord[];
  introductions: IntroductionRecord[];
  successStoryConsents: SuccessStoryConsentRecord[];
  legacyProfiles: typeof CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED;
  relationshipHealthAlerts: RelationshipHealthAlertEntry[];
  archives: Array<{ journeyId: string; memberId: string; [key: string]: unknown }>;
  followups: ConciergeMemberRecord["followUpTasks"];
};

export function normalizeMemberArchive(member: ConciergeMemberRecord) {
  if (!member.journeyArchive || !member.journeyId) return null;
  return {
    journeyId: member.journeyId,
    memberId: member.id,
    ...member.journeyArchive
  };
}

export function buildConciergePersistenceBootstrapPayload(): ConciergePersistenceBootstrapPayload {
  const members = CONCIERGE_CONSULTANT_SEED;
  const followups = members.flatMap((member) =>
    member.followUpTasks.map((task) => ({
      ...task,
      journeyId: member.journeyId
    }))
  );
  const archives = members
    .map(normalizeMemberArchive)
    .filter((archive): archive is NonNullable<typeof archive> => Boolean(archive));

  return {
    consultants: CONCIERGE_DIRECTORY_SEED,
    members,
    introductions: CONCIERGE_INTRODUCTION_SEED,
    successStoryConsents: CONCIERGE_SUCCESS_STORY_CONSENT_SEED,
    legacyProfiles: CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED,
    relationshipHealthAlerts: RELATIONSHIP_HEALTH_ALERTS_SEED,
    archives,
    followups
  };
}
