import { PARTNER_CATEGORIES } from "../constants/researchPartnerships";
import { listArchitectureInstitutions, type InstitutionViewModel } from "./researchPartnershipsLogic";

export type ResearchPartnershipsBundle = {
  categories: typeof PARTNER_CATEGORIES;
  institutions: InstitutionViewModel[];
};

export function getResearchPartnershipsBundle(): ResearchPartnershipsBundle {
  return {
    categories: PARTNER_CATEGORIES,
    institutions: listArchitectureInstitutions()
  };
}

export function getInstitution(institutionId: string): InstitutionViewModel | null {
  return listArchitectureInstitutions().find((institution) => institution.id === institutionId) ?? null;
}
