import {
  ACTIVE_INTRODUCTION_STATUSES,
  CLOSED_INTRODUCTION_STATUSES,
  CONNECTION_REASON_EXAMPLES,
  INTRODUCTION_COOLDOWN_MAX_ACTIVE,
  INTRODUCTION_PIPELINE_PHASES,
  INTERNAL_CANDIDATE_STATUSES,
  LEGACY_INTRODUCTION_OUTCOME_MAP,
  LEGACY_INTRODUCTION_STATUS_MAP,
  type IntroductionConfidenceLevel,
  type IntroductionPipelinePhaseId,
  type IntroductionStatus
} from "../constants/conciergeIntroduction";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  IntroductionCompatibilitySnapshot,
  IntroductionHistoryEntry,
  IntroductionRecord,
  MemberCooldownSnapshot
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

function deriveConfidenceFromLegacy(record: IntroductionRecord): IntroductionConfidenceLevel | undefined {
  if (record.confidenceLevel) return record.confidenceLevel;
  const raw = record.compatibilityScore ?? record.successProbability;
  if (raw == null) return undefined;
  if (raw >= 80) return "strong-fit";
  if (raw >= 70) return "promising";
  if (raw >= 55) return "worth-exploring";
  return "requires-conversation";
}

export function normalizeIntroductionRecord(record: IntroductionRecord): IntroductionRecord {
  const status = normalizeIntroductionStatus(record.status);
  const confidenceLevel = deriveConfidenceFromLegacy(record);
  const isInternalCandidate =
    record.isInternalCandidate ??
    (INTERNAL_CANDIDATE_STATUSES.has(status) &&
      record.memberAApproved == null &&
      record.memberBApproved == null);

  return {
    ...record,
    status,
    outcome: normalizeIntroductionOutcome(record.outcome),
    matchNotes: record.matchNotes ?? [],
    connectionReasons: record.connectionReasons ?? [],
    confidenceLevel,
    isInternalCandidate,
    pipelinePhase: record.pipelinePhase ?? "candidate-identified",
    compatibility: record.compatibility
      ? { ...record.compatibility, score: undefined }
      : record.compatibility,
    history: (record.history ?? []).map((entry) => ({
      ...entry,
      outcome: normalizeIntroductionOutcome(entry.outcome)
    }))
  };
}

export function pairKey(memberAId: string, memberBId: string): string {
  return [memberAId, memberBId].sort().join("::");
}

export function isIntroductionActive(record: IntroductionRecord): boolean {
  return ACTIVE_INTRODUCTION_STATUSES.has(record.status);
}

export function countActiveIntroductionsForMember(
  records: IntroductionRecord[],
  memberId: string,
  excludeId?: string
): number {
  return records.filter((record) => {
    if (excludeId && record.id === excludeId) return false;
    if (!isIntroductionActive(record)) return false;
    return record.memberAId === memberId || record.memberBId === memberId;
  }).length;
}

export function getMemberCooldownSnapshot(
  records: IntroductionRecord[],
  memberId: string
): MemberCooldownSnapshot {
  const active = records.filter(
    (record) =>
      isIntroductionActive(record) &&
      (record.memberAId === memberId || record.memberBId === memberId)
  );
  const activeCount = active.length;
  return {
    memberId,
    activeCount,
    maxActive: INTRODUCTION_COOLDOWN_MAX_ACTIVE,
    blocked: activeCount >= INTRODUCTION_COOLDOWN_MAX_ACTIVE,
    activeIntroductionIds: active.map((record) => record.introductionId)
  };
}

export function assertIntroductionCooldown(
  records: IntroductionRecord[],
  memberAId: string,
  memberBId: string
): void {
  const cooldownA = getMemberCooldownSnapshot(records, memberAId);
  const cooldownB = getMemberCooldownSnapshot(records, memberBId);
  if (cooldownA.blocked) {
    throw new Error(
      `Introduction cooldown: ${memberAId} has ${cooldownA.activeCount} active introductions (max ${INTRODUCTION_COOLDOWN_MAX_ACTIVE})`
    );
  }
  if (cooldownB.blocked) {
    throw new Error(
      `Introduction cooldown: ${memberBId} has ${cooldownB.activeCount} active introductions (max ${INTRODUCTION_COOLDOWN_MAX_ACTIVE})`
    );
  }
}

export function isInternalCandidateRecord(record: IntroductionRecord): boolean {
  return Boolean(
    record.isInternalCandidate ||
      (INTERNAL_CANDIDATE_STATUSES.has(record.status) &&
        record.memberAApproved == null &&
        record.memberBApproved == null)
  );
}

/** Members only see introductions presented to them — never internal pools. */
export function isMemberVisibleIntroduction(record: IntroductionRecord, memberId: string): boolean {
  if (record.memberAId !== memberId && record.memberBId !== memberId) return false;
  if (isInternalCandidateRecord(record)) return false;
  if (memberId === record.memberAId && record.memberAApproved !== null) return true;
  if (memberId === record.memberBId && record.memberBApproved !== null) return true;
  return record.bothConsented;
}

export function filterMemberVisibleIntroductions(
  records: IntroductionRecord[],
  memberId: string
): IntroductionRecord[] {
  return records.filter((record) => isMemberVisibleIntroduction(record, memberId));
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

export function buildConnectionReasonsFromMembers(
  memberA: ConciergeMemberRecord,
  memberB: ConciergeMemberRecord
): string[] {
  const reasons: string[] = [];
  if (memberA.aboutYou.religion && memberA.aboutYou.religion === memberB.aboutYou.religion) {
    reasons.push("Both value faith.");
  }
  if (
    memberA.valuesLifestyle.faithImportance === memberB.valuesLifestyle.faithImportance ||
    memberA.relationshipGoals.familyGoals
  ) {
    reasons.push("Both are family-oriented.");
  }
  if (memberA.relationshipGoals.marriageTimeline === memberB.relationshipGoals.marriageTimeline) {
    reasons.push("Similar marriage goals.");
  }
  if (memberA.valuesLifestyle.loveLanguage || memberB.valuesLifestyle.loveLanguage) {
    reasons.push("Strong communication styles.");
  }
  if (memberA.aboutYou.city !== memberB.aboutYou.city) {
    reasons.push("Open to relocation.");
  }
  if (memberA.valuesLifestyle.travel || memberB.valuesLifestyle.travel) {
    reasons.push("Love travelling.");
  }
  reasons.push("Enjoy meaningful conversations.");
  return [...new Set(reasons)].slice(0, 5);
}

export function buildCompatibilitySummary(snapshot: IntroductionCompatibilitySnapshot): string {
  const parts = [
    snapshot.faith.includes("/") && snapshot.faith.split("/")[0].trim() === snapshot.faith.split("/")[1]?.trim()
      ? "Shared faith"
      : null,
    snapshot.familyValues ? "family values" : null,
    snapshot.marriageTimeline ? "marriage timeline alignment" : null
  ].filter(Boolean);
  if (!parts.length) return "Thoughtful Journey Match under consultant review.";
  return `Shared ${parts.join(", ")}.`;
}

export function buildCompatibilityFromMembers(
  memberA: ConciergeMemberRecord,
  memberB: ConciergeMemberRecord
): IntroductionCompatibilitySnapshot {
  return {
    faith: `${memberA.aboutYou.religion} / ${memberB.aboutYou.religion}`,
    lifestyle: `${memberA.valuesLifestyle.fitness} · ${memberB.valuesLifestyle.fitness}`,
    marriageTimeline: `${memberA.relationshipGoals.marriageTimeline} / ${memberB.relationshipGoals.marriageTimeline}`,
    familyValues: `${memberA.valuesLifestyle.faithImportance} · ${memberB.valuesLifestyle.faithImportance}`,
    childrenPreference: `${memberA.aboutYou.children} / ${memberB.aboutYou.children}`,
    careerCompatibility: `${memberA.aboutYou.occupation} / ${memberB.aboutYou.occupation}`,
    location: `${memberA.aboutYou.city} / ${memberB.aboutYou.city}`,
    relocationOpenness: inferRelocationOpenness(memberA, memberB),
    communicationStyle: `${memberA.valuesLifestyle.loveLanguage} / ${memberB.valuesLifestyle.loveLanguage}`,
    loveLanguage: `${memberA.valuesLifestyle.loveLanguage} · ${memberB.valuesLifestyle.loveLanguage}`,
    dealBreakers: `${memberA.relationshipGoals.dealBreakers} · ${memberB.relationshipGoals.dealBreakers}`
  };
}

export function suggestConfidenceLevel(
  memberA: ConciergeMemberRecord,
  memberB: ConciergeMemberRecord
): IntroductionConfidenceLevel {
  let signals = 0;
  if (memberA.aboutYou.religion === memberB.aboutYou.religion) signals += 2;
  if (memberA.valuesLifestyle.faithImportance === memberB.valuesLifestyle.faithImportance) signals += 1;
  if (memberA.relationshipGoals.marriageTimeline === memberB.relationshipGoals.marriageTimeline) signals += 1;
  if (memberA.aboutYou.city === memberB.aboutYou.city) signals += 1;
  if (memberA.trustedMember && memberB.trustedMember) signals += 1;
  if (signals >= 5) return "strong-fit";
  if (signals >= 3) return "promising";
  if (signals >= 2) return "worth-exploring";
  return "requires-conversation";
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
      historyPhases.has("compatibility-review") ||
      record.status === "compatibility-review" ||
      Boolean(record.compatibility),
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

export { CONNECTION_REASON_EXAMPLES };
