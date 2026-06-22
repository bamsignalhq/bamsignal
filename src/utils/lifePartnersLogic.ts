import type {
  PreparedLegacyAdvisorDefinition,
  PreparedLegacyAdvisorId,
  PreparedLifePartnerDefinition,
  PreparedLifePartnerId,
  PreparedLifePartnerSpecialtyDefinition,
  PreparedLifePartnerSpecialtyId
} from "../constants/lifePartners";
import {
  PREPARED_LEGACY_ADVISORS,
  PREPARED_LIFE_PARTNERS,
  PREPARED_LIFE_PARTNER_SPECIALTIES
} from "../constants/lifePartners";

export type LifePartnerViewModel = {
  id: PreparedLifePartnerId;
  name: string;
  title: string;
  focus: string;
  specialtyTitle: string;
  statusLabel: string;
};

export type LegacyAdvisorViewModel = {
  id: PreparedLegacyAdvisorId;
  name: string;
  title: string;
  focus: string;
  specialtyTitle: string;
  statusLabel: string;
};

export type LifePartnerSpecialtyViewModel = {
  id: PreparedLifePartnerSpecialtyId;
  title: string;
  description: string;
  partner: LifePartnerViewModel;
  advisor: LegacyAdvisorViewModel;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildLifePartnerViewModel(partner: PreparedLifePartnerDefinition): LifePartnerViewModel {
  const specialty = PREPARED_LIFE_PARTNER_SPECIALTIES.find((item) => item.id === partner.specialtyId);
  return {
    id: partner.id,
    name: partner.name,
    title: partner.title,
    focus: partner.focus,
    specialtyTitle: specialty?.title ?? partner.specialtyId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyAdvisorViewModel(
  advisor: PreparedLegacyAdvisorDefinition
): LegacyAdvisorViewModel {
  const specialty = PREPARED_LIFE_PARTNER_SPECIALTIES.find((item) => item.id === advisor.specialtyId);
  return {
    id: advisor.id,
    name: advisor.name,
    title: advisor.title,
    focus: advisor.focus,
    specialtyTitle: specialty?.title ?? advisor.specialtyId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLifePartnerSpecialtyViewModel(
  specialty: PreparedLifePartnerSpecialtyDefinition
): LifePartnerSpecialtyViewModel {
  const partner = PREPARED_LIFE_PARTNERS.find((item) => item.id === specialty.partnerId);
  const advisor = PREPARED_LEGACY_ADVISORS.find((item) => item.id === specialty.advisorId);
  return {
    id: specialty.id,
    title: specialty.title,
    description: specialty.description,
    partner: buildLifePartnerViewModel(
      partner ?? {
        id: specialty.partnerId as PreparedLifePartnerId,
        name: "Reserved partner",
        title: `${specialty.title} profile`,
        focus: specialty.description,
        specialtyId: specialty.id
      }
    ),
    advisor: buildLegacyAdvisorViewModel(
      advisor ?? {
        id: specialty.advisorId as PreparedLegacyAdvisorId,
        name: "Reserved advisor",
        title: `${specialty.title} legacy counsel`,
        focus: specialty.description,
        specialtyId: specialty.id
      }
    ),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureLifePartnerSpecialties(): LifePartnerSpecialtyViewModel[] {
  return [...PREPARED_LIFE_PARTNER_SPECIALTIES.map(buildLifePartnerSpecialtyViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureLifePartners(): LifePartnerViewModel[] {
  return [...PREPARED_LIFE_PARTNERS.map(buildLifePartnerViewModel)].sort((a, b) =>
    a.specialtyTitle.localeCompare(b.specialtyTitle)
  );
}

export function listArchitectureLegacyAdvisors(): LegacyAdvisorViewModel[] {
  return [...PREPARED_LEGACY_ADVISORS.map(buildLegacyAdvisorViewModel)].sort((a, b) =>
    a.specialtyTitle.localeCompare(b.specialtyTitle)
  );
}
