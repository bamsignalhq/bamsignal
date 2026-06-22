import {
  FUTURE_READY_LEGACY_PROFESSIONAL_CAPABILITIES,
  PREPARED_LEGACY_ROLES
} from "../constants/legacyProfessionals";
import {
  listArchitectureLegacyProfessionals,
  listArchitectureLegacyRoles,
  listArchitectureProfessionalJourneys,
  type LegacyProfessionalViewModel,
  type LegacyRoleViewModel,
  type ProfessionalJourneyViewModel
} from "./legacyProfessionalsLogic";

export type LegacyProfessionalsBundle = {
  roles: LegacyRoleViewModel[];
  professionals: LegacyProfessionalViewModel[];
  journeys: ProfessionalJourneyViewModel[];
  roleCount: number;
  futureReadyCapabilityCount: number;
};

export function getLegacyProfessionalsBundle(): LegacyProfessionalsBundle {
  return {
    roles: listArchitectureLegacyRoles(),
    professionals: listArchitectureLegacyProfessionals(),
    journeys: listArchitectureProfessionalJourneys(),
    roleCount: PREPARED_LEGACY_ROLES.length,
    futureReadyCapabilityCount: FUTURE_READY_LEGACY_PROFESSIONAL_CAPABILITIES.length
  };
}

export function getLegacyRole(roleId: string): LegacyRoleViewModel | null {
  return listArchitectureLegacyRoles().find((role) => role.id === roleId) ?? null;
}
