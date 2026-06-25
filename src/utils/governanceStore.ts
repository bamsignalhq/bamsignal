import {
  GOVERNANCE_APPROVAL_HISTORY_SEED,
  GOVERNANCE_APPROVAL_SEED,
  GOVERNANCE_ASSIGNMENT_SEED,
  GOVERNANCE_AUTHORITY_MATRIX_SEED,
  GOVERNANCE_DECISION_SEED,
  GOVERNANCE_DELEGATION_SEED,
  GOVERNANCE_PERMISSION_SEED,
  GOVERNANCE_POLICY_ACK_SEED,
  GOVERNANCE_POLICY_SEED,
  GOVERNANCE_ROLE_SEED
} from "../data/institutionalGovernanceSeed";
import type {
  ApprovalHistoryRecord,
  ApprovalRequestRecord,
  ExecutiveDecisionRecord,
  PolicyAcknowledgementRecord
} from "../types/institutionalGovernance";
import type { GovernanceAuditActionId } from "../constants/institutionalGovernance";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { appendExecutiveDecision, recordPolicyAcknowledgement } from "./governanceDecisionEngine";
import { processApprovalDecision } from "./governanceApprovalEngine";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.institutionalGovernance.v1";

type GovernanceStoreState = {
  approvals: ApprovalRequestRecord[];
  approvalHistory: ApprovalHistoryRecord[];
  delegations: typeof GOVERNANCE_DELEGATION_SEED;
  decisions: ExecutiveDecisionRecord[];
  acknowledgements: PolicyAcknowledgementRecord[];
  updatedAt: string;
};

function defaultState(): GovernanceStoreState {
  return {
    approvals: [...GOVERNANCE_APPROVAL_SEED],
    approvalHistory: [...GOVERNANCE_APPROVAL_HISTORY_SEED],
    delegations: [...GOVERNANCE_DELEGATION_SEED],
    decisions: [...GOVERNANCE_DECISION_SEED],
    acknowledgements: [...GOVERNANCE_POLICY_ACK_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): GovernanceStoreState {
  const stored = readJson<GovernanceStoreState>(STORAGE_KEY, defaultState());
  if (!stored?.approvals?.length) return defaultState();
  return stored;
}

function saveState(state: GovernanceStoreState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logGovernanceAudit(action: GovernanceAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "governance-system",
    role: "Governance",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listGovernanceRoles() {
  return GOVERNANCE_ROLE_SEED;
}

export function listGovernancePermissions() {
  return GOVERNANCE_PERMISSION_SEED;
}

export function listGovernanceAssignments() {
  return GOVERNANCE_ASSIGNMENT_SEED;
}

export function listGovernanceApprovals() {
  return loadState().approvals;
}

export function listGovernanceApprovalHistory() {
  return loadState().approvalHistory;
}

export function listGovernanceDelegations() {
  return loadState().delegations;
}

export function listExecutiveDecisions() {
  return loadState().decisions;
}

export function listPolicyAcknowledgements() {
  return loadState().acknowledgements;
}

export function listInstitutionalPolicies() {
  return GOVERNANCE_POLICY_SEED;
}

export function listAuthorityMatrix() {
  return GOVERNANCE_AUTHORITY_MATRIX_SEED;
}

export function submitApprovalDecision(
  requestId: string,
  input: {
    approverEmail: string;
    decision: ApprovalHistoryRecord["decision"];
    reason?: string;
    comments?: string;
  }
): ApprovalRequestRecord | null {
  const state = loadState();
  const request = state.approvals.find((item) => item.id === requestId);
  if (!request) return null;

  const result = processApprovalDecision(request, state.approvalHistory, input);
  saveState({
    ...state,
    approvals: state.approvals.map((item) => (item.id === requestId ? result.request : item)),
    approvalHistory: result.history
  });

  logGovernanceAudit(
    input.decision === "approved" ? "governance-approval-granted" : "governance-approval-denied",
    `${request.title} — ${input.decision}`,
    requestId
  );

  return result.request;
}

export function registerExecutiveDecision(
  input: Omit<ExecutiveDecisionRecord, "createdAt" | "updatedAt">
): ExecutiveDecisionRecord {
  const state = loadState();
  const decisions = appendExecutiveDecision(state.decisions, input);
  const record = decisions[decisions.length - 1];
  saveState({ ...state, decisions });
  logGovernanceAudit("governance-decision-registered", record.title, record.decisionRef);
  return record;
}

export function acknowledgeInstitutionalPolicy(
  input: Omit<PolicyAcknowledgementRecord, "createdAt" | "id">
): PolicyAcknowledgementRecord {
  const state = loadState();
  const result = recordPolicyAcknowledgement(state.acknowledgements, input);
  if (result.created) {
    saveState({ ...state, acknowledgements: result.acknowledgements });
    logGovernanceAudit(
      "governance-policy-acknowledged",
      `${input.policySlug} v${input.policyVersion}`,
      input.policyId
    );
  }
  return result.acknowledgement;
}
