import type {
  ConsentStatusId,
  DataClassId,
  DataGovernanceAreaId,
  GovernanceTrailActionId,
  PrivacyRequestStatusId,
  PrivacyRequestTypeId,
  RetentionCategoryId
} from "../constants/dataGovernanceCenter";

export type DataInventoryItem = {
  id: string;
  inventoryRef: string;
  name: string;
  areaId: DataGovernanceAreaId;
  dataClass: DataClassId;
  system: string;
  ownerEmail: string;
  recordCount: number;
  containsPii: boolean;
  containsSensitive: boolean;
  lastReviewedAt: string;
};

export type RetentionPolicyRecord = {
  id: string;
  policyRef: string;
  categoryId: RetentionCategoryId;
  label: string;
  retentionDays: number;
  archiveAfterDays?: number;
  deleteAfterDays?: number;
  legalHoldExempt: boolean;
  active: boolean;
  updatedAt: string;
};

export type PrivacyRequestRecord = {
  id: string;
  requestRef: string;
  requestType: PrivacyRequestTypeId;
  status: PrivacyRequestStatusId;
  memberRef: string;
  submittedAt: string;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
};

export type ConsentRecord = {
  id: string;
  consentRef: string;
  memberRef: string;
  version: number;
  purpose: string;
  scope: string;
  status: ConsentStatusId;
  grantedAt: string;
  withdrawnAt?: string;
  auditTrail: { at: string; actor: string; action: string }[];
};

export type RegionalPolicyRecord = {
  id: string;
  policyRef: string;
  region: string;
  framework: string;
  description: string;
  active: boolean;
  updatedAt: string;
};

export type SensitiveDataRegister = {
  id: string;
  registerRef: string;
  dataType: string;
  dataClass: DataClassId;
  systems: string[];
  encryptionRequired: boolean;
  accessRestricted: boolean;
  lastAuditAt: string;
};

export type LegalHoldRecord = {
  id: string;
  holdRef: string;
  memberRef: string;
  reason: string;
  placedBy: string;
  placedAt: string;
  expiresAt: string | null;
  active: boolean;
};

export type PolicyVersionRecord = {
  id: string;
  policyRef: string;
  name: string;
  version: number;
  publishedAt: string;
  publishedBy: string;
  active: boolean;
};

export type GovernanceAuditRecord = {
  id: string;
  action: GovernanceTrailActionId;
  actor: string;
  target: string;
  at: string;
  detail: string;
};

export type AuditExportRecord = {
  id: string;
  exportRef: string;
  scope: string;
  requestedBy: string;
  generatedAt: string;
  recordCount: number;
  format: string;
};

export type DataGovernanceSummary = {
  inventoryCount: number;
  activeRetentionPolicies: number;
  openPrivacyRequests: number;
  activeConsents: number;
  withdrawnConsents: number;
  regionalPolicies: number;
  sensitiveRegisters: number;
  highlyConfidentialCount: number;
  activeLegalHolds: number;
  auditExportCount: number;
  policyVersionCount: number;
  governanceAuditCount: number;
};

export type DataGovernanceCenterBundle = {
  generatedAt: string;
  summary: DataGovernanceSummary;
  inventory: DataInventoryItem[];
  retentionPolicies: RetentionPolicyRecord[];
  privacyRequests: PrivacyRequestRecord[];
  deletionRequests: PrivacyRequestRecord[];
  exportRequests: PrivacyRequestRecord[];
  consentRecords: ConsentRecord[];
  regionalPolicies: RegionalPolicyRecord[];
  sensitiveRegisters: SensitiveDataRegister[];
  legalHolds: LegalHoldRecord[];
  policyVersions: PolicyVersionRecord[];
  governanceAudit: GovernanceAuditRecord[];
  auditExports: AuditExportRecord[];
};
