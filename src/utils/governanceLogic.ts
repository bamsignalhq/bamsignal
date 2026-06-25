import type { GovernanceOverviewMetric } from "../types/institutionalGovernance";
import type {
  ApprovalRequestRecord,
  DelegationRecord,
  PolicyAcknowledgementRecord
} from "../types/institutionalGovernance";
import type { InstitutionalPolicyRecord } from "../types/institutionalGovernance";
import { GOVERNANCE_APPROVAL_STATUS_LABELS } from "../constants/institutionalGovernance";
import { expireDelegations } from "./governancePermissionEngine";

export function buildGovernanceOverviewMetrics(input: {
  roleCount: number;
  permissionCount: number;
  pendingApprovals: number;
  activeDelegations: number;
  policyAcknowledgements: number;
  policiesRequiringAck: number;
}): GovernanceOverviewMetric[] {
  return [
    { id: "roles", label: "Governance roles", value: String(input.roleCount) },
    { id: "permissions", label: "Permissions", value: String(input.permissionCount) },
    {
      id: "pending-approvals",
      label: "Pending approvals",
      value: String(input.pendingApprovals),
      hint: "Maker/checker queue"
    },
    {
      id: "delegations",
      label: "Active delegations",
      value: String(input.activeDelegations)
    },
    {
      id: "policy-acks",
      label: "Policy acknowledgements",
      value: `${input.policyAcknowledgements}/${input.policiesRequiringAck}`
    }
  ];
}

export function listPendingApprovals(approvals: ApprovalRequestRecord[]): ApprovalRequestRecord[] {
  return approvals.filter((item) =>
    ["pending", "under-review", "returned"].includes(item.status)
  );
}

export function countActiveDelegations(delegations: DelegationRecord[], at = new Date()): number {
  return expireDelegations(delegations, at).filter((item) => item.status === "active").length;
}

export function listPoliciesAwaitingAck(
  policies: InstitutionalPolicyRecord[],
  acknowledgements: PolicyAcknowledgementRecord[],
  operatorEmail: string
): InstitutionalPolicyRecord[] {
  const email = operatorEmail.toLowerCase();
  return policies.filter((policy) => {
    if (!policy.requiresAcknowledgement) return false;
    return !acknowledgements.some(
      (ack) =>
        ack.policyId === policy.id &&
        ack.policyVersion === policy.version &&
        ack.operatorEmail.toLowerCase() === email
    );
  });
}

export function approvalStatusLabel(status: ApprovalRequestRecord["status"]): string {
  return GOVERNANCE_APPROVAL_STATUS_LABELS[status];
}
