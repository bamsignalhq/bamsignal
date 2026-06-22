import type { GlobalCityCommunityStatusId } from "../constants/globalCityNetwork";
import type {
  CommunityMaturityFactorId,
  CommunityMaturityLevelId,
  CommunityMaturityMilestoneEntry
} from "../constants/globalCommunityRankings";
import { COMMUNITY_MATURITY_FACTORS } from "../constants/globalCommunityRankings";
import { GLOBAL_COMMUNITY_RANKINGS_CITY_MATURITY } from "../data/globalCommunityRankingsSeed";
import type { GlobalCityDefinition } from "../constants/globalCityNetwork";
import { GLOBAL_CITY_REGION_LABELS } from "../constants/globalCityNetwork";
import { getGlobalCity } from "../constants/globalCityNetwork";
import { communityMaturityLevelLabel } from "../constants/globalCommunityRankings";

export type CommunityMaturityFactorRow = {
  id: CommunityMaturityFactorId;
  label: string;
  description: string;
  reached: boolean;
};

export type CommunityMaturityViewModel = {
  citySlug: string;
  cityName: string;
  regionLabel: string;
  diaspora: boolean;
  maturityLevel: CommunityMaturityLevelId;
  maturityLabel: string;
  factors: CommunityMaturityFactorRow[];
  milestones: CommunityMaturityMilestoneEntry[];
  reachedFactorCount: number;
};

const FACTORS_BY_LEVEL: Record<CommunityMaturityLevelId, CommunityMaturityFactorId[]> = {
  "emerging-community": ["member-activity"],
  "growing-community": ["member-activity", "successful-introductions", "events"],
  "active-community": [
    "member-activity",
    "successful-introductions",
    "relationships-formed",
    "events",
    "community-engagement"
  ],
  "premium-community": [
    "member-activity",
    "successful-introductions",
    "relationships-formed",
    "marriages",
    "events",
    "community-engagement"
  ],
  "legacy-community": COMMUNITY_MATURITY_FACTORS.map((factor) => factor.id)
};

function mapNetworkStatusToMaturity(status: GlobalCityCommunityStatusId): CommunityMaturityLevelId {
  switch (status) {
    case "launching-soon":
      return "emerging-community";
    case "community-growing":
      return "growing-community";
    case "active-community":
      return "active-community";
    case "premium-community":
      return "premium-community";
    case "legacy-community":
      return "legacy-community";
    default:
      return "emerging-community";
  }
}

export function resolveCommunityMaturityLevel(
  citySlug: string,
  networkStatus?: GlobalCityCommunityStatusId
): CommunityMaturityLevelId {
  const seeded = GLOBAL_COMMUNITY_RANKINGS_CITY_MATURITY[citySlug];
  if (seeded) return seeded;
  if (networkStatus) return mapNetworkStatusToMaturity(networkStatus);
  return "emerging-community";
}

function buildMilestones(
  citySlug: string,
  reachedFactors: CommunityMaturityFactorId[]
): CommunityMaturityMilestoneEntry[] {
  const baseDate = new Date("2026-01-01T00:00:00.000Z").getTime();
  return reachedFactors.map((factorId, index) => ({
    id: `gcr_milestone_${citySlug}_${factorId}`,
    factorId,
    recordedAt: new Date(baseDate + index * 45 * 24 * 60 * 60 * 1000).toISOString(),
    note:
      factorId === "legacy-families"
        ? "Legacy families honored with privacy."
        : factorId === "events"
          ? "Signal Events™ gatherings reserved."
          : undefined
  }));
}

export function buildCommunityMaturityViewModel(citySlug: string): CommunityMaturityViewModel | null {
  const city: GlobalCityDefinition | undefined = getGlobalCity(citySlug);
  if (!city) return null;

  const maturityLevel = resolveCommunityMaturityLevel(citySlug, city.status);
  const reachedFactorIds = new Set(FACTORS_BY_LEVEL[maturityLevel]);

  const factors: CommunityMaturityFactorRow[] = COMMUNITY_MATURITY_FACTORS.map((factor) => ({
    id: factor.id,
    label: factor.label,
    description: factor.description,
    reached: reachedFactorIds.has(factor.id)
  }));

  const reachedFactors = factors.filter((factor) => factor.reached).map((factor) => factor.id);

  return {
    citySlug,
    cityName: city.name,
    regionLabel: GLOBAL_CITY_REGION_LABELS[city.regionId],
    diaspora: city.diaspora,
    maturityLevel,
    maturityLabel: communityMaturityLevelLabel(maturityLevel),
    factors,
    milestones: buildMilestones(citySlug, reachedFactors),
    reachedFactorCount: reachedFactors.length
  };
}

export function sortCommunitiesForDisplay(
  communities: CommunityMaturityViewModel[]
): CommunityMaturityViewModel[] {
  return [...communities].sort((a, b) => a.cityName.localeCompare(b.cityName));
}
