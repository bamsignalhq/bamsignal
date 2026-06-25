import type {
  GovernanceApprovalDomainId,
  GovernanceApprovalStatusId,
  GovernancePermissionSlug,
  GovernancePolicySlug,
  GovernanceRoleSlug
} from "../constants/institutionalGovernance";

export type GovernanceRoleRecord = {
  id: string;
  slug: GovernanceRoleSlug;
  label: string;
  parentRoleId?: string;
  hierarchyLevel: number;
  isConfigurable: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
};

export type GovernancePermissionRecord = {
  id: string;
  slug: GovernancePermissionSlug;
  label: string;
  moduleId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type GovernanceRolePermissionRecord = {
  id: string;
  roleId: string;
  permissionId: string;
  permissionSlug: GovernancePermissionSlug;
  granted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GovernanceAssignmentRecord = {
  id: string;
  roleId: string;
  roleSlug: GovernanceRoleSlug;
  operatorEmail: string;
  isPrimary: boolean;
  startsAt: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalRequestRecord = {
  id: string;
  domainId: GovernanceApprovalDomainId;
  moduleId: string;
  entityRef: string;
  status: GovernanceApprovalStatusId;
  makerEmail: string;
  makerRoleId?: string;
  title: string;
  summary?: string;
  payload: Record<string, unknown>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalHistoryRecord = {
  id: string;
  requestId: string;
  approverEmail: string;
  decision: "approved" | "rejected" | "returned";
  reason?: string;
  comments?: string;
  decidedAt: string;
  createdAt: string;
};

export type DelegationRecord = {
  id: string;
  delegatorEmail: string;
  delegateEmail: string;
  delegatorRoleId?: string;
  delegateRoleId?: string;
  permissionSlugs: GovernancePermissionSlug[];
  startsAt: string;
  endsAt: string;
  status: "active" | "expired" | "revoked";
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExecutiveDecisionRecord = {
  id: string;
  decisionRef: string;
  category: string;
  title: string;
  summary: string;
  decidedBy: string;
  decidedAt: string;
  linkedModule?: string;
  linkedEntityRef?: string;
  record: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PolicyAcknowledgementRecord = {
  id: string;
  policyId: string;
  policySlug: GovernancePolicySlug;
  policyVersion: string;
  operatorEmail: string;
  acknowledgedAt: string;
  ipAddress?: string;
  digitalSignature: string;
  createdAt: string;
};

export type InstitutionalPolicyRecord = {
  id: string;
  slug: GovernancePolicySlug;
  title: string;
  version: string;
  category: string;
  body: string;
  requiresAcknowledgement: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthorityMatrixRecord = {
  id: string;
  roleId: string;
  roleSlug: GovernanceRoleSlug;
  responsibilities: string[];
  reportingLine?: string;
  approvalLimits: Record<string, unknown>;
  approvalAuthority: string[];
  operationalScope: string[];
  financialAuthority: Record<string, unknown>;
  memberAuthority: string[];
  consultantAuthority: string[];
  researchAuthority: string[];
  documentAuthority: string[];
  createdAt: string;
  updatedAt: string;
};

export type GovernanceOverviewMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type InstitutionalGovernanceBundle = {
  generatedAt: string;
  overviewMetrics: GovernanceOverviewMetric[];
  roles: GovernanceRoleRecord[];
  permissions: GovernancePermissionRecord[];
  assignments: GovernanceAssignmentRecord[];
  approvalQueue: ApprovalRequestRecord[];
  approvalHistory: ApprovalHistoryRecord[];
  delegations: DelegationRecord[];
  decisions: ExecutiveDecisionRecord[];
  policies: InstitutionalPolicyRecord[];
  acknowledgements: PolicyAcknowledgementRecord[];
  authorityMatrix: AuthorityMatrixRecord[];
  effectivePermissionCount: number;
};
