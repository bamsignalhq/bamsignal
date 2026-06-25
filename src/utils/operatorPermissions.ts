import type { Permission, Role } from "../constants/permissions";
import { permissionsForHardPath } from "../constants/permissions";
import { getHardSessionEmail, getOperatorRole } from "./adminSession";
import {
  operatorHasGovernanceLegacyPermission,
  resolveOperatorGovernancePermissions
} from "./governancePermissionEngine";
import { GOVERNANCE_ASSIGNMENT_SEED, GOVERNANCE_DELEGATION_SEED } from "../data/institutionalGovernanceSeed";

export function currentOperatorRole(): Role | null {
  return getOperatorRole();
}

function governanceAuthInput() {
  return {
    legacyRole: currentOperatorRole() ?? "Admin",
    operatorEmail: getHardSessionEmail() ?? undefined,
    assignments: GOVERNANCE_ASSIGNMENT_SEED,
    delegations: GOVERNANCE_DELEGATION_SEED
  };
}

export function operatorHasPermission(permission: Permission): boolean {
  const role = currentOperatorRole();
  if (!role) return false;
  return operatorHasGovernanceLegacyPermission(governanceAuthInput(), permission);
}

export function operatorHasAnyPermission(permissions: Permission | Permission[]): boolean {
  const required = Array.isArray(permissions) ? permissions : [permissions];
  return required.some((permission) => operatorHasPermission(permission));
}

export function operatorCanAccessCurrentPath(pathname = window.location.pathname): boolean {
  const role = currentOperatorRole();
  if (!role) return false;
  const required = permissionsForHardPath(pathname);
  return operatorHasAnyPermission(required);
}

export function listOperatorEffectiveGovernancePermissions() {
  return resolveOperatorGovernancePermissions(governanceAuthInput());
}
