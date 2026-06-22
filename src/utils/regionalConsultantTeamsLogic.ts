import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";
import {
  REGIONAL_CONSULTANT_REGION_ASSIGNMENTS,
  REGIONAL_CONSULTANT_TEAM_REGIONS,
  REGIONAL_TEAM_LEAD_ASSIGNMENTS,
  REGIONAL_TEAM_ROLE_LABELS,
  type RegionalTeamId,
  type RegionalTeamRoleId
} from "../constants/regionalConsultantTeams";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type {
  RegionalConsultantTeamsBundle,
  RegionalTeamLead,
  RegionalTeamMember,
  RegionalTeamMetrics,
  RegionalTeamSnapshot
} from "../types/regionalConsultantTeams";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";
import { portfolioIntroductionsInProgress, portfolioPendingConsultations } from "./conciergeConsultantMetrics";

const NIGERIA_CITIES = new Set([
  "lagos",
  "abuja",
  "port harcourt",
  "ibadan",
  "enugu",
  "kano",
  "benin",
  "owerri",
  "uyo",
  "aba",
  "asaba",
  "calabar",
  "kaduna",
  "jos"
]);

const WEST_AFRICA_CITIES = new Set(["accra", "dakar", "abidjan", "freetown", "monrovia"]);

const UK_CITIES = new Set(["london", "manchester", "birmingham", "leeds", "glasgow"]);

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

const MIDDLE_EAST_CITIES = new Set(["dubai", "abu dhabi", "doha", "riyadh", "jeddah"]);

const EUROPE_CITIES = new Set(["paris", "berlin", "amsterdam", "dublin", "madrid", "rome"]);

const AUSTRALIA_CITIES = new Set(["sydney", "melbourne", "brisbane", "perth"]);

const ACTIVE_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "consultation-scheduled"
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

  if (NIGERIA_CITIES.has(city)) return "nigeria";
  if (WEST_AFRICA_CITIES.has(city)) return "west-africa";
  if (UK_CITIES.has(city)) return "uk";
  if (CANADA_CITIES.has(city)) return "canada";
  if (USA_CITIES.has(city)) return "usa";
  if (MIDDLE_EAST_CITIES.has(city)) return "middle-east";
  if (EUROPE_CITIES.has(city)) return "europe";
  if (AUSTRALIA_CITIES.has(city)) return "australia";

  if (member.preferredTier === "global") return "uk";
  return "nigeria";
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
  if (consultant.primaryRole === "diaspora-consultant") return "uk";
  if (consultant.primaryRole === "family-values-advisor") return "nigeria";
  return "nigeria";
}

function mapPrimaryRoleToTeamRole(
  primaryRole: ConciergeConsultantRoleId,
  isLead: boolean
): RegionalTeamRoleId {
  if (isLead) return "regional-lead";
  if (primaryRole === "senior-matchmaker") return "senior-matchmaker";
  if (primaryRole === "compatibility-specialist") return "compatibility-specialist";
  if (primaryRole === "family-values-advisor") return "family-values-advisor";
  if (primaryRole === "diaspora-consultant") return "diaspora-consultant";
  return "senior-matchmaker";
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

function buildMetrics(members: ConciergeMemberRecord[]): RegionalTeamMetrics {
  const regionMembers = members;
  const pendingApps = regionMembers.filter(
    (member) =>
      member.status === "applied" ||
      member.status === "under-review" ||
      getApplicationReviewSummaryForMember(member).status === "submitted" ||
      getApplicationReviewSummaryForMember(member).status === "under-review"
  );

  return {
    activeMembers: regionMembers.filter((member) => ACTIVE_STATUSES.has(member.status)).length,
    openApplications: pendingApps.length,
    consultations: portfolioPendingConsultations(regionMembers).length,
    introductions: portfolioIntroductionsInProgress(regionMembers).length,
    relationships: regionMembers.filter((member) => RELATIONSHIP_STATUSES.has(member.status)).length
  };
}

function buildTeamRoster(
  consultants: ConciergeConsultantRecord[],
  regionId: RegionalTeamId
): RegionalTeamMember[] {
  const leadId = REGIONAL_TEAM_LEAD_ASSIGNMENTS[regionId];

  return consultants.map((consultant) => {
    const isLead = consultant.id === leadId;
    return {
      consultantId: consultant.id,
      name: consultant.name,
      email: consultant.email,
      status: consultant.status,
      teamRole: mapPrimaryRoleToTeamRole(consultant.primaryRole, isLead),
      isLead
    };
  });
}

function buildLead(
  consultants: ConciergeConsultantRecord[],
  members: ConciergeMemberRecord[],
  regionId: RegionalTeamId,
  regionLabel: string
): RegionalTeamLead | null {
  const leadId = REGIONAL_TEAM_LEAD_ASSIGNMENTS[regionId];
  const lead = consultants.find((consultant) => consultant.id === leadId);
  if (!lead) return null;

  const stewardCount = members.filter(
    (member) =>
      member.currentConsultantId === lead.id || member.assignedConsultantId === lead.id
  ).length;

  return {
    consultantId: lead.id,
    name: lead.name,
    email: lead.email,
    regionLabel,
    teamRole: "regional-lead",
    stewardCount,
    narrative: `${lead.name} stewards ${stewardCount} member${
      stewardCount === 1 ? "" : "s"
    } in ${regionLabel} with continuity across handoffs.`
  };
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
    lead: buildLead(regionConsultants, input.members, input.regionId, region.label),
    consultants: buildTeamRoster(regionConsultants, input.regionId),
    metrics: buildMetrics(regionMembers)
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

export function formatRegionalTeamRole(role: RegionalTeamRoleId): string {
  return REGIONAL_TEAM_ROLE_LABELS[role];
}
