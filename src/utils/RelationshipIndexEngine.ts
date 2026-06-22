import { PREPARED_RELATIONSHIP_INDICES } from "../constants/relationshipIndex";
import {
  listArchitectureRelationshipIndices,
  listCommunityRelationshipIndices,
  listGeneralRelationshipIndices,
  type RelationshipIndexViewModel
} from "./relationshipIndexLogic";

export type RelationshipIndexBundle = {
  indices: RelationshipIndexViewModel[];
  generalIndices: RelationshipIndexViewModel[];
  communityIndices: RelationshipIndexViewModel[];
  indexCount: number;
};

export function getRelationshipIndexBundle(): RelationshipIndexBundle {
  return {
    indices: listArchitectureRelationshipIndices(),
    generalIndices: listGeneralRelationshipIndices(),
    communityIndices: listCommunityRelationshipIndices(),
    indexCount: PREPARED_RELATIONSHIP_INDICES.length
  };
}

export function getRelationshipIndex(indexId: string): RelationshipIndexViewModel | null {
  return listArchitectureRelationshipIndices().find((index) => index.id === indexId) ?? null;
}
