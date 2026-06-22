import { STORAGE_KEYS } from "../constants/limits";
import { CONCIERGE_CONSULTANT_SEED } from "../data/conciergeConsultantSeed";
import type {
  ConciergeMemberFilters,
  ConciergeMemberRecord,
  ConciergePrivateNote,
  ConciergeStewardshipTransfer,
  ConciergeTimelineEvent
} from "../types/conciergeConsultant";
import { CONCIERGE_MEMBER_OWNERSHIP } from "../constants/conciergeMemberOwnership";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import { normalizeConciergeMember, stampTimelineJourneyId } from "./conciergeMemberStewardship";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import { bootstrapJourneyRegistry } from "./conciergeJourneyRegistry";
import { bootstrapSuccessStoryConsentSeeds } from "./conciergeSuccessStoryConsentStore";
import { CONCIERGE_SUCCESS_STORY_CONSENT_SEED } from "../data/conciergeSuccessStoryConsentSeed";
import { bootstrapJourneyStoryProfileSeeds } from "./journeyStoryCategories";
import { CONCIERGE_JOURNEY_STORY_PROFILE_SEED } from "../data/conciergeJourneyStoryProfileSeed";
import { bootstrapJourneyMilestoneSeeds } from "./journeyMilestoneStore";
import { CONCIERGE_JOURNEY_MILESTONE_SEED } from "../data/conciergeJourneyMilestoneSeed";
import { bootstrapRelationshipLegacyIndexSeeds } from "./relationshipLegacyIndexStore";
import { CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED } from "../data/conciergeRelationshipLegacyIndexSeed";
import { assertNoArchiveDeletion, registerArchivedMember } from "./conciergeJourneyArchive";
import { isValidJourneyId, normalizeJourneyId } from "../constants/journeyId";
import { marriageYearFromMember } from "./conciergeJourneyArchive";
import { readJson, writeJson } from "./storage";

const ADMIN_STORE_KEY = "bamsignal-concierge-consultant-store";

type ConciergeConsultantStore = {
  members: ConciergeMemberRecord[];
  updatedAt: string;
};

function ensureJourneyRegistrySeeded(): void {
  bootstrapJourneyRegistry(
    CONCIERGE_CONSULTANT_SEED.filter((member) => member.journeyId).map((member) => ({
      memberId: member.id,
      journeyId: member.journeyId!,
      assignedAt: member.createdAt
    }))
  );
  bootstrapSuccessStoryConsentSeeds(CONCIERGE_SUCCESS_STORY_CONSENT_SEED);
  bootstrapJourneyStoryProfileSeeds(CONCIERGE_JOURNEY_STORY_PROFILE_SEED);
  bootstrapJourneyMilestoneSeeds(CONCIERGE_JOURNEY_MILESTONE_SEED);
  bootstrapRelationshipLegacyIndexSeeds(CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED);
}

function loadStore(): ConciergeConsultantStore {
  ensureJourneyRegistrySeeded();
  const stored = readJson<ConciergeConsultantStore | null>(ADMIN_STORE_KEY, null);
  if (stored?.members?.length) {
    const members = stored.members.map((member) => {
      const normalized = normalizeConciergeMember(member);
      if (normalized.journeyArchive?.isLegacyArchive) {
        registerArchivedMember(normalized.id);
      }
      return normalized;
    });
    return { ...stored, members };
  }
  const initial: ConciergeConsultantStore = {
    members: CONCIERGE_CONSULTANT_SEED.map((member) => {
      const normalized = normalizeConciergeMember(member);
      if (normalized.journeyArchive?.isLegacyArchive) {
        registerArchivedMember(normalized.id);
      }
      return normalized;
    }),
    updatedAt: new Date().toISOString()
  };
  writeJson(ADMIN_STORE_KEY, initial);
  return initial;
}

function saveStore(store: ConciergeConsultantStore): void {
  writeJson(ADMIN_STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

export function listConciergeMembers(): ConciergeMemberRecord[] {
  return loadStore().members.map((member) => normalizeConciergeMember(member));
}

export function getConciergeMember(memberId: string): ConciergeMemberRecord | null {
  return listConciergeMembers().find((member) => member.id === memberId) ?? null;
}

export function updateConciergeMember(
  memberId: string,
  patch: Partial<ConciergeMemberRecord>
): ConciergeMemberRecord | null {
  const store = loadStore();
  const index = store.members.findIndex((member) => member.id === memberId);
  if (index < 0) return null;
  const previous = store.members[index];
  const next = {
    ...previous,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  assertNoArchiveDeletion(previous, next);
  store.members[index] = next;
  saveStore(store);
  return normalizeConciergeMember(next);
}

export function addConciergePrivateNote(
  memberId: string,
  body: string,
  consultantId = "consultant_ada"
): ConciergePrivateNote | null {
  const member = getConciergeMember(memberId);
  if (!member) return null;
  const note: ConciergePrivateNote = {
    id: `note_${Date.now().toString(36)}`,
    memberId,
    consultantId,
    body: body.trim(),
    createdAt: new Date().toISOString()
  };
  updateConciergeMember(memberId, {
    privateNotes: [note, ...member.privateNotes]
  });
  return note;
}

export function filterConciergeMembers(
  members: ConciergeMemberRecord[],
  filters: ConciergeMemberFilters
): ConciergeMemberRecord[] {
  const query = filters.query.trim().toLowerCase();
  const ageMin = filters.ageMin ? Number(filters.ageMin) : null;
  const ageMax = filters.ageMax ? Number(filters.ageMax) : null;

  return members.filter((member) => {
    if (filters.status !== "all" && member.status !== filters.status) return false;
    if (filters.tier !== "all" && member.preferredTier !== filters.tier) return false;
    if (
      filters.consultant &&
      !(member.assignedConsultantName ?? "")
        .toLowerCase()
        .includes(filters.consultant.toLowerCase())
    ) {
      return false;
    }
    if (filters.diaspora && !member.flags.includes("diaspora")) return false;
    if (filters.relocation && !member.flags.includes("relocation")) return false;
    if (filters.city && !member.aboutYou.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    if (
      filters.religion &&
      !member.aboutYou.religion.toLowerCase().includes(filters.religion.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.childrenPreference &&
      !member.aboutYou.children.toLowerCase().includes(filters.childrenPreference.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.relationshipGoal &&
      !`${member.relationshipGoals.marriageTimeline} ${member.relationshipGoals.whatHopingToFind || member.relationshipGoals.partnerPreferences || ""} ${member.relationshipGoals.childrenPreference || member.relationshipGoals.familyGoals || ""}`
        .toLowerCase()
        .includes(filters.relationshipGoal.toLowerCase())
    ) {
      return false;
    }
    const age = Number(member.aboutYou.age);
    if (ageMin !== null && !Number.isNaN(age) && age < ageMin) return false;
    if (ageMax !== null && !Number.isNaN(age) && age > ageMax) return false;
    if (filters.archiveStatus !== "all") {
      const relationshipStatus = member.journeyArchive?.relationshipStatus;
      if (relationshipStatus !== filters.archiveStatus) return false;
    }
    if (filters.marriageYear) {
      const year = marriageYearFromMember(member);
      if (!year || String(year) !== filters.marriageYear.trim()) return false;
    }
    if (!query) return true;
    const normalizedQuery = isValidJourneyId(query) ? normalizeJourneyId(query) : query;
    const haystack = [
      member.journeyId ?? "",
      member.aboutYou.name,
      member.aboutYou.city,
      member.aboutYou.occupation,
      member.assignedConsultantName ?? "",
      SIGNAL_CONCIERGE_STATUS_LABELS[member.status] ?? member.status
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery.toLowerCase());
  });
}

export function applyMemberStewardship(
  memberId: string,
  input: {
    consultantId: string;
    consultantName: string;
    assignedBy: string;
    isReassignment: boolean;
    transfer?: Omit<ConciergeStewardshipTransfer, "id">;
  }
): ConciergeMemberRecord | null {
  const member = getConciergeMember(memberId);
  if (!member) return null;
  const now = new Date().toISOString();
  const transferRecord: ConciergeStewardshipTransfer | undefined = input.transfer
    ? { ...input.transfer, id: `st_${Date.now().toString(36)}` }
    : input.isReassignment
      ? {
          id: `st_${Date.now().toString(36)}`,
          fromConsultantId: member.currentConsultantId ?? member.assignedConsultantId,
          fromConsultantName: member.assignedConsultantName,
          toConsultantId: input.consultantId,
          toConsultantName: input.consultantName,
          transferredBy: input.assignedBy,
          transferredAt: now,
          note: "Steward transition"
        }
      : undefined;

  return updateConciergeMember(memberId, {
    ownership: CONCIERGE_MEMBER_OWNERSHIP,
    currentConsultantId: input.consultantId,
    assignedConsultantId: input.consultantId,
    assignedConsultantName: input.consultantName,
    assignedBy: input.isReassignment ? member.assignedBy : input.assignedBy,
    assignedAt: input.isReassignment ? member.assignedAt : now,
    reassignedAt: input.isReassignment ? now : member.reassignedAt,
    stewardshipHistory: transferRecord
      ? [transferRecord, ...(member.stewardshipHistory ?? [])]
      : member.stewardshipHistory ?? []
  });
}

/** Merge locally submitted member applications into consultant store when present. */
export function syncLocalConciergeApplication(): void {
  const application = readJson<ConciergeMemberRecord | null>(
    STORAGE_KEYS.signalConciergeApplication,
    null
  );
  if (!application?.id || !application.aboutYou?.name) return;

  const store = loadStore();
  const exists = store.members.some((member) => member.id === application.id);
  if (exists) return;

  const journeyId = ensureMemberJourneyId(application.id, application.createdAt, application.journeyId);
  const timelineEvent: ConciergeTimelineEvent = {
    id: `tl_${Date.now().toString(36)}`,
    memberId: application.id,
    journeyId,
    type: "application-received",
    label: "Application received",
    at: application.createdAt
  };

  const record: ConciergeMemberRecord = normalizeConciergeMember({
    ...application,
    journeyId,
    photos: [],
    trustedMember: false,
    ownership: CONCIERGE_MEMBER_OWNERSHIP,
    flags: [],
    stewardshipHistory: [],
    communicationJournal: [],
    privateNotes: [],
    timeline: stampTimelineJourneyId([timelineEvent], journeyId),
    introductions: [],
    followUpTasks: []
  });
  store.members.unshift(record);
  saveStore(store);
}
