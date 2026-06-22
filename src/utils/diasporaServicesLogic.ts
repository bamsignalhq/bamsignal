import type {
  PreparedDiasporaAdvisorDefinition,
  PreparedDiasporaAdvisorId,
  PreparedDiasporaServiceDefinition,
  PreparedDiasporaServiceId,
  PreparedImmigrationPartnerDefinition,
  PreparedImmigrationPartnerId
} from "../constants/diasporaServices";
import {
  PREPARED_DIASPORA_ADVISORS,
  PREPARED_DIASPORA_SERVICES,
  PREPARED_IMMIGRATION_PARTNERS
} from "../constants/diasporaServices";

export type ImmigrationPartnerViewModel = {
  id: PreparedImmigrationPartnerId;
  name: string;
  title: string;
  focus: string;
  serviceTitle: string;
  statusLabel: string;
};

export type DiasporaAdvisorViewModel = {
  id: PreparedDiasporaAdvisorId;
  name: string;
  title: string;
  focus: string;
  serviceTitle: string;
  statusLabel: string;
};

export type DiasporaServiceViewModel = {
  id: PreparedDiasporaServiceId;
  title: string;
  description: string;
  partner: ImmigrationPartnerViewModel;
  advisor: DiasporaAdvisorViewModel;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildImmigrationPartnerViewModel(
  partner: PreparedImmigrationPartnerDefinition
): ImmigrationPartnerViewModel {
  const service = PREPARED_DIASPORA_SERVICES.find((item) => item.id === partner.serviceId);
  return {
    id: partner.id,
    name: partner.name,
    title: partner.title,
    focus: partner.focus,
    serviceTitle: service?.title ?? partner.serviceId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildDiasporaAdvisorViewModel(
  advisor: PreparedDiasporaAdvisorDefinition
): DiasporaAdvisorViewModel {
  const service = PREPARED_DIASPORA_SERVICES.find((item) => item.id === advisor.serviceId);
  return {
    id: advisor.id,
    name: advisor.name,
    title: advisor.title,
    focus: advisor.focus,
    serviceTitle: service?.title ?? advisor.serviceId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildDiasporaServiceViewModel(
  service: PreparedDiasporaServiceDefinition
): DiasporaServiceViewModel {
  const partner = PREPARED_IMMIGRATION_PARTNERS.find((item) => item.id === service.partnerId);
  const advisor = PREPARED_DIASPORA_ADVISORS.find((item) => item.id === service.advisorId);
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    partner: buildImmigrationPartnerViewModel(
      partner ?? {
        id: service.partnerId as PreparedImmigrationPartnerId,
        name: "Reserved partner",
        title: `${service.title} partner`,
        focus: service.description,
        serviceId: service.id
      }
    ),
    advisor: buildDiasporaAdvisorViewModel(
      advisor ?? {
        id: service.advisorId as PreparedDiasporaAdvisorId,
        name: "Reserved advisor",
        title: `${service.title} advisor`,
        focus: service.description,
        serviceId: service.id
      }
    ),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureDiasporaServices(): DiasporaServiceViewModel[] {
  return [...PREPARED_DIASPORA_SERVICES.map(buildDiasporaServiceViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureImmigrationPartners(): ImmigrationPartnerViewModel[] {
  return [...PREPARED_IMMIGRATION_PARTNERS.map(buildImmigrationPartnerViewModel)].sort((a, b) =>
    a.serviceTitle.localeCompare(b.serviceTitle)
  );
}

export function listArchitectureDiasporaAdvisors(): DiasporaAdvisorViewModel[] {
  return [...PREPARED_DIASPORA_ADVISORS.map(buildDiasporaAdvisorViewModel)].sort((a, b) =>
    a.serviceTitle.localeCompare(b.serviceTitle)
  );
}
