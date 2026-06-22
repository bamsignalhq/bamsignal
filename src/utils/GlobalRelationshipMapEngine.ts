import {
  buildCityMapNodes,
  buildCommunityMapNodes,
  buildCorridorMapEntries,
  buildFoundersCityMapNodes,
  buildLegacyCityMapNodes,
  sortCorridorEntries,
  sortMapNodes,
  type RelationshipCorridorMapViewModel,
  type RelationshipMapNodeViewModel
} from "./globalRelationshipMapLogic";

export type GlobalRelationshipMapBundle = {
  cities: RelationshipMapNodeViewModel[];
  communities: RelationshipMapNodeViewModel[];
  legacyCities: RelationshipMapNodeViewModel[];
  foundersCities: RelationshipMapNodeViewModel[];
  corridors: RelationshipCorridorMapViewModel[];
};

export function getGlobalRelationshipMapBundle(): GlobalRelationshipMapBundle {
  return {
    cities: sortMapNodes(buildCityMapNodes()),
    communities: sortMapNodes(buildCommunityMapNodes()),
    legacyCities: sortMapNodes(buildLegacyCityMapNodes()),
    foundersCities: sortMapNodes(buildFoundersCityMapNodes()),
    corridors: sortCorridorEntries(buildCorridorMapEntries())
  };
}
