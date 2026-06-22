import { LAB_CATEGORIES } from "../constants/relationshipLab";
import { listArchitectureResearchLabs, type ResearchLabViewModel } from "./relationshipLabLogic";

export type RelationshipLabBundle = {
  labs: ResearchLabViewModel[];
  categories: typeof LAB_CATEGORIES;
};

export function getRelationshipLabBundle(): RelationshipLabBundle {
  return {
    labs: listArchitectureResearchLabs(),
    categories: LAB_CATEGORIES
  };
}

export function getResearchLab(labId: string): ResearchLabViewModel | null {
  return listArchitectureResearchLabs().find((lab) => lab.id === labId) ?? null;
}
