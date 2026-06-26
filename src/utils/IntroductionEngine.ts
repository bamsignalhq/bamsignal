import {
  CONSULTANT_INTRO_NOTE_EXAMPLE,
  CONSULTANT_INTRO_SUGGESTED_MESSAGE,
  INTRODUCTION_FOLLOW_UP_INTERVALS,
  INTRODUCTION_OUTCOME_LABELS,
  INTRODUCTION_STATUS_LABELS,
  type IntroductionConfidenceLevel,
  type IntroductionFollowUpInterval,
  type IntroductionOutcome,
  type IntroductionStatus
} from "../constants/conciergeIntroduction";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  CreateIntroductionInput,
  IntroductionFeedbackEntry,
  IntroductionRecord,
  MemberIntroductionPreview,
  MemberIntroductionReveal
} from "../types/conciergeIntroduction";
import { getConciergeMember } from "./conciergeConsultantStore";
import {
  getIntroductionRecord,
  listIntroductionRecords,
  saveIntroductionRecord
} from "./conciergeIntroductionStore";
import { assignIntroductionId } from "./introductionIdRegistry";
import {
  assertIntroductionCooldown,
  assertNoDuplicateIntroduction,
  buildCompatibilityFromMembers,
  buildCompatibilitySummary,
  buildConnectionReasonsFromMembers,
  bothMembersConsented,
  canRevealCounterpart,
  filterMemberVisibleIntroductions,
  getMemberCooldownSnapshot,
  normalizeIntroductionRecord,
  pushIntroductionHistory,
  suggestConfidenceLevel
} from "./introductionEngineLogic";
import { getConciergeConsultant } from "./conciergeConsultantDirectoryStore";

const DEFAULT_CONSULTANT_ID = "consultant_ada";

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function relationshipGoalsSummary(member: ConciergeMemberRecord): string {
  const goals = member.relationshipGoals;
  const parts = [
    goals.whatHopingToFind || goals.partnerPreferences,
    goals.marriageTimeline,
    goals.childrenPreference || goals.familyGoals
  ].filter(Boolean);
  return parts.join(" · ") || "Meaningful relationship";
}

export { bothMembersConsented, canRevealCounterpart, filterMemberVisibleIntroductions, getMemberCooldownSnapshot };

export function canAdvanceIntroduction(record: IntroductionRecord, next: IntroductionStatus): boolean {
  const mutualRequired: IntroductionStatus[] = [
    "accepted",
    "active-conversation",
    "exclusive",
    "relationship",
    "engaged",
    "married"
  ];
  if (mutualRequired.includes(next) && !bothMembersConsented(record)) {
    return false;
  }
  return true;
}

export function buildMemberIntroductionPreview(
  member: ConciergeMemberRecord,
  consultantNote: string,
  connectionReasons: string[] = []
): MemberIntroductionPreview {
  return {
    firstName: firstName(member.aboutYou.name),
    age: member.aboutYou.age,
    city: member.aboutYou.city,
    occupation: member.aboutYou.occupation,
    voiceVibeAvailable: member.voiceVibe.completed,
    trustedMember: member.trustedMember,
    relationshipGoalsSummary: relationshipGoalsSummary(member),
    consultantNote: consultantNote || CONSULTANT_INTRO_NOTE_EXAMPLE,
    connectionReasons
  };
}

export function buildMemberIntroductionReveal(
  member: ConciergeMemberRecord,
  consultantNote: string,
  contactBridgeReady: boolean,
  connectionReasons: string[] = []
): MemberIntroductionReveal {
  return {
    ...buildMemberIntroductionPreview(member, consultantNote, connectionReasons),
    photos: member.photos,
    voiceVibeUrl: member.voiceVibe.url,
    voiceVibeDuration: member.voiceVibe.duration,
    videoIntroUrl: member.videoIntro.url,
    videoIntroDuration: member.videoIntro.duration,
    contactBridgeReady
  };
}

export function getIntroductionPreviewForMember(
  record: IntroductionRecord,
  viewingMemberId: string
): MemberIntroductionPreview | null {
  if (!canMemberSeeCounterpart(record, viewingMemberId)) return null;

  const counterpartId =
    viewingMemberId === record.memberAId
      ? record.memberBId
      : viewingMemberId === record.memberBId
        ? record.memberAId
        : null;
  if (!counterpartId) return null;

  const counterpart = getConciergeMember(counterpartId);
  if (!counterpart) return null;

  const note =
    viewingMemberId === record.memberAId ? record.memberBPreviewNote : record.memberAPreviewNote;

  return buildMemberIntroductionPreview(counterpart, note, record.connectionReasons);
}

export function getIntroductionRevealForMember(
  record: IntroductionRecord,
  viewingMemberId: string
): MemberIntroductionReveal | null {
  if (!canRevealCounterpart(record) || !canMemberSeeCounterpart(record, viewingMemberId)) return null;

  const counterpartId =
    viewingMemberId === record.memberAId
      ? record.memberBId
      : viewingMemberId === record.memberBId
        ? record.memberAId
        : null;
  if (!counterpartId) return null;

  const counterpart = getConciergeMember(counterpartId);
  if (!counterpart) return null;

  const note =
    viewingMemberId === record.memberAId ? record.memberBPreviewNote : record.memberAPreviewNote;

  return buildMemberIntroductionReveal(counterpart, note, record.status !== "closed", record.connectionReasons);
}

function canMemberSeeCounterpart(record: IntroductionRecord, viewingMemberId: string): boolean {
  if (!bothMembersConsented(record)) return false;
  return viewingMemberId === record.memberAId || viewingMemberId === record.memberBId;
}

export function listPendingIntroductions(): IntroductionRecord[] {
  const pendingStatuses = new Set<IntroductionStatus>([
    "pending-review",
    "compatibility-review",
    "presented",
    "awaiting-response",
    "accepted"
  ]);
  return listIntroductionRecords().filter((record) => pendingStatuses.has(record.status));
}

export function listIntroductionHistory(): IntroductionRecord[] {
  return [...listIntroductionRecords()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function listIntroductionsForMember(memberId: string): IntroductionRecord[] {
  return listIntroductionRecords().filter(
    (record) => record.memberAId === memberId || record.memberBId === memberId
  );
}

export function createIntroductionCandidate(input: CreateIntroductionInput): IntroductionRecord | null {
  if (input.memberAId === input.memberBId) return null;
  const memberA = getConciergeMember(input.memberAId);
  const memberB = getConciergeMember(input.memberBId);
  if (!memberA || !memberB) return null;

  const existing = listIntroductionRecords();
  try {
    assertNoDuplicateIntroduction(existing, input.memberAId, input.memberBId);
    assertIntroductionCooldown(existing, input.memberAId, input.memberBId);
  } catch {
    return null;
  }

  const now = new Date().toISOString();
  const consultantId = input.consultantId ?? DEFAULT_CONSULTANT_ID;
  const consultant = getConciergeConsultant(consultantId);
  const compatibility = input.compatibility
    ? { ...buildCompatibilityFromMembers(memberA, memberB), ...input.compatibility }
    : buildCompatibilityFromMembers(memberA, memberB);
  const connectionReasons =
    input.connectionReasons ?? buildConnectionReasonsFromMembers(memberA, memberB);
  const confidenceLevel =
    input.confidenceLevel ?? suggestConfidenceLevel(memberA, memberB);
  const recordId = `intro_${Date.now().toString(36)}`;
  const introductionId = assignIntroductionId({ recordId, createdAt: now });

  const record: IntroductionRecord = normalizeIntroductionRecord({
    id: recordId,
    introductionId,
    memberAId: input.memberAId,
    memberBId: input.memberBId,
    journeyAId: memberA.journeyId,
    journeyBId: memberB.journeyId,
    consultantId,
    consultantName: consultant?.name,
    tier: input.tier ?? memberA.preferredTier ?? memberB.preferredTier,
    createdAt: now,
    updatedAt: now,
    status: "pending-review",
    pipelinePhase: "candidate-identified",
    notes: input.notes ?? "",
    matchNotes: input.matchNotes ?? [],
    connectionReasons,
    compatibilitySummary: buildCompatibilitySummary(compatibility),
    confidenceLevel,
    consultantMessage: input.consultantMessage ?? CONSULTANT_INTRO_SUGGESTED_MESSAGE,
    memberAPreviewNote: input.memberAPreviewNote ?? CONSULTANT_INTRO_NOTE_EXAMPLE,
    memberBPreviewNote: input.memberBPreviewNote ?? CONSULTANT_INTRO_NOTE_EXAMPLE,
    memberAApproved: null,
    memberBApproved: null,
    compatibility,
    internalFlags: input.internalFlags ?? [],
    feedback: [],
    history: [],
    bothConsented: false,
    isInternalCandidate: true
  });

  pushIntroductionHistory(record, {
    label: "Candidate Identified",
    pipelinePhase: "candidate-identified"
  });
  return saveIntroductionRecord(record);
}

export function advanceIntroductionStatus(
  id: string,
  nextStatus: IntroductionStatus
): { ok: boolean; record?: IntroductionRecord; reason?: string } {
  const record = getIntroductionRecord(id);
  if (!record) return { ok: false, reason: "Introduction not found." };
  if (!canAdvanceIntroduction(record, nextStatus)) {
    return { ok: false, reason: "Both members must consent before this step." };
  }

  record.status = nextStatus;
  pushIntroductionHistory(record, {
    label: INTRODUCTION_STATUS_LABELS[nextStatus],
    pipelinePhase: mapStatusToPipelinePhase(nextStatus)
  });

  if (nextStatus === "active-conversation" && !record.outcome) {
    record.outcome = "still-talking";
  }
  return { ok: true, record: saveIntroductionRecord(record) };
}

function mapStatusToPipelinePhase(status: IntroductionStatus) {
  switch (status) {
    case "pending-review":
      return "internal-review" as const;
    case "compatibility-review":
      return "compatibility-review" as const;
    case "presented":
      return "member-a-presented" as const;
    case "awaiting-response":
      return "member-b-presented" as const;
    case "accepted":
      return "mutual-acceptance" as const;
    case "active-conversation":
      return "introduction-made" as const;
    case "exclusive":
    case "relationship":
    case "engaged":
    case "married":
      return "outcome-recorded" as const;
    default:
      return undefined;
  }
}

export function recordIntroductionMemberApproval(
  id: string,
  memberId: string,
  approved: boolean
): { ok: boolean; record?: IntroductionRecord; reason?: string } {
  const record = getIntroductionRecord(id);
  if (!record) return { ok: false, reason: "Introduction not found." };

  const now = new Date().toISOString();
  if (memberId === record.memberAId) {
    record.memberAApproved = approved;
    if (approved) record.memberAPresentedAt = now;
  } else if (memberId === record.memberBId) {
    record.memberBApproved = approved;
    if (approved) record.memberBPresentedAt = now;
  } else {
    return { ok: false, reason: "Member is not part of this introduction." };
  }

  if (!approved) {
    record.status = "declined";
    record.outcome = "not-a-fit";
    record.bothConsented = false;
    pushIntroductionHistory(record, { label: "Declined", detail: memberId === record.memberAId ? "Member A" : "Member B" });
    return { ok: true, record: saveIntroductionRecord(record) };
  }

  pushIntroductionHistory(record, {
    label: "Presented",
    detail: memberId === record.memberAId ? "Member A" : "Member B",
    pipelinePhase: memberId === record.memberAId ? "member-a-presented" : "member-b-presented"
  });
  record.isInternalCandidate = false;

  if (record.memberAApproved === true && record.memberBApproved === null) {
    record.status = "awaiting-response";
  } else if (record.memberAApproved === true && record.memberBApproved === true) {
    record.bothConsented = true;
    record.status = "accepted";
    pushIntroductionHistory(record, {
      label: "Accepted",
      detail: "Mutual acceptance confirmed",
      pipelinePhase: "mutual-acceptance"
    });
    pushIntroductionHistory(record, {
      label: "Introduction Made",
      pipelinePhase: "introduction-made"
    });
    record.status = "active-conversation";
    record.outcome = "still-talking";
  } else if (record.memberAApproved === null && record.memberBApproved === true) {
    record.status = "presented";
  }

  return { ok: true, record: saveIntroductionRecord(record) };
}

export function addIntroductionFeedback(
  id: string,
  entry: Omit<IntroductionFeedbackEntry, "id" | "at">
): IntroductionRecord | null {
  const record = getIntroductionRecord(id);
  if (!record) return null;
  const feedback: IntroductionFeedbackEntry = {
    ...entry,
    id: `fb_${Date.now().toString(36)}`,
    at: new Date().toISOString()
  };
  record.feedback.unshift(feedback);
  pushIntroductionHistory(record, { label: "Feedback recorded", detail: feedback.body.slice(0, 80) });
  return saveIntroductionRecord(record);
}

export function updateIntroductionMatchNotes(
  id: string,
  matchNotes: string[]
): IntroductionRecord | null {
  const record = getIntroductionRecord(id);
  if (!record) return null;
  record.matchNotes = matchNotes;
  return saveIntroductionRecord(record);
}

export function updateIntroductionConfidence(
  id: string,
  confidenceLevel: IntroductionConfidenceLevel
): IntroductionRecord | null {
  const record = getIntroductionRecord(id);
  if (!record) return null;
  record.confidenceLevel = confidenceLevel;
  return saveIntroductionRecord(record);
}

export function updateIntroductionConnectionReasons(
  id: string,
  connectionReasons: string[]
): IntroductionRecord | null {
  const record = getIntroductionRecord(id);
  if (!record) return null;
  record.connectionReasons = connectionReasons;
  return saveIntroductionRecord(record);
}

export function getIntroductionCooldownForMembers(memberAId: string, memberBId: string) {
  const records = listIntroductionRecords();
  return {
    memberA: getMemberCooldownSnapshot(records, memberAId),
    memberB: getMemberCooldownSnapshot(records, memberBId)
  };
}

export function scheduleIntroductionFollowUp(
  id: string,
  interval: IntroductionFollowUpInterval
): IntroductionRecord | null {
  const record = getIntroductionRecord(id);
  if (!record) return null;
  const config = INTRODUCTION_FOLLOW_UP_INTERVALS.find((item) => item.id === interval);
  if (!config) return null;

  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + config.days);

  record.followUpInterval = interval;
  record.followUpDate = followUpDate.toISOString();
  pushIntroductionHistory(record, { label: "Follow-Up", detail: config.label, pipelinePhase: "follow-up" });
  return saveIntroductionRecord(record);
}

export function setIntroductionOutcome(
  id: string,
  outcome: IntroductionOutcome
): IntroductionRecord | null {
  const record = getIntroductionRecord(id);
  if (!record) return null;
  record.outcome = outcome;

  if (outcome === "married") record.status = "married";
  else if (outcome === "engaged") record.status = "engaged";
  else if (outcome === "relationship") record.status = "relationship";
  else if (outcome === "exclusive") record.status = "exclusive";
  else if (outcome === "not-a-fit" || outcome === "no-response" || outcome === "no-chemistry" || outcome === "timing-issue") {
    record.status = "closed";
  } else if (outcome === "still-talking") {
    record.status = "active-conversation";
  }

  pushIntroductionHistory(record, {
    label: INTRODUCTION_OUTCOME_LABELS[outcome],
    outcome,
    pipelinePhase: "outcome-recorded"
  });
  return saveIntroductionRecord(record);
}

export function getMemberDisplayName(memberId: string): string {
  return getConciergeMember(memberId)?.aboutYou.name ?? memberId;
}

export function getIntroductionEngineSnapshot() {
  return {
    introductions: listIntroductionRecords(),
    pending: listPendingIntroductions()
  };
}
