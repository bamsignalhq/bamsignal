import { PREPARED_LIFE_PARTNER_SPECIALTIES } from "../constants/lifePartners";
import {
  listArchitectureLegacyAdvisors,
  listArchitectureLifePartnerSpecialties,
  listArchitectureLifePartners,
  type LegacyAdvisorViewModel,
  type LifePartnerSpecialtyViewModel,
  type LifePartnerViewModel
} from "./lifePartnersLogic";

export type LifePartnersBundle = {
  specialties: LifePartnerSpecialtyViewModel[];
  partners: LifePartnerViewModel[];
  advisors: LegacyAdvisorViewModel[];
  specialtyCount: number;
};

export function getLifePartnersBundle(): LifePartnersBundle {
  return {
    specialties: listArchitectureLifePartnerSpecialties(),
    partners: listArchitectureLifePartners(),
    advisors: listArchitectureLegacyAdvisors(),
    specialtyCount: PREPARED_LIFE_PARTNER_SPECIALTIES.length
  };
}

export function getLifePartnerSpecialty(specialtyId: string): LifePartnerSpecialtyViewModel | null {
  return listArchitectureLifePartnerSpecialties().find((specialty) => specialty.id === specialtyId) ?? null;
}
