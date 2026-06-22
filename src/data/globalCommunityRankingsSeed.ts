import type { CommunityMaturityLevelId } from "../constants/globalCommunityRankings";

/** Architecture preview — maturity levels for example cities (not rankings). */
export const GLOBAL_COMMUNITY_RANKINGS_CITY_MATURITY: Record<string, CommunityMaturityLevelId> = {
  lagos: "legacy-community",
  abuja: "premium-community",
  "port-harcourt": "growing-community",
  enugu: "emerging-community",
  toronto: "active-community",
  london: "premium-community",
  houston: "growing-community"
};

export const GLOBAL_COMMUNITY_RANKINGS_ARCHITECTURE_CITY_SLUGS = Object.keys(
  GLOBAL_COMMUNITY_RANKINGS_CITY_MATURITY
);
