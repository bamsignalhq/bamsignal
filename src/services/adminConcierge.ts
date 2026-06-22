import type {
  ConciergeMemberFilters,
  ConciergeMemberRecord
} from "../types/conciergeConsultant";
import {
  addConciergePrivateNote,
  filterConciergeMembers,
  getConciergeMember,
  listConciergeMembers,
  syncLocalConciergeApplication,
  updateConciergeMember
} from "../utils/conciergeConsultantStore";
import type { JourneyArchiveFilters } from "../constants/conciergeJourneyArchive";
import type { LegacyIndexFilters } from "../constants/relationshipLegacyIndex";
import {
  filterMembersForArchiveSearch,
  listArchiveEligibleMembers
} from "../utils/conciergeJourneyArchive";
import {
  filterLegacyIndexMembers,
  isLegacyIndexEligible
} from "../utils/relationshipLegacyIndexLogic";
import { getRelationshipLegacyIndexMap } from "../utils/relationshipLegacyIndexStore";
import { getJourneyStoryProfile } from "../utils/journeyStoryCategories";
import { ensureConciergePersistenceHydrated } from "./conciergeSupabase";

export type AdminConciergeMembersResult = {
  ok: boolean;
  members: ConciergeMemberRecord[];
};

export async function fetchAdminConciergeMembers(
  filters: ConciergeMemberFilters
): Promise<AdminConciergeMembersResult> {
  await ensureConciergePersistenceHydrated();
  syncLocalConciergeApplication();
  const members = filterConciergeMembers(listConciergeMembers(), filters);
  return { ok: true, members };
}

export async function fetchAdminConciergeArchiveMembers(
  filters: JourneyArchiveFilters
): Promise<AdminConciergeMembersResult> {
  await ensureConciergePersistenceHydrated();
  syncLocalConciergeApplication();
  const members = filterMembersForArchiveSearch(listArchiveEligibleMembers(listConciergeMembers()), filters);
  return { ok: true, members };
}

export async function fetchAdminConciergeLegacyIndexMembers(
  filters: LegacyIndexFilters
): Promise<AdminConciergeMembersResult> {
  await ensureConciergePersistenceHydrated();
  syncLocalConciergeApplication();
  const allMembers = listConciergeMembers().filter(isLegacyIndexEligible);
  const indexByJourneyId = getRelationshipLegacyIndexMap();
  const storyCategoriesByJourneyId = Object.fromEntries(
    allMembers
      .filter((member) => member.journeyId)
      .map((member) => [
        member.journeyId!,
        getJourneyStoryProfile(member.journeyId!)?.categories ??
          member.successStoryConsent?.storyCategories ??
          []
      ])
  );
  const members = filterLegacyIndexMembers(
    allMembers,
    filters,
    indexByJourneyId,
    storyCategoriesByJourneyId
  );
  return { ok: true, members };
}

export async function fetchAdminConciergeMember(
  memberId: string
): Promise<{ ok: boolean; member: ConciergeMemberRecord | null }> {
  await ensureConciergePersistenceHydrated();
  syncLocalConciergeApplication();
  return { ok: true, member: getConciergeMember(memberId) };
}

export async function saveAdminConciergeMemberNote(
  memberId: string,
  body: string
): Promise<{ ok: boolean }> {
  const note = addConciergePrivateNote(memberId, body);
  return { ok: Boolean(note) };
}

export async function saveAdminConciergeMemberStatus(
  memberId: string,
  status: ConciergeMemberRecord["status"]
): Promise<{ ok: boolean }> {
  const member = updateConciergeMember(memberId, { status });
  return { ok: Boolean(member) };
}

export async function fetchAdminConciergeConsultants() {
  const { listConciergeConsultants } = await import("../utils/conciergeConsultantDirectoryStore");
  return { ok: true, consultants: listConciergeConsultants() };
}

export async function fetchAdminConciergeConsultantPerformance(consultantId: string) {
  const {
    getConciergeConsultant,
    listConciergeConsultantActivity,
    listConciergeConsultantMeetings,
    listMembersForConsultant
  } = await import("../utils/conciergeConsultantDirectoryStore");
  const { buildConsultantPerformanceScorecard } = await import(
    "../utils/consultantPerformanceScorecardLogic"
  );
  syncLocalConciergeApplication();
  const consultant = getConciergeConsultant(consultantId);
  const members = listMembersForConsultant(consultantId);
  const activity = listConciergeConsultantActivity(consultantId);
  const meetings = listConciergeConsultantMeetings(consultantId);
  const scorecard = consultant
    ? buildConsultantPerformanceScorecard({
        consultantId,
        consultantName: consultant.name,
        members,
        activity,
        meetings
      })
    : null;
  return { ok: Boolean(consultant), scorecard, members, activity, meetings };
}

export async function fetchAdminConciergeConsultantPortfolio(consultantId: string) {
  const {
    getConciergeConsultant,
    listConciergeConsultantActivity,
    listConciergeConsultantMeetings,
    listMembersForConsultant
  } = await import("../utils/conciergeConsultantDirectoryStore");
  const { computeConsultantMetrics } = await import("../utils/conciergeConsultantMetrics");
  syncLocalConciergeApplication();
  const consultant = getConciergeConsultant(consultantId);
  const members = listMembersForConsultant(consultantId);
  const activity = listConciergeConsultantActivity(consultantId);
  const meetings = listConciergeConsultantMeetings(consultantId);
  const metrics = computeConsultantMetrics(members);
  return {
    ok: Boolean(consultant),
    consultant,
    members,
    activity,
    meetings,
    metrics
  };
}

export async function inviteAdminConciergeConsultant(input: {
  name: string;
  email: string;
}) {
  const { inviteConciergeConsultant } = await import("../utils/conciergeConsultantDirectoryStore");
  const consultant = inviteConciergeConsultant(input);
  return { ok: Boolean(consultant), consultant };
}

export async function setAdminConciergeConsultantStatus(
  consultantId: string,
  status: import("../types/conciergeConsultantDirectory").ConciergeConsultantStatus
) {
  const { setConciergeConsultantStatus } = await import("../utils/conciergeConsultantDirectoryStore");
  const consultant = setConciergeConsultantStatus(consultantId, status);
  return { ok: Boolean(consultant), consultant };
}

export async function assignAdminConciergeMember(
  memberId: string,
  consultantId: string
) {
  const { assignMemberToConsultant } = await import("../utils/conciergeConsultantDirectoryStore");
  const member = assignMemberToConsultant(memberId, consultantId);
  return { ok: Boolean(member), member };
}

export async function journeyTransitionAdminMember(
  memberId: string,
  consultantId: string,
  reason?: string
) {
  const { journeyTransitionMember } = await import("../utils/conciergeConsultantDirectoryStore");
  const member = journeyTransitionMember(memberId, consultantId, reason);
  return { ok: Boolean(member), member };
}

export async function executeAdminConsultantExitProtocol(input: {
  consultantId: string;
  reason?: string;
  successorConsultantId?: string;
}) {
  const { executeConsultantExitProtocol } = await import(
    "../utils/conciergeConsultantDirectoryStore"
  );
  return executeConsultantExitProtocol(input);
}

export async function transferAdminConciergeMember(
  memberId: string,
  consultantId: string
) {
  const { transferMemberToConsultant } = await import("../utils/conciergeConsultantDirectoryStore");
  const member = transferMemberToConsultant(memberId, consultantId);
  return { ok: Boolean(member), member };
}

export async function fetchAdminConciergeMemberActivity(memberId: string) {
  const { listMemberActivity } = await import("../utils/conciergeConsultantDirectoryStore");
  return { ok: true, activity: listMemberActivity(memberId) };
}

export async function transferAdminConciergePortfolio(
  fromConsultantId: string,
  toConsultantId: string
) {
  const { transferConsultantPortfolio } = await import("../utils/conciergeConsultantDirectoryStore");
  const result = transferConsultantPortfolio(fromConsultantId, toConsultantId);
  return { ok: result.transferred > 0, ...result };
}

export async function assignAdminConciergeConsultantRoles(
  consultantId: string,
  roles: import("../constants/conciergeConsultantRoles").ConciergeConsultantRoleId[],
  primaryRole?: import("../constants/conciergeConsultantRoles").ConciergeConsultantRoleId
) {
  const { assignConciergeConsultantRoles } = await import("../utils/conciergeConsultantDirectoryStore");
  const consultant = assignConciergeConsultantRoles(consultantId, roles, primaryRole);
  return { ok: Boolean(consultant), consultant };
}

export {
  createIntroductionCandidate,
  getIntroductionEngineSnapshot,
  listIntroductionHistory,
  listIntroductionsForMember,
  listPendingIntroductions
} from "../utils/IntroductionEngine";
