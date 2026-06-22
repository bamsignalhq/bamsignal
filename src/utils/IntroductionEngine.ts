import {
  CONSULTANT_INTRO_NOTE_EXAMPLE,
  CONSULTANT_INTRO_SUGGESTED_MESSAGE,
  INTRODUCTION_FOLLOW_UP_INTERVALS,
  type IntroductionFollowUpInterval,
  type IntroductionOutcome,
  type IntroductionStatus
} from "../constants/conciergeIntroduction";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  CreateIntroductionInput,
  IntroductionFeedbackEntry,
  IntroductionHistoryEntry,
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

function pushHistory(
  record: IntroductionRecord,
  label: string,
  detail?: string,
  outcome?: IntroductionOutcome
): IntroductionHistoryEntry {
  const entry: IntroductionHistoryEntry = {
    id: `ih_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    label,
    detail,
    outcome
  };
  record.history.unshift(entry);
  return entry;
}

export function bothMembersConsented(record: IntroductionRecord): boolean {
  return record.memberAApproved === true && record.memberBApproved === true;
}

export function canAdvanceIntroduction(record: IntroductionRecord, next: IntroductionStatus): boolean {
  if (next === "introduction-scheduled" || next === "conversation-started") {
    return bothMembersConsented(record);
  }
  if (next === "member-b-approval" && record.memberAApproved !== true) {
    return false;
  }
  return true;
}

export function buildMemberIntroductionPreview(
  member: ConciergeMemberRecord,
  consultantNote: string
): MemberIntroductionPreview {
  return {
    firstName: firstName(member.aboutYou.name),
    age: member.aboutYou.age,
    city: member.aboutYou.city,
    occupation: member.aboutYou.occupation,
    voiceVibeAvailable: member.voiceVibe.completed,
    trustedMember: member.trustedMember,
    relationshipGoalsSummary: relationshipGoalsSummary(member),
    consultantNote: consultantNote || CONSULTANT_INTRO_NOTE_EXAMPLE
  };
}

export function buildMemberIntroductionReveal(
  member: ConciergeMemberRecord,
  consultantNote: string,
  contactBridgeReady: boolean
): MemberIntroductionReveal {
  return {
    ...buildMemberIntroductionPreview(member, consultantNote),
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

  return buildMemberIntroductionPreview(counterpart, note);
}

export function getIntroductionRevealForMember(
  record: IntroductionRecord,
  viewingMemberId: string
): MemberIntroductionReveal | null {
  if (!record.bothConsented) return null;
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

  return buildMemberIntroductionReveal(counterpart, note, record.status !== "closed");
}

export function listPendingIntroductions(): IntroductionRecord[] {
  const pendingStatuses = new Set<IntroductionStatus>([
    "candidate",
    "consultant-review",
    "member-a-approval",
    "member-b-approval",
    "introduction-scheduled"
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

  const now = new Date().toISOString();
  const record: IntroductionRecord = {
    id: `intro_${Date.now().toString(36)}`,
    memberAId: input.memberAId,
    memberBId: input.memberBId,
    consultantId: input.consultantId ?? DEFAULT_CONSULTANT_ID,
    tier: input.tier ?? memberA.preferredTier ?? memberB.preferredTier,
    createdAt: now,
    updatedAt: now,
    status: "candidate",
    notes: input.notes ?? "",
    consultantMessage: input.consultantMessage ?? CONSULTANT_INTRO_SUGGESTED_MESSAGE,
    memberAPreviewNote: input.memberAPreviewNote ?? CONSULTANT_INTRO_NOTE_EXAMPLE,
    memberBPreviewNote: input.memberBPreviewNote ?? CONSULTANT_INTRO_NOTE_EXAMPLE,
    memberAApproved: null,
    memberBApproved: null,
    successProbability: input.successProbability,
    internalFlags: input.internalFlags ?? [],
    feedback: [],
    history: [],
    bothConsented: false
  };
  pushHistory(record, "Candidate identified");
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
  pushHistory(record, INTRODUCTION_STATUS_LABELS_INTERNAL[nextStatus] ?? nextStatus);
  if (nextStatus === "conversation-started" && !record.outcome) {
    record.outcome = "conversation-ongoing";
  }
  return { ok: true, record: saveIntroductionRecord(record) };
}

const INTRODUCTION_STATUS_LABELS_INTERNAL: Record<IntroductionStatus, string> = {
  candidate: "Candidate identified",
  "consultant-review": "Consultant review",
  "member-a-approval": "Awaiting Member A approval",
  "member-b-approval": "Awaiting Member B approval",
  "introduction-scheduled": "Introduction scheduled",
  "conversation-started": "Conversation started",
  "follow-up": "Follow-up scheduled",
  successful: "Journey marked successful",
  closed: "Introduction closed"
};

export function recordIntroductionMemberApproval(
  id: string,
  memberId: string,
  approved: boolean
): { ok: boolean; record?: IntroductionRecord; reason?: string } {
  const record = getIntroductionRecord(id);
  if (!record) return { ok: false, reason: "Introduction not found." };

  if (memberId === record.memberAId) record.memberAApproved = approved;
  else if (memberId === record.memberBId) record.memberBApproved = approved;
  else return { ok: false, reason: "Member is not part of this introduction." };

  const label = approved ? "Approval received" : "Declined";
  pushHistory(record, label, memberId === record.memberAId ? "Member A" : "Member B");

  if (!approved) {
    record.status = "closed";
    record.outcome = "not-a-fit";
    record.bothConsented = false;
    return { ok: true, record: saveIntroductionRecord(record) };
  }

  if (record.memberAApproved === true && record.memberBApproved === null) {
    record.status = "member-b-approval";
  } else if (record.memberAApproved === true && record.memberBApproved === true) {
    record.bothConsented = true;
    if (
      record.status === "member-a-approval" ||
      record.status === "member-b-approval" ||
      record.status === "consultant-review"
    ) {
      record.status = "introduction-scheduled";
      pushHistory(record, "Introduction scheduled", "Mutual consent confirmed");
    }
  } else if (record.memberAApproved === null && record.memberBApproved === true) {
    record.status = "member-a-approval";
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
  pushHistory(record, "Feedback received", feedback.body.slice(0, 80));
  return saveIntroductionRecord(record);
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
  record.status = "follow-up";
  pushHistory(record, "Follow-up scheduled", config.label);
  return saveIntroductionRecord(record);
}

export function setIntroductionOutcome(
  id: string,
  outcome: IntroductionOutcome
): IntroductionRecord | null {
  const record = getIntroductionRecord(id);
  if (!record) return null;
  record.outcome = outcome;
  if (outcome === "married" || outcome === "engaged" || outcome === "relationship") {
    record.status = "successful";
  }
  if (outcome === "not-a-fit" || outcome === "no-response") {
    record.status = "closed";
  }
  pushHistory(record, "Journey update", outcome, outcome);
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
