import {
  CLOSED_INTRODUCTION_STATUSES,
  INTRODUCTION_PIPELINE_PHASES,
  LEGACY_INTRODUCTION_OUTCOME_MAP,
  LEGACY_INTRODUCTION_STATUS_MAP,
  type IntroductionPipelinePhaseId,
  type IntroductionStatus
} from "../constants/conciergeIntroduction";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  IntroductionCompatibilitySnapshot,
  IntroductionHistoryEntry,
  IntroductionRecord
} from "../types/conciergeIntroduction";

export function normalizeIntroductionStatus(status: string): IntroductionStatus {
  if (status in LEGACY_INTRODUCTION_STATUS_MAP) {
    return LEGACY_INTRODUCTION_STATUS_MAP[status];
  }
  return status as IntroductionStatus;
}

export function normalizeIntroductionOutcome(outcome?: string) {
  if (!outcome) return undefined;
  return LEGACY_INTRODUCTION_OUTCOME_MAP[outcome] ?? outcome;
}

export function normalizeIntroductionRecord(record: IntroductionRecord): IntroductionRecord {
  const status = normalizeIntroductionStatus(record.status);
  const compatibilityScore = record.compatibilityScore ?? record.successProbability;
  return {
    ...record,
    status,
    outcome: normalizeIntroductionOutcome(record.outcome),
    matchNotes: record.matchNotes ?? [],
    pipelinePhase: record.pipelinePhase ?? "candidate-identified",
    compatibilityScore,
    history: (record.history ?? []).map((entry) => ({
      ...entry,
      outcome: normalizeIntroductionOutcome(entry.outcome)
    }))
  };
}

export function pairKey(memberAId: string, memberBId: string): string {
  return [memberAId, memberBId].sort().join("::");
}

export function findDuplicateIntroduction(
  records: IntroductionRecord[],
  memberAId: string,
  memberBId: string,
  excludeId?: string
): IntroductionRecord | null {
  const key = pairKey(memberAId, memberBId);
  return (
    records.find((record) => {
      if (excludeId && record.id === excludeId) return false;
      if (CLOSED_INTRODUCTION_STATUSES.has(record.status)) return false;
      return pairKey(record.memberAId, record.memberBId) === key;
    }) ?? null
  );
}

export function assertNoDuplicateIntroduction(
  records: IntroductionRecord[],
  memberAId: string,
  memberBId: string,
  excludeId?: string
): void {
  const duplicate = findDuplicateIntroduction(records, memberAId, memberBId, excludeId);
  if (duplicate) {
    throw new Error(
      `Duplicate introduction blocked: ${duplicate.introductionId ?? duplicate.id} already active for this pair`
    );
  }
}

export function assertIntroductionHistoryIntegrity(
  previous: IntroductionRecord,
  next: IntroductionRecord
): void {
  if (next.history.length < previous.history.length) {
    throw new Error("Introduction history cannot shrink");
  }
  if (previous.introductionId && next.introductionId !== previous.introductionId) {
    throw new Error("Introduction ID cannot change");
  }
}

export function buildCompatibilityFromMembers(
  memberA: ConciergeMemberRecord,
  memberB: ConciergeMemberRecord
): IntroductionCompatibilitySnapshot {
  const score = estimateCompatibilityScore(memberA, memberB);
  return {
    score,
    faith: `${memberA.aboutYou.religion} / ${memberB.aboutYou.religion}`,
    lifestyle: `${memberA.valuesLifestyle.fitness} · ${memberB.valuesLifestyle.fitness}`,
    marriageTimeline: `${memberA.relationshipGoals.marriageTimeline} / ${memberB.relationshipGoals.marriageTimeline}`,
    familyValues: `${memberA.valuesLifestyle.faithImportance} · ${memberB.valuesLifestyle.faithImportance}`,
    childrenPreference: `${memberA.aboutYou.children} / ${memberB.aboutYou.children}`,
    location: `${memberA.aboutYou.city} / ${memberB.aboutYou.city}`,
    relocationOpenness: inferRelocationOpenness(memberA, memberB),
    communicationStyle: `${memberA.valuesLifestyle.loveLanguage} / ${memberB.valuesLifestyle.loveLanguage}`,
    loveLanguage: `${memberA.valuesLifestyle.loveLanguage} · ${memberB.valuesLifestyle.loveLanguage}`,
    dealBreakers: `${memberA.relationshipGoals.dealBreakers} · ${memberB.relationshipGoals.dealBreakers}`
  };
}

function inferRelocationOpenness(memberA: ConciergeMemberRecord, memberB: ConciergeMemberRecord): string {
  const diasporaHints = [memberA.aboutYou.city, memberB.aboutYou.city, memberA.valuesLifestyle.travel]
    .join(" ")
    .toLowerCase();
  if (diasporaHints.includes("diaspora") || diasporaHints.includes("abroad")) {
    return "Open to relocation";
  }
  if (memberA.aboutYou.city !== memberB.aboutYou.city) {
    return "Cross-city — review relocation openness";
  }
  return "Same city preference";
}

function estimateCompatibilityScore(memberA: ConciergeMemberRecord, memberB: ConciergeMemberRecord): number {
  let score = 62;
  if (memberA.aboutYou.religion === memberB.aboutYou.religion) score += 12;
  if (memberA.valuesLifestyle.faithImportance === memberB.valuesLifestyle.faithImportance) score += 8;
  if (memberA.aboutYou.city === memberB.aboutYou.city) score += 6;
  if (memberA.trustedMember && memberB.trustedMember) score += 4;
  return Math.min(98, score);
}

export type PipelinePhaseView = {
  id: IntroductionPipelinePhaseId;
  label: string;
  reached: boolean;
};

export function derivePipelinePhases(record: IntroductionRecord): PipelinePhaseView[] {
  const historyPhases = new Set(record.history.map((item) => item.pipelinePhase).filter(Boolean));
  const reachedByPhase: Record<IntroductionPipelinePhaseId, boolean> = {
    "candidate-identified": true,
    "internal-review":
      historyPhases.has("internal-review") ||
      !["pending-review"].includes(record.status) ||
      record.history.length > 1,
    "compatibility-review":
      historyPhases.has("compatibility-review") || Boolean(record.compatibility || record.compatibilityScore),
    approved:
      historyPhases.has("approved") ||
      record.history.some((item) => item.label.toLowerCase().includes("approved")),
    "member-a-presented":
      historyPhases.has("member-a-presented") ||
      record.memberAPresentedAt != null ||
      record.memberAApproved != null,
    "member-b-presented":
      historyPhases.has("member-b-presented") ||
      record.memberBPresentedAt != null ||
      record.memberBApproved != null,
    "mutual-acceptance": record.bothConsented || historyPhases.has("mutual-acceptance"),
    "introduction-made":
      historyPhases.has("introduction-made") ||
      ["accepted", "active-conversation", "exclusive", "relationship", "engaged", "married"].includes(
        record.status
      ),
    "follow-up": historyPhases.has("follow-up") || Boolean(record.followUpDate),
    "outcome-recorded": historyPhases.has("outcome-recorded") || Boolean(record.outcome)
  };

  return INTRODUCTION_PIPELINE_PHASES.map((phase) => ({
    id: phase.id,
    label: phase.label,
    reached: reachedByPhase[phase.id]
  }));
}

export function pushIntroductionHistory(
  record: IntroductionRecord,
  input: {
    label: string;
    detail?: string;
    pipelinePhase?: IntroductionPipelinePhaseId;
    outcome?: IntroductionRecord["outcome"];
  }
): IntroductionHistoryEntry {
  const entry: IntroductionHistoryEntry = {
    id: `ih_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    label: input.label,
    detail: input.detail,
    outcome: input.outcome,
    pipelinePhase: input.pipelinePhase
  };
  record.history.unshift(entry);
  if (input.pipelinePhase) {
    record.pipelinePhase = input.pipelinePhase;
  }
  return entry;
}

export function bothMembersConsented(record: IntroductionRecord): boolean {
  return record.memberAApproved === true && record.memberBApproved === true;
}

export function canRevealCounterpart(record: IntroductionRecord): boolean {
  return bothMembersConsented(record);
}
