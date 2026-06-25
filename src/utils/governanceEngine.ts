import type { InstitutionalGovernanceBundle } from "../types/institutionalGovernance";
import { getHardSessionEmail } from "./adminSession";
import { currentOperatorRole } from "./operatorPermissions";
import { resolveOperatorGovernancePermissions } from "./governancePermissionEngine";
import {
  buildGovernanceOverviewMetrics,
  countActiveDelegations,
  listPendingApprovals
} from "./governanceLogic";
import {
  listAuthorityMatrix,
  listExecutiveDecisions,
  listGovernanceApprovals,
  listGovernanceApprovalHistory,
  listGovernanceAssignments,
  listGovernanceDelegations,
  listGovernancePermissions,
  listGovernanceRoles,
  listInstitutionalPolicies,
  listPolicyAcknowledgements
} from "./governanceStore";

export function buildInstitutionalGovernanceBundle(): InstitutionalGovernanceBundle {
  const roles = listGovernanceRoles();
  const permissions = listGovernancePermissions();
  const assignments = listGovernanceAssignments();
  const approvals = listGovernanceApprovals();
  const approvalHistory = listGovernanceApprovalHistory();
  const delegations = listGovernanceDelegations();
  const decisions = listExecutiveDecisions();
  const policies = listInstitutionalPolicies();
  const acknowledgements = listPolicyAcknowledgements();
  const authorityMatrix = listAuthorityMatrix();
  const operatorEmail = getHardSessionEmail() ?? "founder@bamsignal.com";
  const legacyRole = currentOperatorRole() ?? "Admin";

  const effectivePermissions = resolveOperatorGovernancePermissions({
    legacyRole,
    operatorEmail,
    assignments,
    delegations
  });

  return {
    generatedAt: new Date().toISOString(),
    overviewMetrics: buildGovernanceOverviewMetrics({
      roleCount: roles.length,
      permissionCount: permissions.length,
      pendingApprovals: listPendingApprovals(approvals).length,
      activeDelegations: countActiveDelegations(delegations),
      policyAcknowledgements: acknowledgements.length,
      policiesRequiringAck: policies.filter((policy) => policy.requiresAcknowledgement).length
    }),
    roles,
    permissions,
    assignments,
    approvalQueue: listPendingApprovals(approvals),
    approvalHistory,
    delegations,
    decisions,
    policies,
    acknowledgements,
    authorityMatrix,
    effectivePermissionCount: effectivePermissions.length
  };
}
