import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../constants/conciergeConsultantRoles";
import {
  REGIONAL_CONSULTANT_REGION_ASSIGNMENTS,
  REGIONAL_CONSULTANT_TEAM_REGIONS,
  REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS,
  REGIONAL_TEAM_ROLE_LABELS,
  type RegionalTeamId,
  type RegionalTeamRoleId
} from "../constants/regionalConsultantTeams";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type {
  RegionalAssignmentRow,
  RegionalConsultantTeamsBundle,
  RegionalCoverageRow,
  RegionalTeamDirector,
  RegionalTeamMember,
  RegionalTeamMetrics,
  RegionalTeamSnapshot,
  RegionalTeamWorkloadRow
} from "../types/regionalConsultantTeams";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";
import {
  portfolioIntroductionsInProgress,
  portfolioPendingConsultations
} from "./conciergeConsultantMetrics";
import { deriveWorkloadHealth } from "./consultantWorkloadEngine";

const LAGOS_CITIES = new Set(["lagos", "ibadan", "abeokuta", "benin", "benin city"]);

const ABUJA_CITIES = new Set(["abuja", "lokoja", "minna"]);

const PORT_HARCOURT_CITIES = new Set(["port harcourt", "warri", "yenagoa"]);

const SOUTH_EAST_CITIES = new Set([
  "enugu",
  "owerri",
  "aba",
  "asaba",
  "uyo",
  "calabar",
  "onitsha",
  "awka"
]);

const NORTHERN_NIGERIA_CITIES = new Set([
  "kano",
  "kaduna",
  "jos",
  "maiduguri",
  "yola",
  "makurdi",
  "ilorin",
  "akure",
  "osogbo",
  "ekiti"
]);

const UK_CITIES = new Set(["london", "manchester", "birmingham", "leeds", "glasgow", "dublin"]);

const CANADA_CITIES = new Set(["toronto", "vancouver", "calgary", "montreal", "ottawa"]);

const USA_CITIES = new Set([
  "new york",
  "houston",
  "atlanta",
  "dallas",
  "chicago",
  "washington",
  "los angeles"
]);

const UAE_CITIES = new Set(["dubai", "abu dhabi", "sharjah"]);

const ACTIVE_MEMBER_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "consultation-scheduled",
  "under-review",
  "applied"
]);

const RELATIONSHIP_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "married"
]);

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

export function resolveMemberRegion(member: ConciergeMemberRecord): RegionalTeamId {
  const city = normalizeCity(member.aboutYou.city);

  if (LAGOS_CITIES.has(city)) return "lagos";
  if (ABUJA_CITIES.has(city)) return "abuja";
  if (PORT_HARCOURT_CITIES.has(city)) return "port-harcourt";
  if (SOUTH_EAST_CITIES.has(city)) return "south-east";
  if (NORTHERN_NIGERIA_CITIES.has(city)) return "northern-nigeria";
  if (UK_CITIES.has(city)) return "uk";
  if (CANADA_CITIES.has(city)) return "canada";
  if (USA_CITIES.has(city)) return "usa";
  if (UAE_CITIES.has(city)) return "uae";

  if (member.preferredTier === "global") return "global";
  return "global";
}

function resolveConsultantRegion(consultant: ConciergeConsultantRecord): RegionalTeamId {
  return REGIONAL_CONSULTANT_REGION_ASSIGNMENTS[consultant.id] ?? inferConsultantRegion(consultant);
}

export function resolveConsultantRegionForAssignment(
  consultant: ConciergeConsultantRecord
): RegionalTeamId {
  return resolveConsultantRegion(consultant);
}

function inferConsultantRegion(consultant: ConciergeConsultantRecord): RegionalTeamId {
  if (consultant.primaryRole === "diaspora-consultant") return "global";
  if (consultant.primaryRole === "family-values-advisor") return "lagos";
  return "lagos";
}

function mapPrimaryRoleToTeamRole(
  primaryRole: ConciergeConsultantRoleId,
  isDirector: boolean
): RegionalTeamRoleId {
  if (isDirector) return "regional-director";
  if (primaryRole === "relationship-consultant") return "consultant";
  if (primaryRole === "senior-matchmaker") return "senior-matchmaker";
  if (primaryRole === "compatibility-specialist") return "compatibility-specialist";
  if (primaryRole === "family-values-advisor") return "family-values-advisor";
  if (primaryRole === "diaspora-consultant") return "diaspora-consultant";
  return "consultant";
}

function membersForRegion(members: ConciergeMemberRecord[], regionId: RegionalTeamId): ConciergeMemberRecord[] {
  return members.filter((member) => resolveMemberRegion(member) === regionId);
}

function consultantsForRegion(
  consultants: ConciergeConsultantRecord[],
  regionId: RegionalTeamId
): ConciergeConsultantRecord[] {
  return consultants.filter((consultant) => resolveConsultantRegion(consultant) === regionId);
}

function buildMetrics(
  members: ConciergeMemberRecord[],
  consultantCount: number
): RegionalTeamMetrics {
  return {
    members: members.filter((member) => ACTIVE_MEMBER_STATUSES.has(member.status)).length,
    consultants: consultantCount,
    introductions: portfolioIntroductionsInProgress(members).length,
    relationships: members.filter((member) => RELATIONSHIP_STATUSES.has(member.status)).length,
    engagements: members.filter((member) => member.status === "engaged").length,
    marriages: members.filter((member) => member.status === "married").length,
    legacyFamilies: members.filter(
      (member) => member.preferredTier === "legacy" || member.status === "legacy-archive"
    ).length
  };
}

function buildTeamRoster(
  consultants: ConciergeConsultantRecord[],
  regionId: RegionalTeamId
): RegionalTeamMember[] {
  const directorId = REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS[regionId];

  return consultants.map((consultant) => {
    const isDirector = consultant.id === directorId;
    return {
      consultantId: consultant.id,
      name: consultant.name,
      email: consultant.email,
      status: consultant.status,
      teamRole: mapPrimaryRoleToTeamRole(consultant.primaryRole, isDirector),
      isDirector
    };
  });
}

function buildDirector(
  consultants: ConciergeConsultantRecord[],
  members: ConciergeMemberRecord[],
  regionId: RegionalTeamId,
  regionLabel: string
): RegionalTeamDirector | null {
  const directorId = REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS[regionId];
  const director = consultants.find((consultant) => consultant.id === directorId);
  if (!director) return null;

  const stewardCount = members.filter(
    (member) =>
      member.currentConsultantId === director.id || member.assignedConsultantId === director.id
  ).length;

  return {
    consultantId: director.id,
    name: director.name,
    email: director.email,
    regionLabel,
    teamRole: "regional-director",
    stewardCount,
    narrative: `${director.name} directs ${regionLabel} with ${stewardCount} member${
      stewardCount === 1 ? "" : "s"
    } under active stewardship.`
  };
}

function buildWorkload(
  consultants: ConciergeConsultantRecord[],
  members: ConciergeMemberRecord[]
): RegionalTeamWorkloadRow[] {
  return consultants.map((consultant) => {
    const assigned = members.filter(
      (member) =>
        member.currentConsultantId === consultant.id || member.assignedConsultantId === consultant.id
    );
    const activeMembers = assigned.filter((member) => ACTIVE_MEMBER_STATUSES.has(member.status)).length;
    const openIntroductions = portfolioIntroductionsInProgress(assigned).length;
    const workloadScore = activeMembers * 2 + openIntroductions + portfolioPendingConsultations(assigned).length;
    const health = deriveWorkloadHealth(consultant, activeMembers, workloadScore);

    return {
      consultantId: consultant.id,
      name: consultant.name,
      roleLabel: CONCIERGE_CONSULTANT_ROLE_LABELS[consultant.primaryRole],
      activeMembers,
      openIntroductions,
      health,
      summary: `${consultant.name} · ${activeMembers} active · ${openIntroductions} introductions in progress.`
    };
  });
}

function buildCoverage(members: ConciergeMemberRecord[]): RegionalCoverageRow[] {
  const counts = new Map<string, number>();
  for (const member of members) {
    const city = member.aboutYou.city.trim() || "Unspecified";
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, memberCount]) => ({
      id: `coverage_${label.toLowerCase().replace(/\s+/g, "_")}`,
      label,
      memberCount
    }))
    .sort((left, right) => right.memberCount - left.memberCount)
    .slice(0, 8);
}

function buildAssignments(
  members: ConciergeMemberRecord[],
  consultants: ConciergeConsultantRecord[]
): RegionalAssignmentRow[] {
  const unassigned = members.filter(
    (member) =>
      !member.currentConsultantId &&
      !member.assignedConsultantId &&
      (member.status === "applied" ||
        member.status === "under-review" ||
        member.status === "accepted" ||
        getApplicationReviewSummaryForMember(member).status === "submitted")
  );

  return unassigned.slice(0, 12).map((member) => {
    const recommended = consultants.find((consultant) => consultant.status === "active");
    return {
      id: member.id,
      memberName: member.aboutYou.name,
      journeyId: member.journeyId,
      status: SIGNAL_CONCIERGE_STATUS_LABELS[member.status] ?? member.status,
      city: member.aboutYou.city,
      recommendedConsultant: recommended?.name,
      detail: recommended
        ? `Recommend ${recommended.name} when assignment queue confirms fit.`
        : "Awaiting consultant capacity in this region."
    };
  });
}

function buildTeamSnapshot(input: {
  regionId: RegionalTeamId;
  consultants: ConciergeConsultantRecord[];
  members: ConciergeMemberRecord[];
}): RegionalTeamSnapshot {
  const region = REGIONAL_CONSULTANT_TEAM_REGIONS.find((entry) => entry.id === input.regionId)!;
  const regionConsultants = consultantsForRegion(input.consultants, input.regionId);
  const regionMembers = membersForRegion(input.members, input.regionId);

  return {
    regionId: input.regionId,
    regionLabel: region.label,
    timezone: region.timezone,
    director: buildDirector(regionConsultants, input.members, input.regionId, region.label),
    consultants: buildTeamRoster(regionConsultants, input.regionId),
    metrics: buildMetrics(regionMembers, regionConsultants.length),
    workload: buildWorkload(regionConsultants, regionMembers),
    coverage: buildCoverage(regionMembers),
    assignments: buildAssignments(regionMembers, regionConsultants)
  };
}

export function buildRegionalConsultantTeamsBundle(input: {
  consultants: ConciergeConsultantRecord[];
  members: ConciergeMemberRecord[];
}): RegionalConsultantTeamsBundle {
  return {
    teams: REGIONAL_CONSULTANT_TEAM_REGIONS.map((region) =>
      buildTeamSnapshot({
        regionId: region.id,
        consultants: input.consultants,
        members: input.members
      })
    ),
    updatedAt: new Date().toISOString()
  };
}

export function getRegionalTeamSnapshot(
  bundle: RegionalConsultantTeamsBundle,
  regionId: RegionalTeamId
): RegionalTeamSnapshot | null {
  return bundle.teams.find((team) => team.regionId === regionId) ?? null;
}

export function getRegionalTeamSnapshotForConsultant(
  bundle: RegionalConsultantTeamsBundle,
  consultant: ConciergeConsultantRecord
): RegionalTeamSnapshot | null {
  const regionId = resolveConsultantRegion(consultant);
  return getRegionalTeamSnapshot(bundle, regionId);
}

export function formatRegionalTeamRole(role: RegionalTeamRoleId): string {
  return REGIONAL_TEAM_ROLE_LABELS[role];
}
