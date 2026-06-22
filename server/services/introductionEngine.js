/** Signal Concierge Introduction Engine — server-side regression helpers. */

import {
  assignIntroductionId,
  createEmptyIntroductionRegistry,
  registerExistingIntroductionId
} from "./introductionId.js";

export const CLOSED_INTRODUCTION_STATUSES = new Set(["declined", "closed", "married"]);

export const LEGACY_INTRODUCTION_STATUS_MAP = {
  candidate: "pending-review",
  "consultant-review": "pending-review",
  "member-a-approval": "presented",
  "member-b-approval": "awaiting-response",
  "introduction-scheduled": "accepted",
  "conversation-started": "active-conversation",
  "follow-up": "active-conversation",
  successful: "relationship",
  closed: "closed"
};

export function normalizeIntroductionStatus(status) {
  return LEGACY_INTRODUCTION_STATUS_MAP[status] ?? status;
}

export function pairKey(memberAId, memberBId) {
  return [memberAId, memberBId].sort().join("::");
}

export function findDuplicateIntroduction(records, memberAId, memberBId, excludeId) {
  const key = pairKey(memberAId, memberBId);
  return (
    records.find((record) => {
      if (excludeId && record.id === excludeId) return false;
      if (CLOSED_INTRODUCTION_STATUSES.has(record.status)) return false;
      return pairKey(record.memberAId, record.memberBId) === key;
    }) ?? null
  );
}

export function assertNoDuplicateIntroduction(records, memberAId, memberBId, excludeId) {
  const duplicate = findDuplicateIntroduction(records, memberAId, memberBId, excludeId);
  if (duplicate) {
    throw new Error(
      `Duplicate introduction blocked: ${duplicate.introductionId ?? duplicate.id} already active for this pair`
    );
  }
}

export function assertIntroductionHistoryIntegrity(previous, next) {
  if (next.history.length < previous.history.length) {
    throw new Error("Introduction history cannot shrink");
  }
  if (previous.introductionId && next.introductionId !== previous.introductionId) {
    throw new Error("Introduction ID cannot change");
  }
}

export function bothMembersConsented(record) {
  return record.memberAApproved === true && record.memberBApproved === true;
}

export function canRevealCounterpart(record) {
  return bothMembersConsented(record);
}

export function pushIntroductionHistory(record, input) {
  const entry = {
    id: `ih_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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

export function recordIntroductionMemberApproval(record, memberId, approved) {
  if (memberId === record.memberAId) {
    record.memberAApproved = approved;
    if (approved) record.memberAPresentedAt = new Date().toISOString();
  } else if (memberId === record.memberBId) {
    record.memberBApproved = approved;
    if (approved) record.memberBPresentedAt = new Date().toISOString();
  } else {
    return { ok: false, reason: "Member is not part of this introduction." };
  }

  if (!approved) {
    record.status = "declined";
    record.outcome = "not-a-fit";
    record.bothConsented = false;
    pushIntroductionHistory(record, { label: "Declined" });
    return { ok: true, record };
  }

  pushIntroductionHistory(record, {
    label: "Presented",
    detail: memberId === record.memberAId ? "Member A" : "Member B",
    pipelinePhase: memberId === record.memberAId ? "member-a-presented" : "member-b-presented"
  });

  if (record.memberAApproved === true && record.memberBApproved === true) {
    record.bothConsented = true;
    record.status = "accepted";
    pushIntroductionHistory(record, {
      label: "Accepted",
      detail: "Mutual acceptance confirmed",
      pipelinePhase: "mutual-acceptance"
    });
    pushIntroductionHistory(record, { label: "Introduction Made", pipelinePhase: "introduction-made" });
    record.status = "active-conversation";
    record.outcome = "still-talking";
  } else if (record.memberAApproved === true && record.memberBApproved === null) {
    record.status = "awaiting-response";
  } else if (record.memberAApproved === null && record.memberBApproved === true) {
    record.status = "presented";
  }

  return { ok: true, record };
}

export function allocateIntroductionId(registry, recordId, createdAt) {
  const result = assignIntroductionId(registry, { recordId, createdAt });
  return result;
}

export function bootstrapIntroductionRegistry(seedRecords) {
  let registry = createEmptyIntroductionRegistry();
  for (const record of seedRecords) {
    registry = registerExistingIntroductionId(registry, {
      recordId: record.id,
      introductionId: record.introductionId,
      createdAt: record.createdAt
    });
  }
  return registry;
}
