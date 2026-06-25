/**
 * Institutional Governance System™ — constitutional authority layer (server).
 */

import { query, isDatabaseReady } from "../db.js";

export const GOVERNANCE_APPROVAL_STATUSES = [
  "draft",
  "pending",
  "under-review",
  "approved",
  "rejected",
  "returned",
  "expired",
  "cancelled"
];

export const GOVERNANCE_DB_TABLES = [
  "governance_roles",
  "governance_permissions",
  "governance_role_permissions",
  "governance_assignments",
  "approval_requests",
  "approval_steps",
  "approval_history",
  "delegations",
  "executive_decisions",
  "policy_acknowledgements",
  "authority_matrix",
  "institutional_policies"
];

export const LEGACY_ROLE_TO_GOVERNANCE_SLUG = {
  Admin: "founder",
  Executive: "read-only-executive",
  Operations: "operations-director",
  Consultant: "relationship-consultant",
  "Senior Matchmaker": "senior-matchmaker",
  "Compatibility Specialist": "compatibility-specialist",
  "Family Values Advisor": "family-values-advisor",
  "Diaspora Consultant": "diaspora-consultant",
  Support: "support-manager",
  Research: "research-director"
};

export const LEGACY_PERMISSION_TO_GOVERNANCE_SLUG = {
  ViewMembers: "view-members",
  EditMembers: "edit-members",
  AssignConsultants: "assign-consultant",
  ManageConsultants: "manage-consultants",
  ManagePayments: "manage-payments",
  ManageScheduling: "manage-scheduling",
  ManageNotifications: "manage-notifications",
  ManageIntroductions: "manage-introductions",
  ManageFollowUps: "manage-follow-ups",
  ViewArchives: "manage-archives",
  ManageArchives: "manage-archives",
  ViewFinance: "view-finance",
  ViewResearch: "manage-research",
  ViewExecutiveDashboard: "view-executive-dashboard",
  ManageSupport: "manage-support",
  ManageSafety: "manage-safety",
  ManageDocuments: "manage-documents",
  ManageCareers: "manage-careers",
  ManageOperations: "manage-operations",
  ManageRecovery: "manage-recovery"
};

export function governanceSlugFromLegacyPermission(permission) {
  return LEGACY_PERMISSION_TO_GOVERNANCE_SLUG[permission] ?? null;
}

export function governanceSlugFromLegacyRole(role) {
  return LEGACY_ROLE_TO_GOVERNANCE_SLUG[role] ?? "guest-reviewer";
}

export function collectRoleAncestors(roleSlug, rolesBySlug) {
  const current = rolesBySlug[roleSlug];
  if (!current?.parentRoleId) return [];
  const parent = Object.values(rolesBySlug).find((role) => role.id === current.parentRoleId);
  return parent ? [parent.slug] : [];
}

export function resolveInheritedPermissions(roleSlug, directPermissionsByRole, rolesBySlug) {
  const map = directPermissionsByRole ?? {};
  const inherited = new Set(map[roleSlug] ?? []);
  for (const ancestorSlug of collectRoleAncestors(roleSlug, rolesBySlug ?? {})) {
    for (const permission of map[ancestorSlug] ?? []) {
      inherited.add(permission);
    }
  }
  return [...inherited];
}

export function resolveActiveDelegations(delegateEmail, delegations, at = new Date()) {
  const email = String(delegateEmail || "").toLowerCase();
  const now = at.getTime();
  return delegations.filter((delegation) => {
    if (delegation.status !== "active") return false;
    if (String(delegation.delegateEmail).toLowerCase() !== email) return false;
    const start = Date.parse(delegation.startsAt);
    const end = Date.parse(delegation.endsAt);
    return now >= start && now <= end;
  });
}

export function expireDelegations(delegations, at = new Date()) {
  const now = at.getTime();
  return delegations.map((delegation) => {
    if (delegation.status !== "active") return delegation;
    if (Date.parse(delegation.endsAt) < now) {
      return { ...delegation, status: "expired", updatedAt: new Date().toISOString() };
    }
    return delegation;
  });
}

export function resolveOperatorGovernancePermissions(input) {
  const at = input.at ?? new Date();
  const context =
    input.rolesBySlug && input.directPermissionsByRole
      ? input
      : buildGovernanceAuthorizationContext(
          {
            roles: input.roles ?? [],
            rolePermissions: input.rolePermissions ?? [],
            directPermissionsByRole: input.directPermissionsByRole ?? {},
            assignments: input.assignments ?? [],
            delegations: input.delegations ?? []
          },
          input.operatorEmail,
          input.legacyRole
        );

  const assignment = (context.assignments ?? []).find(
    (item) => String(item.operatorEmail).toLowerCase() === String(input.operatorEmail || "").toLowerCase()
  );
  const roleSlug = assignment?.roleSlug ?? governanceSlugFromLegacyRole(input.legacyRole);
  const rolePermissions = resolveInheritedPermissions(
    roleSlug,
    context.directPermissionsByRole,
    context.rolesBySlug
  );
  const delegations = input.delegations ?? context.delegations ?? [];
  const activeDelegations = resolveActiveDelegations(
    input.operatorEmail,
    expireDelegations(delegations, at),
    at
  );
  const delegated = activeDelegations.flatMap((item) => item.permissionSlugs ?? []);
  return [...new Set([...rolePermissions, ...delegated])];
}

export function operatorHasGovernancePermission(input, permissionSlug) {
  const permissions = resolveOperatorGovernancePermissions(input);
  return permissions.includes(permissionSlug);
}

export function operatorHasLegacyPermission(input, legacyPermission) {
  const slug = governanceSlugFromLegacyPermission(legacyPermission);
  if (!slug) return false;
  return operatorHasGovernancePermission(input, slug);
}

export function assertNotSelfApproval(request, approverEmail) {
  if (
    String(request.makerEmail || "").toLowerCase() === String(approverEmail || "").toLowerCase()
  ) {
    throw new Error("Governance violation: maker cannot approve their own request");
  }
}

export function processApprovalDecision(request, history, input) {
  assertNotSelfApproval(request, input.approverEmail);
  const entry = {
    id: input.id ?? `approval_history_${history.length + 1}`,
    requestId: request.id,
    approverEmail: input.approverEmail,
    decision: input.decision,
    reason: input.reason ?? null,
    comments: input.comments ?? null,
    decidedAt: input.decidedAt ?? new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const nextHistory = [...history, entry];
  let status = request.status;
  if (input.decision === "approved") status = "approved";
  if (input.decision === "rejected") status = "rejected";
  if (input.decision === "returned") status = "returned";

  return {
    request: { ...request, status, updatedAt: new Date().toISOString() },
    history: nextHistory,
    entry
  };
}

export function assertExecutiveDecisionAppendOnly(previous, next) {
  if (next.length < previous.length) {
    throw new Error("Governance violation: executive decisions cannot be deleted");
  }
  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (prior.id !== current.id || prior.decisionRef !== current.decisionRef) {
      throw new Error("Governance violation: executive decisions are immutable");
    }
  }
}

export function appendExecutiveDecision(decisions, input) {
  const record = {
    id: input.id,
    decisionRef: input.decisionRef,
    category: input.category,
    title: input.title,
    summary: input.summary,
    decidedBy: input.decidedBy,
    decidedAt: input.decidedAt ?? new Date().toISOString(),
    linkedModule: input.linkedModule ?? null,
    linkedEntityRef: input.linkedEntityRef ?? null,
    record: input.record ?? {},
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const next = [...decisions, record];
  assertExecutiveDecisionAppendOnly(decisions, next);
  return next;
}

export function recordPolicyAcknowledgement(existing, input) {
  const duplicate = existing.find(
    (item) =>
      item.policyId === input.policyId &&
      item.policyVersion === input.policyVersion &&
      String(item.operatorEmail).toLowerCase() === String(input.operatorEmail).toLowerCase()
  );
  if (duplicate) return { acknowledgement: duplicate, created: false };

  const acknowledgement = {
    id: input.id,
    policyId: input.policyId,
    policyVersion: input.policyVersion,
    operatorEmail: input.operatorEmail,
    acknowledgedAt: input.acknowledgedAt ?? new Date().toISOString(),
    ipAddress: input.ipAddress ?? null,
    digitalSignature: input.digitalSignature,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return { acknowledgement, created: true, acknowledgements: [...existing, acknowledgement] };
}

export function canAccessGovernanceConsole(input) {
  return operatorHasGovernancePermission(input, "manage-governance");
}

export function getGovernanceDatabaseTableManifest() {
  return GOVERNANCE_DB_TABLES.map((tableName) => ({
    tableName,
    migrationRef: "0006_institutional_governance.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"],
    softDelete: [
      "governance_roles",
      "governance_permissions",
      "governance_assignments",
      "approval_requests",
      "delegations",
      "authority_matrix",
      "institutional_policies"
    ].includes(tableName)
  }));
}

export async function upsertGovernanceRole(role) {
  if (!isDatabaseReady()) throw new Error("database_not_ready");
  await query(
    `insert into governance_roles (
      id, slug, label, parent_role_id, hierarchy_level, is_configurable, description,
      created_at, updated_at, created_by, updated_by
    ) values (
      $1::uuid, $2, $3, $4::uuid, $5, $6, $7,
      coalesce($8::timestamptz, now()), now(), $9::uuid, $10::uuid
    )
    on conflict (slug) do update set
      label = excluded.label,
      parent_role_id = excluded.parent_role_id,
      hierarchy_level = excluded.hierarchy_level,
      is_configurable = excluded.is_configurable,
      description = excluded.description,
      updated_at = now(),
      updated_by = excluded.updated_by`,
    [
      role.id,
      role.slug,
      role.label,
      role.parentRoleId ?? null,
      role.hierarchyLevel ?? 0,
      role.isConfigurable ?? true,
      role.description ?? null,
      role.createdAt ?? null,
      role.createdBy ?? null,
      role.updatedBy ?? null
    ]
  );
  return role;
}

export function buildGovernanceAuthorizationContext(seedState, operatorEmail, legacyRole) {
  const rolesBySlug = Object.fromEntries(seedState.roles.map((role) => [role.slug, role]));
  const directPermissionsByRole =
    seedState.directPermissionsByRole ??
    (() => {
      const map = {};
      for (const role of seedState.roles) {
        map[role.slug] = [];
      }
      for (const mapping of seedState.rolePermissions ?? []) {
        const role = seedState.roles.find((item) => item.id === mapping.roleId);
        if (!role || mapping.granted === false) continue;
        if (!map[role.slug].includes(mapping.permissionSlug)) {
          map[role.slug].push(mapping.permissionSlug);
        }
      }
      return map;
    })();

  return {
    legacyRole,
    operatorEmail,
    rolesBySlug,
    directPermissionsByRole,
    assignments: seedState.assignments ?? [],
    delegations: seedState.delegations ?? []
  };
}
