import { AUDIT_EVENTS_SEED } from "../data/auditCenterSeed";
import { CONCIERGE_CONSULTANT_SEED } from "../data/conciergeConsultantSeed";
import { CONCIERGE_JOURNEY_MILESTONE_SEED } from "../data/conciergeJourneyMilestoneSeed";
import { CONCIERGE_JOURNEY_STORY_PROFILE_SEED } from "../data/conciergeJourneyStoryProfileSeed";
import { CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED } from "../data/conciergeRelationshipLegacyIndexSeed";
import { CONCIERGE_SUCCESS_STORY_CONSENT_SEED } from "../data/conciergeSuccessStoryConsentSeed";
import { COUPLE_HAPPINESS_NOTES_SEED } from "../data/coupleHappinessNotesSeed";
import { FINANCE_OPERATIONS_SEED } from "../data/financeOperationsSeed";
import { CONSULTANT_QUALITY_SEED } from "../data/consultantQualitySeed";
import { RELATIONSHIP_HEALTH_ALERTS_SEED } from "../data/relationshipHealthAlertsSeed";
import { SUCCESS_STORY_ENGINE_SEED } from "../data/successStoryEngineSeed";
import type { JourneyStageId } from "../constants/journeyIntegrityAudit";
import { isValidJourneyId, normalizeJourneyId } from "../constants/journeyId";
import type {
  JourneyDependency,
  JourneyRecord,
  JourneyStageCheck
} from "../types/journeyIntegrityAudit";
import type { JourneyHealthStatusId } from "../constants/journeyIntegrityAudit";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";

const MILESTONE_JOURNEY_IDS = new Set(CONCIERGE_JOURNEY_MILESTONE_SEED.map((item) => item.journeyId));
const LEGACY_JOURNEY_IDS = new Set(CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED.map((item) => item.journeyId));
const SUCCESS_STORY_JOURNEY_IDS = new Set([
  ...CONCIERGE_SUCCESS_STORY_CONSENT_SEED.map((item) => item.journeyId),
  ...SUCCESS_STORY_ENGINE_SEED.map((item) => item.journeyId)
]);
const QUOTES_JOURNEY_IDS = new Set(COUPLE_HAPPINESS_NOTES_SEED.map((item) => item.journeyId));
const FAMILY_JOURNEY_IDS = new Set(
  CONCIERGE_JOURNEY_STORY_PROFILE_SEED.flatMap((profile) =>
    profile.categories.some((category) => category.id === "family-story") ? [profile.journeyId] : []
  )
);
const EVENTS_JOURNEY_IDS = new Set(RELATIONSHIP_HEALTH_ALERTS_SEED.map((item) => item.journeyId));

function stageCheck(
  stageId: JourneyStageId,
  present: boolean,
  source: string,
  note: string | null = null
): JourneyStageCheck {
  let status: JourneyHealthStatusId = "healthy";
  if (!present && (stageId === "application" || stageId === "assignment")) {
    status = "critical";
  } else if (!present) {
    status = "partial";
  }
  return { stageId, present, status, source, note };
}

function memberStages(member: ConciergeMemberRecord): JourneyStageCheck[] {
  const hasIntroductions = Boolean(member.introductions?.length);
  const hasFollowUps = Boolean(member.followUpTasks?.length);
  const relationshipStatuses = new Set([
    "matched",
    "exclusive",
    "engaged",
    "married",
    "legacy-archive",
    "introductions-in-progress"
  ]);

  return [
    stageCheck("application", true, "conciergeConsultantSeed", null),
    stageCheck(
      "consultation",
      Boolean(member.consultationScheduledAt || member.communicationJournal?.length),
      "member.consultation / communicationJournal"
    ),
    stageCheck(
      "assignment",
      Boolean(member.assignedConsultantId || member.currentConsultantId),
      "member.assignedConsultantId"
    ),
    stageCheck("introduction", hasIntroductions, "member.introductions"),
    stageCheck("follow-up", hasFollowUps, "member.followUpTasks"),
    stageCheck(
      "relationship",
      relationshipStatuses.has(member.status),
      "member.status",
      `Status: ${member.status}`
    ),
    stageCheck("archive", Boolean(member.journeyArchive), "member.journeyArchive"),
    stageCheck(
      "legacy",
      Boolean(member.relationshipLegacyIndex) || LEGACY_JOURNEY_IDS.has(member.journeyId ?? ""),
      "relationshipLegacyIndex"
    ),
    stageCheck(
      "success-story",
      Boolean(member.successStoryConsent) || SUCCESS_STORY_JOURNEY_IDS.has(member.journeyId ?? ""),
      "successStoryConsent"
    ),
    stageCheck(
      "milestones",
      MILESTONE_JOURNEY_IDS.has(member.journeyId ?? ""),
      "conciergeJourneyMilestoneSeed"
    ),
    stageCheck(
      "family",
      FAMILY_JOURNEY_IDS.has(member.journeyId ?? ""),
      "conciergeJourneyStoryProfileSeed"
    ),
    stageCheck("quotes", QUOTES_JOURNEY_IDS.has(member.journeyId ?? ""), "coupleHappinessNotesSeed"),
    stageCheck("events", EVENTS_JOURNEY_IDS.has(member.journeyId ?? ""), "relationshipHealthAlertsSeed")
  ];
}

function overallStatus(stages: JourneyStageCheck[]): JourneyHealthStatusId {
  if (stages.some((stage) => stage.status === "critical")) return "critical";
  if (stages.some((stage) => stage.status === "broken")) return "broken";
  if (stages.some((stage) => stage.status === "partial")) return "partial";
  return "healthy";
}

export function buildCanonicalJourneyRecords(): JourneyRecord[] {
  return CONCIERGE_CONSULTANT_SEED.filter((member) => member.journeyId).map((member) => {
    const journeyId = normalizeJourneyId(member.journeyId!);
    const stages = memberStages(member);
    const formatValid = isValidJourneyId(journeyId);

    return {
      id: `journey-${journeyId}`,
      journeyId,
      memberId: member.id,
      status: formatValid ? overallStatus(stages) : "critical",
      stages,
      sources: ["conciergeConsultantSeed"],
      note: formatValid ? null : "Journey ID format invalid"
    };
  });
}

export function collectReferencedJourneyIds(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  const add = (journeyId: string | null | undefined, source: string) => {
    if (!journeyId) return;
    const normalized = normalizeJourneyId(journeyId);
    const owners = map.get(normalized) ?? [];
    if (!owners.includes(source)) owners.push(source);
    map.set(normalized, owners);
  };

  for (const member of CONCIERGE_CONSULTANT_SEED) add(member.journeyId, "conciergeConsultantSeed");
  for (const event of AUDIT_EVENTS_SEED) add(event.journeyId, "auditCenterSeed");
  for (const record of FINANCE_OPERATIONS_SEED) add(record.journeyRef, "financeOperationsSeed");
  for (const record of CONSULTANT_QUALITY_SEED) add(record.journeyRef, "consultantQualitySeed");
  for (const item of CONCIERGE_JOURNEY_MILESTONE_SEED) add(item.journeyId, "journeyMilestoneSeed");
  for (const item of CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED) add(item.journeyId, "relationshipLegacyIndexSeed");
  for (const item of SUCCESS_STORY_ENGINE_SEED) add(item.journeyId, "successStoryEngineSeed");
  for (const item of CONCIERGE_SUCCESS_STORY_CONSENT_SEED) add(item.journeyId, "successStoryConsentSeed");
  for (const item of COUPLE_HAPPINESS_NOTES_SEED) add(item.journeyId, "coupleHappinessNotesSeed");
  for (const item of RELATIONSHIP_HEALTH_ALERTS_SEED) add(item.journeyId, "relationshipHealthAlertsSeed");
  for (const item of CONCIERGE_JOURNEY_STORY_PROFILE_SEED) add(item.journeyId, "journeyStoryProfileSeed");

  return map;
}

export function buildJourneyDependencies(): JourneyDependency[] {
  const canonical = new Set(buildCanonicalJourneyRecords().map((record) => record.journeyId));
  const references = collectReferencedJourneyIds();
  const dependencies: JourneyDependency[] = [];

  for (const [journeyId, sources] of references.entries()) {
    for (const source of sources) {
      if (source === "conciergeConsultantSeed") continue;
      dependencies.push({
        id: `dep-${journeyId}-${source}`,
        journeyId,
        system: source,
        recordType: source.replace(/Seed$/, ""),
        linked: canonical.has(journeyId),
        status: canonical.has(journeyId)
          ? isValidJourneyId(journeyId)
            ? "healthy"
            : "broken"
          : "critical",
        note: canonical.has(journeyId) ? null : "Referenced outside canonical member registry"
      });
    }
  }

  return dependencies.sort((left, right) => left.journeyId.localeCompare(right.journeyId));
}

export function findDuplicateJourneyIds(): string[] {
  const memberIds = CONCIERGE_CONSULTANT_SEED.map((member) => member.journeyId).filter(Boolean) as string[];
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const journeyId of memberIds) {
    const normalized = normalizeJourneyId(journeyId);
    if (seen.has(normalized)) duplicates.add(normalized);
    seen.add(normalized);
  }

  return [...duplicates];
}

export function findMissingJourneyIdMembers(): string[] {
  return CONCIERGE_CONSULTANT_SEED.filter((member) => !member.journeyId).map((member) => member.id);
}

export function findFinanceRecordsMissingJourneyRef(): number {
  return FINANCE_OPERATIONS_SEED.filter((record) => !record.journeyRef).length;
}
