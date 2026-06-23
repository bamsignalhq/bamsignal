import type { Permission, Role } from "../constants/permissions";
import {
  permissionsForHardPath,
  roleHasAnyPermission,
  roleHasPermission
} from "../constants/permissions";
import { getOperatorRole } from "./adminSession";

export function currentOperatorRole(): Role | null {
  return getOperatorRole();
}

export function operatorHasPermission(permission: Permission): boolean {
  const role = currentOperatorRole();
  if (!role) return false;
  return roleHasPermission(role, permission);
}

export function operatorHasAnyPermission(permissions: Permission | Permission[]): boolean {
  const role = currentOperatorRole();
  if (!role) return false;
  return roleHasAnyPermission(role, permissions);
}

export function operatorCanAccessCurrentPath(pathname = window.location.pathname): boolean {
  const role = currentOperatorRole();
  if (!role) return false;
  const required = permissionsForHardPath(pathname);
  return roleHasAnyPermission(role, required);
}
