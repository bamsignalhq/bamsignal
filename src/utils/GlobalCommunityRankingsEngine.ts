import { GLOBAL_COMMUNITY_RANKINGS_ARCHITECTURE_CITY_SLUGS } from "../data/globalCommunityRankingsSeed";
import {
  buildCommunityMaturityViewModel,
  sortCommunitiesForDisplay,
  type CommunityMaturityViewModel
} from "./globalCommunityRankingsLogic";

export type GlobalCommunityRankingsBundle = {
  communities: CommunityMaturityViewModel[];
};

export function getGlobalCommunityRankingsBundle(): GlobalCommunityRankingsBundle {
  const communities = GLOBAL_COMMUNITY_RANKINGS_ARCHITECTURE_CITY_SLUGS.map((slug) =>
    buildCommunityMaturityViewModel(slug)
  ).filter((community): community is CommunityMaturityViewModel => Boolean(community));

  return {
    communities: sortCommunitiesForDisplay(communities)
  };
}

export function getCommunityMaturityProfile(citySlug: string): CommunityMaturityViewModel | null {
  return buildCommunityMaturityViewModel(citySlug);
}
