/**
 * Signal Concierge Introduction Engine regression tests.
 */
import {
  allocateIntroductionId,
  assertIntroductionCooldown,
  assertIntroductionHistoryIntegrity,
  assertNoDuplicateIntroduction,
  bootstrapIntroductionRegistry,
  bothMembersConsented,
  canRevealCounterpart,
  filterMemberVisibleIntroductions,
  findDuplicateIntroduction,
  getMemberCooldownSnapshot,
  isInternalCandidateRecord,
  isMemberVisibleIntroduction,
  pushIntroductionHistory,
  recordIntroductionMemberApproval
} from "../server/services/introductionEngine.js";
import { formatIntroductionId } from "../server/services/introductionId.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const memberA = "sc_member_amaka";
const memberB = "sc_member_chidi";
const memberC = "sc_member_zara";
const memberD = "sc_member_tunde";

const seed = [
  {
    id: "intro_1",
    introductionId: "BS-IN-2026-0001",
    memberAId: memberA,
    memberBId: memberB,
    createdAt: "2026-01-10T00:00:00.000Z",
    status: "active-conversation",
    memberAApproved: true,
    memberBApproved: true,
    bothConsented: true,
    isInternalCandidate: false,
    history: [{ id: "h1", at: "2026-01-10T00:00:00.000Z", label: "Candidate Identified" }]
  },
  {
    id: "intro_2",
    introductionId: "BS-IN-2026-0002",
    memberAId: memberC,
    memberBId: memberB,
    createdAt: "2026-01-12T00:00:00.000Z",
    status: "closed",
    memberAApproved: false,
    memberBApproved: null,
    bothConsented: false,
    history: []
  },
  {
    id: "intro_internal",
    introductionId: "BS-IN-2026-0003",
    memberAId: memberD,
    memberBId: memberC,
    createdAt: "2026-01-14T00:00:00.000Z",
    status: "compatibility-review",
    memberAApproved: null,
    memberBApproved: null,
    bothConsented: false,
    isInternalCandidate: true,
    history: []
  }
];

// Duplicate prevention
const duplicate = findDuplicateIntroduction(seed, memberA, memberB);
assert(duplicate?.id === "intro_1", "blocks duplicate active introduction for same pair");

assertNoDuplicateIntroduction(seed, memberC, memberB, "intro_99");
assert(
  findDuplicateIntroduction(seed, memberC, memberB) === null,
  "allows new introduction when prior pair is closed"
);

let duplicateBlocked = false;
try {
  assertNoDuplicateIntroduction(seed, memberA, memberB);
} catch (error) {
  duplicateBlocked = error instanceof Error && error.message.includes("Duplicate introduction blocked");
}
assert(duplicateBlocked, "assertNoDuplicateIntroduction throws on active duplicate");

// Introduction ID permanence
let registry = bootstrapIntroductionRegistry(seed);
const first = allocateIntroductionId(registry, "intro_new_1", "2026-06-01T00:00:00.000Z");
registry = first.state;
assert(first.introductionId === formatIntroductionId(2026, 4), "allocates next sequential ID");

const second = allocateIntroductionId(registry, "intro_new_2", "2026-06-02T00:00:00.000Z");
assert(second.introductionId === formatIntroductionId(2026, 5), "never reuses introduction IDs");

let idCollision = false;
try {
  const tampered = {
    ...second.state,
    byIntroductionId: {
      ...second.state.byIntroductionId,
      [formatIntroductionId(2026, 6)]: "existing"
    },
    yearSequence: { ...second.state.yearSequence, 2026: 5 }
  };
  allocateIntroductionId(tampered, "intro_collision", "2026-06-04T00:00:00.000Z");
} catch (error) {
  idCollision = error instanceof Error && error.message.includes("already allocated");
}
assert(idCollision, "prevents duplicate ID allocation");

// Timeline integrity
const previous = { ...seed[0], history: [...seed[0].history] };
const next = {
  ...seed[0],
  history: [...seed[0].history, { id: "h2", at: "2026-01-11T00:00:00.000Z", label: "Presented" }]
};
assertIntroductionHistoryIntegrity(previous, next);

let historyShrinkBlocked = false;
try {
  assertIntroductionHistoryIntegrity(next, previous);
} catch (error) {
  historyShrinkBlocked = error instanceof Error && error.message.includes("cannot shrink");
}
assert(historyShrinkBlocked, "history cannot shrink");

let idChangeBlocked = false;
try {
  assertIntroductionHistoryIntegrity(previous, { ...next, introductionId: "BS-IN-2026-9999" });
} catch (error) {
  idChangeBlocked = error instanceof Error && error.message.includes("cannot change");
}
assert(idChangeBlocked, "introduction ID cannot change");

// Mutual acceptance
const pending = {
  id: "intro_pending",
  introductionId: "BS-IN-2026-0010",
  memberAId: memberA,
  memberBId: memberC,
  status: "presented",
  memberAApproved: true,
  memberBApproved: null,
  bothConsented: false,
  history: []
};

assert(!bothMembersConsented(pending), "single approval is not mutual consent");
assert(!canRevealCounterpart(pending), "counterpart hidden until mutual acceptance");

const afterA = { ...pending, history: [] };
recordIntroductionMemberApproval(afterA, memberA, true);
assert(!canRevealCounterpart(afterA), "still hidden after only member A accepts");

const afterBoth = { ...pending, history: [] };
recordIntroductionMemberApproval(afterBoth, memberA, true);
recordIntroductionMemberApproval(afterBoth, memberC, true);
assert(bothMembersConsented(afterBoth), "mutual acceptance recorded");
assert(canRevealCounterpart(afterBoth), "counterpart may be revealed after mutual acceptance");
assert(afterBoth.status === "active-conversation", "moves to active conversation after mutual acceptance");

// History persistence
const historyRecord = {
  id: "intro_hist",
  introductionId: "BS-IN-2026-0020",
  memberAId: memberA,
  memberBId: memberC,
  status: "pending-review",
  history: []
};
pushIntroductionHistory(historyRecord, { label: "Presented", pipelinePhase: "member-a-presented" });
pushIntroductionHistory(historyRecord, { label: "Accepted", pipelinePhase: "mutual-acceptance" });
assert(historyRecord.history.length === 2, "history entries persist in order");
assert(historyRecord.pipelinePhase === "mutual-acceptance", "pipeline phase updates with history");

// Cooldown enforcement
const cooldownSeed = [
  {
    id: "c1",
    introductionId: "BS-IN-2026-0101",
    memberAId: memberD,
    memberBId: memberA,
    status: "active-conversation",
    memberAApproved: true,
    memberBApproved: true
  },
  {
    id: "c2",
    introductionId: "BS-IN-2026-0102",
    memberAId: memberD,
    memberBId: memberB,
    status: "awaiting-response",
    memberAApproved: true,
    memberBApproved: null
  }
];
const cooldownSnapshot = getMemberCooldownSnapshot(cooldownSeed, memberD);
assert(cooldownSnapshot.activeCount === 2, "counts active introductions per member");
assert(cooldownSnapshot.blocked, "blocks when max active reached");

let cooldownBlocked = false;
try {
  assertIntroductionCooldown(cooldownSeed, memberD, memberC);
} catch (error) {
  cooldownBlocked = error instanceof Error && error.message.includes("Introduction cooldown");
}
assert(cooldownBlocked, "assertIntroductionCooldown throws when member at limit");

// Private candidate pools
const internalOnly = {
  id: "intro_internal",
  introductionId: "BS-IN-2026-0003",
  memberAId: memberD,
  memberBId: memberC,
  status: "compatibility-review",
  memberAApproved: null,
  memberBApproved: null,
  isInternalCandidate: true
};
assert(isInternalCandidateRecord(internalOnly), "internal candidate flagged");
assert(!isMemberVisibleIntroduction(internalOnly, memberC), "member cannot see internal candidate pool");
assert(!isMemberVisibleIntroduction(internalOnly, memberD), "member cannot see unrevealed internal review");

const afterPresented = {
  ...internalOnly,
  status: "presented",
  memberAApproved: true,
  memberBApproved: null,
  isInternalCandidate: false
};
assert(isMemberVisibleIntroduction(afterPresented, memberD), "member sees introduction once presented");

const memberView = filterMemberVisibleIntroductions([internalOnly, afterPresented, seed[0]], memberD);
assert(memberView.length === 1, "members only see presented introductions");
assert(memberView[0].memberAApproved === true, "presented introduction visible to member");
assert(!filterMemberVisibleIntroductions([internalOnly], memberC).length, "internal pool hidden from member view");

console.log("test-introduction-engine: all assertions passed");
