import type {
  ConsentStatusId,
  DataClassId,
  DataGovernanceAreaId,
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

export type DataGovernanceSummary = {
  inventoryCount: number;
  activeRetentionPolicies: number;
  openPrivacyRequests: number;
  activeConsents: number;
  withdrawnConsents: number;
  regionalPolicies: number;
  sensitiveRegisters: number;
  highlyConfidentialCount: number;
};

export type DataGovernanceCenterBundle = {
  generatedAt: string;
  summary: DataGovernanceSummary;
  inventory: DataInventoryItem[];
  retentionPolicies: RetentionPolicyRecord[];
  privacyRequests: PrivacyRequestRecord[];
  consentRecords: ConsentRecord[];
  regionalPolicies: RegionalPolicyRecord[];
  sensitiveRegisters: SensitiveDataRegister[];
};
