import { PREPARED_DIASPORA_SERVICES } from "../constants/diasporaServices";
import {
  listArchitectureDiasporaAdvisors,
  listArchitectureDiasporaServices,
  listArchitectureImmigrationPartners,
  type DiasporaAdvisorViewModel,
  type DiasporaServiceViewModel,
  type ImmigrationPartnerViewModel
} from "./diasporaServicesLogic";

export type DiasporaServicesBundle = {
  services: DiasporaServiceViewModel[];
  partners: ImmigrationPartnerViewModel[];
  advisors: DiasporaAdvisorViewModel[];
  serviceCount: number;
};

export function getDiasporaServicesBundle(): DiasporaServicesBundle {
  return {
    services: listArchitectureDiasporaServices(),
    partners: listArchitectureImmigrationPartners(),
    advisors: listArchitectureDiasporaAdvisors(),
    serviceCount: PREPARED_DIASPORA_SERVICES.length
  };
}

export function getDiasporaService(serviceId: string): DiasporaServiceViewModel | null {
  return listArchitectureDiasporaServices().find((service) => service.id === serviceId) ?? null;
}
