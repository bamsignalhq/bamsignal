import {
  CONCIERGE_ACTIVITY_SEED,
  CONCIERGE_DIRECTORY_SEED,
  CONCIERGE_MEETINGS_SEED
} from "../data/conciergeConsultantDirectorySeed";
import type {
  ConciergeConsultantActivity,
  ConciergeConsultantDirectoryStore,
  ConciergeConsultantRecord,
  ConciergeConsultantStatus,
  ConciergeScheduledMeeting
} from "../types/conciergeConsultantDirectory";
import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";
import { CONCIERGE_CONSULTANT_DEFAULT_ROLE } from "../constants/conciergeConsultantRoles";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import {
  getConciergeMember,
  listConciergeMembers,
  applyMemberStewardship
} from "./conciergeConsultantStore";
import { journeyTransitionMessage } from "./conciergeJourneyContinuity";
import { readJson, writeJson } from "./storage";

const DIRECTORY_STORE_KEY = "bamsignal-concierge-consultant-directory";

function loadDirectoryStore(): ConciergeConsultantDirectoryStore {
  const stored = readJson<ConciergeConsultantDirectoryStore | null>(DIRECTORY_STORE_KEY, null);
  if (stored?.consultants?.length) return stored;
  const initial: ConciergeConsultantDirectoryStore = {
    consultants: CONCIERGE_DIRECTORY_SEED,
    activity: CONCIERGE_ACTIVITY_SEED,
    meetings: CONCIERGE_MEETINGS_SEED,
    updatedAt: new Date().toISOString()
  };
  writeJson(DIRECTORY_STORE_KEY, initial);
  return initial;
}

function saveDirectoryStore(store: ConciergeConsultantDirectoryStore): void {
  writeJson(DIRECTORY_STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function appendActivity(
  store: ConciergeConsultantDirectoryStore,
  event: Omit<ConciergeConsultantActivity, "id" | "at"> & { at?: string }
): ConciergeConsultantActivity {
  const entry: ConciergeConsultantActivity = {
    ...event,
    id: `act_${Date.now().toString(36)}`,
    at: event.at ?? new Date().toISOString()
  };
  store.activity.unshift(entry);
  return entry;
}

export function listConciergeConsultants(): ConciergeConsultantRecord[] {
  return loadDirectoryStore().consultants;
}

export function getConciergeConsultant(consultantId: string): ConciergeConsultantRecord | null {
  return listConciergeConsultants().find((consultant) => consultant.id === consultantId) ?? null;
}

export function listConciergeConsultantActivity(
  consultantId?: string
): ConciergeConsultantActivity[] {
  const activity = loadDirectoryStore().activity;
  if (!consultantId) return [...activity].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return activity
    .filter((item) => item.consultantId === consultantId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function listConciergeConsultantMeetings(consultantId: string): ConciergeScheduledMeeting[] {
  return loadDirectoryStore()
    .meetings.filter((meeting) => meeting.consultantId === consultantId)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export function listMeetingsForMember(memberId: string): ConciergeScheduledMeeting[] {
  return loadDirectoryStore()
    .meetings.filter((meeting) => meeting.memberId === memberId)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

export function listMembersForConsultant(consultantId: string): ConciergeMemberRecord[] {
  return listConciergeMembers().filter(
    (member) => (member.currentConsultantId ?? member.assignedConsultantId) === consultantId
  );
}

export function listMemberActivity(memberId: string): ConciergeConsultantActivity[] {
  return loadDirectoryStore()
    .activity.filter((item) => item.memberId === memberId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function inviteConciergeConsultant(input: {
  name: string;
  email: string;
  roles?: ConciergeConsultantRoleId[];
}): ConciergeConsultantRecord | null {
  const store = loadDirectoryStore();
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !email) return null;
  if (store.consultants.some((consultant) => consultant.email.toLowerCase() === email)) return null;

  const roles = input.roles?.length ? input.roles : [CONCIERGE_CONSULTANT_DEFAULT_ROLE];
  const consultant: ConciergeConsultantRecord = {
    id: `consultant_${Date.now().toString(36)}`,
    name: input.name.trim(),
    email,
    status: "invited",
    roles,
    primaryRole: roles[0],
    tierFocus: [],
    invitedAt: new Date().toISOString(),
    memberOwnershipPolicy: "bamsignal",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.consultants.unshift(consultant);
  appendActivity(store, {
    consultantId: consultant.id,
    consultantName: consultant.name,
    type: "consultant-invited",
    label: "Consultant invited",
    detail: `Invitation sent to ${consultant.email}`,
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin"
  });
  saveDirectoryStore(store);
  return consultant;
}

export function setConciergeConsultantStatus(
  consultantId: string,
  status: ConciergeConsultantStatus
): ConciergeConsultantRecord | null {
  const store = loadDirectoryStore();
  const index = store.consultants.findIndex((consultant) => consultant.id === consultantId);
  if (index < 0) return null;
  const current = store.consultants[index];
  const now = new Date().toISOString();
  const next: ConciergeConsultantRecord = {
    ...current,
    status,
    updatedAt: now,
    activatedAt: status === "active" ? current.activatedAt ?? now : current.activatedAt,
    frozenAt: status === "frozen" ? now : status === "active" ? undefined : current.frozenAt
  };
  store.consultants[index] = next;

  const activityType =
    status === "active"
      ? "consultant-activated"
      : status === "frozen"
        ? "consultant-frozen"
        : status === "inactive"
          ? "consultant-deactivated"
          : null;

  if (activityType) {
    appendActivity(store, {
      consultantId: next.id,
      consultantName: next.name,
      type: activityType,
      label:
        activityType === "consultant-activated"
          ? "Consultant activated"
          : activityType === "consultant-frozen"
            ? "Consultant access frozen"
            : "Consultant deactivated",
      actorId: "admin_ops",
      actorName: "BamSignal Admin",
      actorRole: "admin"
    });
  }

  saveDirectoryStore(store);
  return next;
}

export function assignConciergeConsultantRoles(
  consultantId: string,
  roles: ConciergeConsultantRoleId[],
  primaryRole?: ConciergeConsultantRoleId
): ConciergeConsultantRecord | null {
  const store = loadDirectoryStore();
  const index = store.consultants.findIndex((consultant) => consultant.id === consultantId);
  if (index < 0 || !roles.length) return null;
  const current = store.consultants[index];
  const nextPrimary = primaryRole && roles.includes(primaryRole) ? primaryRole : roles[0];
  const next: ConciergeConsultantRecord = {
    ...current,
    roles,
    primaryRole: nextPrimary,
    updatedAt: new Date().toISOString()
  };
  store.consultants[index] = next;
  appendActivity(store, {
    consultantId: next.id,
    consultantName: next.name,
    type: "relationship-update",
    label: "Roles updated",
    changes: `Roles: ${roles.join(", ")} · Primary: ${nextPrimary}`,
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin"
  });
  saveDirectoryStore(store);
  return next;
}

export function assignMemberToConsultant(
  memberId: string,
  consultantId: string,
  actor: { id: string; name: string; role: "admin" | "consultant" } = {
    id: "admin_ops",
    name: "BamSignal Admin",
    role: "admin"
  }
): ConciergeMemberRecord | null {
  const consultant = getConciergeConsultant(consultantId);
  const member = getConciergeMember(memberId);
  if (!consultant || !member) return null;

  const previousConsultantName = member.assignedConsultantName;
  const isReassignment = Boolean(previousConsultantName);
  const updated = applyMemberStewardship(memberId, {
    consultantId: consultant.id,
    consultantName: consultant.name,
    assignedBy: actor.name,
    isReassignment
  });
  if (!updated) return null;

  const store = loadDirectoryStore();
  appendActivity(store, {
    consultantId: consultant.id,
    consultantName: consultant.name,
    memberId: member.id,
    memberName: member.aboutYou.name,
    type: previousConsultantName ? "member-reassigned" : "member-assigned",
    label: previousConsultantName ? "Member reassigned" : "Member assigned",
    detail: `Assigned to ${consultant.name}`,
    changes: previousConsultantName
      ? `Consultant: ${previousConsultantName} → ${consultant.name}`
      : undefined,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role
  });
  saveDirectoryStore(store);
  return updated;
}

export function journeyTransitionMember(
  memberId: string,
  toConsultantId: string,
  reason = "Continuity support — steward transition"
): ConciergeMemberRecord | null {
  const member = getConciergeMember(memberId);
  const consultant = getConciergeConsultant(toConsultantId);
  if (!member || !consultant) return null;

  const fromName = member.assignedConsultantName;
  const fromId = member.currentConsultantId ?? member.assignedConsultantId;
  const now = new Date().toISOString();

  const updated = applyMemberStewardship(memberId, {
    consultantId: consultant.id,
    consultantName: consultant.name,
    assignedBy: "BamSignal Admin",
    isReassignment: true,
    transfer: {
      fromConsultantId: fromId,
      fromConsultantName: fromName,
      toConsultantId: consultant.id,
      toConsultantName: consultant.name,
      transferredBy: "BamSignal Admin",
      transferredAt: now,
      reason,
      kind: "journey-transition",
      note: journeyTransitionMessage(fromName, consultant.name)
    }
  });
  if (!updated) return null;

  const store = loadDirectoryStore();
  appendActivity(store, {
    consultantId: consultant.id,
    consultantName: consultant.name,
    memberId: member.id,
    memberName: member.aboutYou.name,
    type: "journey-transition",
    label: "Journey transition",
    detail: journeyTransitionMessage(fromName, consultant.name),
    changes: fromName ? `Steward: ${fromName} → ${consultant.name}` : undefined,
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin"
  });
  saveDirectoryStore(store);
  return updated;
}

export function transferMemberToConsultant(
  memberId: string,
  toConsultantId: string,
  reason?: string
): ConciergeMemberRecord | null {
  return journeyTransitionMember(
    memberId,
    toConsultantId,
    reason ?? "Continuity support — full journey preserved"
  );
}

export function logConciergeConsultantActivity(
  event: Omit<ConciergeConsultantActivity, "id" | "at"> & { at?: string }
): ConciergeConsultantActivity {
  const store = loadDirectoryStore();
  const entry = appendActivity(store, event);
  saveDirectoryStore(store);
  return entry;
}

export function transferConsultantPortfolio(
  fromConsultantId: string,
  toConsultantId: string
): { transferred: number; members: ConciergeMemberRecord[] } {
  const from = getConciergeConsultant(fromConsultantId);
  const to = getConciergeConsultant(toConsultantId);
  if (!from || !to) return { transferred: 0, members: [] };

  const members = listMembersForConsultant(fromConsultantId);
  const updatedMembers: ConciergeMemberRecord[] = [];

  for (const member of members) {
    const updated = journeyTransitionMember(
      member.id,
      toConsultantId,
      `Portfolio journey transition from ${from.name} — continuity preserved`
    );
    if (updated) updatedMembers.push(updated);
  }

  if (updatedMembers.length) {
    const store = loadDirectoryStore();
    appendActivity(store, {
      consultantId: toConsultantId,
      consultantName: to.name,
      type: "portfolio-transferred",
      label: "Journey transitions completed",
      detail: `${updatedMembers.length} relationship journey${updatedMembers.length === 1 ? "" : "s"} transitioned from ${from.name}`,
      changes: `Steward portfolio: ${from.name} → ${to.name}`,
      actorId: "admin_ops",
      actorName: "BamSignal Admin",
      actorRole: "admin"
    });
    saveDirectoryStore(store);
  }

  return { transferred: updatedMembers.length, members: updatedMembers };
}

export function promoteConciergeConsultant(
  consultantId: string,
  primaryRole: ConciergeConsultantRoleId
): ConciergeConsultantRecord | null {
  const consultant = getConciergeConsultant(consultantId);
  if (!consultant) return null;
  const roles = consultant.roles.includes(primaryRole)
    ? consultant.roles
    : [primaryRole, ...consultant.roles];
  const updated = assignConciergeConsultantRoles(consultantId, roles, primaryRole);
  if (!updated) return null;

  const store = loadDirectoryStore();
  appendActivity(store, {
    consultantId,
    consultantName: updated.name,
    type: "consultant-promoted",
    label: "Consultant promoted",
    detail: `Primary role updated to ${primaryRole}`,
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin"
  });
  saveDirectoryStore(store);
  return updated;
}

export function executeConsultantExitProtocol(input: {
  consultantId: string;
  reason?: string;
  successorConsultantId?: string;
}): {
  consultant: ConciergeConsultantRecord | null;
  portfolioFrozen: boolean;
  journeysTransitioned: number;
} {
  const store = loadDirectoryStore();
  const index = store.consultants.findIndex((c) => c.id === input.consultantId);
  if (index < 0) {
    return { consultant: null, portfolioFrozen: false, journeysTransitioned: 0 };
  }

  const current = store.consultants[index];
  const now = new Date().toISOString();
  const reason = input.reason?.trim() || "Consultant exit — continuity protocol initiated";

  store.consultants[index] = {
    ...current,
    status: "inactive",
    portfolioFrozen: true,
    frozenAt: current.frozenAt ?? now,
    exitProtocolAt: now,
    updatedAt: now
  };

  appendActivity(store, {
    consultantId: current.id,
    consultantName: current.name,
    type: "consultant-exit",
    label: "Consultant exit protocol",
    detail: reason,
    changes: "Access frozen · Portfolio frozen · Knowledge preserved",
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin"
  });

  appendActivity(store, {
    consultantId: current.id,
    consultantName: current.name,
    type: "portfolio-frozen",
    label: "Portfolio frozen",
    detail: "Awaiting admin review and journey transitions",
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin"
  });

  saveDirectoryStore(store);

  let journeysTransitioned = 0;
  if (input.successorConsultantId) {
    const result = transferConsultantPortfolio(input.consultantId, input.successorConsultantId);
    journeysTransitioned = result.transferred;

    if (journeysTransitioned > 0) {
      const refreshedStore = loadDirectoryStore();
      const refreshedIndex = refreshedStore.consultants.findIndex((c) => c.id === input.consultantId);
      if (refreshedIndex >= 0) {
        refreshedStore.consultants[refreshedIndex] = {
          ...refreshedStore.consultants[refreshedIndex],
          portfolioFrozen: false,
          updatedAt: new Date().toISOString()
        };
        saveDirectoryStore(refreshedStore);
      }
    }
  }

  return {
    consultant: getConciergeConsultant(input.consultantId),
    portfolioFrozen: journeysTransitioned === 0,
    journeysTransitioned
  };
}
