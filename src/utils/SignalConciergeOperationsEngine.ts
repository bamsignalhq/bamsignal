import { OPERATION_PIPELINE_STAGES, OPERATION_STAGE_LABELS } from "../constants/conciergeOperations";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConciergeOperation,
  OperationHealth,
  OperationStage,
  OperationStatus,
  OperationSummary,
  OperationTimelineEntry
} from "../types/conciergeOperations";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import { ensureMemberOperationId } from "./operationIdRegistry";
import { readJson, writeJson } from "./storage";

type ConciergeOperationsStore = {
  operations: Record<string, ConciergeOperation>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeOperationsStore;

const STAGE_INDEX = Object.fromEntries(
  OPERATION_PIPELINE_STAGES.map((stage, index) => [stage, index])
) as Record<OperationStage, number>;

function loadStore(): ConciergeOperationsStore {
  return readJson<ConciergeOperationsStore>(STORE_KEY, {
    operations: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: ConciergeOperationsStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function stageRank(stage: OperationStage): number {
  return STAGE_INDEX[stage] ?? 0;
}

function hasCompletedConsultation(member: ConciergeMemberRecord): boolean {
  return (
    member.communicationJournal.length > 0 ||
    (Boolean(member.consultationScheduledAt) &&
      !["applied", "consultation-scheduled"].includes(member.status))
  );
}

export function deriveOperationStageFromMember(member: ConciergeMemberRecord): OperationStage {
  const candidates: OperationStage[] = ["application-received"];

  if (member.status === "consultation-scheduled" || member.consultationScheduledAt) {
    candidates.push("consultation-scheduled");
  }
  if (hasCompletedConsultation(member)) {
    candidates.push("consultation-completed");
  }
  if (member.assignedConsultantId || member.currentConsultantId) {
    candidates.push("consultant-assignment");
  }
  if (member.status === "under-review") {
    candidates.push("application-review");
  }
  if (["accepted", "waitlisted", "active-search"].includes(member.status)) {
    candidates.push("approved");
  }
  if (member.status === "introductions-in-progress") {
    candidates.push("introduction-process");
  }
  if (["relationship", "matched", "exclusive", "engaged"].includes(member.status)) {
    candidates.push("relationship-follow-up");
  }
  if (member.status === "married" || member.journeyArchive?.relationshipStatus === "married") {
    candidates.push("marriage");
  }
  if (member.status === "legacy-archive" || member.journeyArchive?.isLegacyArchive) {
    candidates.push("legacy-archive");
  }

  return candidates.reduce((highest, stage) =>
    stageRank(stage) > stageRank(highest) ? stage : highest
  );
}

export function deriveOperationStatusFromMember(
  member: ConciergeMemberRecord,
  stage: OperationStage
): OperationStatus {
  if (member.status === "paused") return "paused";
  if (member.status === "legacy-archive" || member.status === "closed" || stage === "legacy-archive") {
    return "archived";
  }
  if (member.status === "married" || stage === "marriage") return "completed";
  if (member.status === "applied") return "pending";
  return "active";
}

export function deriveOperationHealth(
  member: ConciergeMemberRecord,
  status: OperationStatus,
  stage: OperationStage
): OperationHealth {
  if (status === "archived" || stage === "legacy-archive") return "archived";
  if (status === "completed" || stage === "marriage") return "completed";
  if (status === "paused") return "paused";

  const now = Date.now();
  const needsAttention =
    member.flags.some((flag) => flag === "high-priority" || flag === "sensitive-case") ||
    member.followUpTasks.some((task) => !task.completed && new Date(task.dueAt).getTime() < now);

  return needsAttention ? "requires-attention" : "healthy";
}

export function assertOperationTimelineIntegrity(
  previous: ConciergeOperation,
  next: ConciergeOperation
): void {
  if (next.timeline.length < previous.timeline.length) {
    throw new Error("Operation timeline cannot shrink");
  }
  if (next.operationId !== previous.operationId) {
    throw new Error("Operation ID cannot change");
  }
  if (next.memberId !== previous.memberId) {
    throw new Error("Operation member cannot change");
  }
  if (next.journeyId !== previous.journeyId) {
    throw new Error("Operation journey ID cannot change");
  }
}

function createTimelineEntry(
  stage: OperationStage,
  at: string,
  detail?: string,
  actorName?: string
): OperationTimelineEntry {
  return {
    id: `op_tl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at,
    stage,
    label: OPERATION_STAGE_LABELS[stage],
    detail,
    actorName
  };
}

function buildBootstrapTimeline(
  member: ConciergeMemberRecord,
  stage: OperationStage
): OperationTimelineEntry[] {
  const reached = OPERATION_PIPELINE_STAGES.filter((item) => stageRank(item) <= stageRank(stage));
  return reached.map((item, index) =>
    createTimelineEntry(
      item,
      member.timeline[index]?.at ?? member.createdAt,
      member.timeline[index]?.detail,
      member.assignedConsultantName
    )
  );
}

function appendStageIfAdvanced(
  operation: ConciergeOperation,
  nextStage: OperationStage,
  at: string,
  detail?: string,
  actorName?: string
): OperationTimelineEntry[] {
  if (stageRank(nextStage) <= stageRank(operation.currentStage)) {
    return operation.timeline;
  }
  const missingStages = OPERATION_PIPELINE_STAGES.filter(
    (stage) =>
      stageRank(stage) > stageRank(operation.currentStage) && stageRank(stage) <= stageRank(nextStage)
  );
  const additions = missingStages.map((stage) =>
    createTimelineEntry(stage, at, detail, actorName)
  );
  return [...operation.timeline, ...additions];
}

function memberToOperation(
  member: ConciergeMemberRecord,
  existing?: ConciergeOperation
): ConciergeOperation {
  const journeyId = ensureMemberJourneyId(member.id, member.createdAt, member.journeyId);
  const operationId = ensureMemberOperationId(
    member.id,
    member.createdAt,
    existing?.operationId
  );
  const currentStage = deriveOperationStageFromMember(member);
  const status = deriveOperationStatusFromMember(member, currentStage);
  const health = deriveOperationHealth(member, status, currentStage);
  const now = new Date().toISOString();

  const timeline = existing
    ? appendStageIfAdvanced(
        existing,
        currentStage,
        member.updatedAt,
        `Stage advanced to ${OPERATION_STAGE_LABELS[currentStage]}.`,
        member.assignedConsultantName
      )
    : buildBootstrapTimeline(member, currentStage);

  return {
    operationId,
    memberId: member.id,
    journeyId,
    memberName: member.aboutYou.name,
    status,
    currentStage,
    health,
    assignedConsultantId: member.currentConsultantId ?? member.assignedConsultantId,
    assignedConsultantName: member.assignedConsultantName,
    timeline,
    createdAt: existing?.createdAt ?? member.createdAt,
    updatedAt: now
  };
}

export function syncConciergeOperationsFromMembers(): ConciergeOperation[] {
  const store = loadStore();
  const members = listConciergeMembers();
  const nextOperations = { ...store.operations };

  for (const member of members) {
    const existing = Object.values(store.operations).find((op) => op.memberId === member.id);
    const next = memberToOperation(member, existing);
    if (existing) assertOperationTimelineIntegrity(existing, next);
    nextOperations[next.operationId] = next;
  }

  saveStore({ operations: nextOperations, updatedAt: new Date().toISOString() });
  return listConciergeOperations();
}

function ensureStoreHydrated(): ConciergeOperationsStore {
  const store = loadStore();
  if (Object.keys(store.operations).length) return store;
  syncConciergeOperationsFromMembers();
  return loadStore();
}

export function listConciergeOperations(): ConciergeOperation[] {
  const store = ensureStoreHydrated();
  return Object.values(store.operations).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function getConciergeOperation(operationId: string): ConciergeOperation | null {
  const store = ensureStoreHydrated();
  return (
    Object.values(store.operations).find(
      (operation) =>
        operation.operationId === operationId || operation.memberId === operationId
    ) ?? null
  );
}

export function getConciergeOperationForMember(memberId: string): ConciergeOperation | null {
  const store = ensureStoreHydrated();
  return Object.values(store.operations).find((operation) => operation.memberId === memberId) ?? null;
}

export function buildOperationSummary(operation: ConciergeOperation): OperationSummary {
  const lastEntry = operation.timeline[operation.timeline.length - 1];
  return {
    operationId: operation.operationId,
    memberName: operation.memberName,
    journeyId: operation.journeyId,
    currentStage: operation.currentStage,
    status: operation.status,
    health: operation.health,
    assignedConsultantName: operation.assignedConsultantName,
    lastTimelineLabel: lastEntry?.label,
    lastTimelineAt: lastEntry?.at
  };
}

export function listOperationSummaries(): OperationSummary[] {
  return listConciergeOperations().map((operation) => buildOperationSummary(operation));
}

export function refreshConciergeOperation(memberId: string): ConciergeOperation | null {
  const member = listConciergeMembers().find((item) => item.id === memberId);
  if (!member) return null;

  const store = loadStore();
  const existing = Object.values(store.operations).find((op) => op.memberId === memberId);
  const next = memberToOperation(member, existing);
  if (existing) assertOperationTimelineIntegrity(existing, next);

  saveStore({
    operations: { ...store.operations, [next.operationId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function resetConciergeOperationsStoreForTests(): void {
  writeJson(STORE_KEY, { operations: {}, updatedAt: new Date().toISOString() });
}
