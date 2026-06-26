import {
  LEGACY_PERMISSION_TO_GOVERNANCE_SLUG,
  LEGACY_ROLE_TO_GOVERNANCE_SLUG,
  type GovernancePermissionSlug,
  type GovernanceRoleSlug
} from "../constants/institutionalGovernance";
import {
  GOVERNANCE_ASSIGNMENT_SEED,
  GOVERNANCE_DELEGATION_SEED,
  GOVERNANCE_ROLE_PERMISSION_SEED,
  GOVERNANCE_ROLE_SEED,
  buildGovernanceRolePermissionMap
} from "../data/institutionalGovernanceSeed";
import type { DelegationRecord, GovernanceRoleRecord } from "../types/institutionalGovernance";
import type { Permission, Role } from "../constants/permissionTypes";

export type GovernanceAuthorizationInput = {
  legacyRole: Role | string;
  operatorEmail?: string;
  assignments?: typeof GOVERNANCE_ASSIGNMENT_SEED;
  delegations?: DelegationRecord[];
  at?: Date;
};

function rolesBySlug(): Record<GovernanceRoleSlug, GovernanceRoleRecord> {
  return Object.fromEntries(GOVERNANCE_ROLE_SEED.map((role) => [role.slug, role])) as Record<
    GovernanceRoleSlug,
    GovernanceRoleRecord
  >;
}

export function governanceSlugFromLegacyRole(role: Role | string): GovernanceRoleSlug {
  return LEGACY_ROLE_TO_GOVERNANCE_SLUG[role] ?? "guest-reviewer";
}

export function governanceSlugFromLegacyPermission(permission: Permission): GovernancePermissionSlug | null {
  return LEGACY_PERMISSION_TO_GOVERNANCE_SLUG[permission] ?? null;
}

export function collectRoleAncestors(
  roleSlug: GovernanceRoleSlug,
  roleMap = rolesBySlug()
): GovernanceRoleSlug[] {
  const parent = GOVERNANCE_ROLE_SEED.find((role) => role.slug === roleSlug)?.parentRoleId;
  if (!parent) return [];
  const parentRole = GOVERNANCE_ROLE_SEED.find((role) => role.id === parent);
  return parentRole ? [parentRole.slug] : [];
}

export function resolveInheritedPermissions(
  roleSlug: GovernanceRoleSlug,
  directPermissionsByRole = buildGovernanceRolePermissionMap()
): GovernancePermissionSlug[] {
  const inherited = new Set(directPermissionsByRole[roleSlug] ?? []);
  for (const ancestorSlug of collectRoleAncestors(roleSlug)) {
    for (const permission of directPermissionsByRole[ancestorSlug] ?? []) {
      inherited.add(permission);
    }
  }
  return [...inherited];
}

export function expireDelegations(
  delegations: DelegationRecord[],
  at = new Date()
): DelegationRecord[] {
  const now = at.getTime();
  return delegations.map((delegation) => {
    if (delegation.status !== "active") return delegation;
    if (Date.parse(delegation.endsAt) < now) {
      return { ...delegation, status: "expired", updatedAt: new Date().toISOString() };
    }
    return delegation;
  });
}

export function resolveActiveDelegations(
  delegateEmail: string | undefined,
  delegations: DelegationRecord[],
  at = new Date()
): DelegationRecord[] {
  const email = String(delegateEmail || "").toLowerCase();
  const now = at.getTime();
  return expireDelegations(delegations, at).filter((delegation) => {
    if (delegation.status !== "active") return false;
    if (delegation.delegateEmail.toLowerCase() !== email) return false;
    const start = Date.parse(delegation.startsAt);
    const end = Date.parse(delegation.endsAt);
    return now >= start && now <= end;
  });
}

export function resolveOperatorGovernancePermissions(
  input: GovernanceAuthorizationInput
): GovernancePermissionSlug[] {
  const at = input.at ?? new Date();
  const assignments = input.assignments ?? GOVERNANCE_ASSIGNMENT_SEED;
  const delegations = input.delegations ?? GOVERNANCE_DELEGATION_SEED;
  const email = input.operatorEmail?.toLowerCase();
  const assignment = assignments.find((item) => item.operatorEmail.toLowerCase() === email);
  const roleSlug = assignment?.roleSlug ?? governanceSlugFromLegacyRole(input.legacyRole);
  const rolePermissions = resolveInheritedPermissions(roleSlug);
  const delegated = resolveActiveDelegations(email, delegations, at).flatMap(
    (item) => item.permissionSlugs
  );
  return [...new Set([...rolePermissions, ...delegated])];
}

export function operatorHasGovernancePermissionSlug(
  input: GovernanceAuthorizationInput,
  permissionSlug: GovernancePermissionSlug
): boolean {
  return resolveOperatorGovernancePermissions(input).includes(permissionSlug);
}

export function operatorHasGovernanceLegacyPermission(
  input: GovernanceAuthorizationInput,
  permission: Permission
): boolean {
  const slug = governanceSlugFromLegacyPermission(permission);
  if (!slug) return false;
  return operatorHasGovernancePermissionSlug(input, slug);
}

export function buildLegacyRolePermissionMap(): Record<Role, Permission[]> {
  const directByRole = buildGovernanceRolePermissionMap();
  const legacyEntries = Object.entries(LEGACY_ROLE_TO_GOVERNANCE_SLUG) as [Role, GovernanceRoleSlug][];
  const reversePermission = Object.fromEntries(
    Object.entries(LEGACY_PERMISSION_TO_GOVERNANCE_SLUG).map(([legacy, slug]) => [slug, legacy])
  ) as Record<GovernancePermissionSlug, Permission>;

  const result = {} as Record<Role, Permission[]>;
  for (const [legacyRole, governanceSlug] of legacyEntries) {
    const slugs = resolveInheritedPermissions(governanceSlug, directByRole);
    result[legacyRole] = slugs
      .map((slug) => reversePermission[slug])
      .filter((permission): permission is Permission => Boolean(permission));
  }

  result.Admin = Object.keys(LEGACY_PERMISSION_TO_GOVERNANCE_SLUG) as Permission[];

  return result;
}

export function listGovernanceRolePermissionBindings(): typeof GOVERNANCE_ROLE_PERMISSION_SEED {
  return GOVERNANCE_ROLE_PERMISSION_SEED;
}
