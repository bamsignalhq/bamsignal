import type {
  ConfigurationApprovalStatusId,
  ConfigurationBusinessRuleId,
  ConfigurationSectionId,
  FeatureFlagModeId
} from "../constants/configurationPlatform";

export type ConfigurationValue = string | number | boolean | Record<string, unknown> | unknown[];

export type ConfigurationEntryRecord = {
  id: string;
  configKey: string;
  categoryId: ConfigurationSectionId;
  businessRuleId?: ConfigurationBusinessRuleId;
  label: string;
  description?: string;
  value: ConfigurationValue;
  valueType: "string" | "number" | "boolean" | "json";
  critical: boolean;
  activeVersion: number;
  status: "draft" | "active" | "pending-approval" | "archived";
  draftValue?: ConfigurationValue;
  updatedAt: string;
  updatedBy?: string;
};

export type ConfigurationVersionRecord = {
  id: string;
  entryId: string;
  versionNumber: number;
  value: ConfigurationValue;
  changeReason?: string;
  changedBy: string;
  createdAt: string;
};

export type FeatureFlagRecord = {
  id: string;
  flagKey: string;
  categoryId: ConfigurationSectionId;
  label: string;
  description?: string;
  mode: FeatureFlagModeId;
  rolloutConfig: {
    percentage?: number;
    regions?: string[];
    roles?: string[];
    note?: string;
  };
  enabled: boolean;
  updatedAt: string;
};

export type ConfigurationApprovalRecord = {
  id: string;
  entryId: string;
  configKey: string;
  label: string;
  proposedVersion: number;
  proposedValue: ConfigurationValue;
  status: ConfigurationApprovalStatusId;
  requestedBy: string;
  approverEmail?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
};

export type ConfigurationSnapshotRecord = {
  id: string;
  snapshotRef: string;
  label: string;
  entryCount: number;
  flagCount: number;
  createdBy: string;
  createdAt: string;
};

export type ConfigurationAuditRecord = {
  id: string;
  configKey: string;
  label: string;
  changedBy: string;
  previousValue: ConfigurationValue;
  currentValue: ConfigurationValue;
  changedAt: string;
  reason?: string;
  rollbackAvailable: boolean;
  rollbackVersion?: number;
};

export type ConfigurationMetric = {
  id: string;
  label: string;
  value: string;
};

export type ConfigurationPlatformBundle = {
  generatedAt: string;
  metrics: ConfigurationMetric[];
  entries: ConfigurationEntryRecord[];
  versions: ConfigurationVersionRecord[];
  featureFlags: FeatureFlagRecord[];
  approvals: ConfigurationApprovalRecord[];
  snapshots: ConfigurationSnapshotRecord[];
  pendingApprovals: ConfigurationApprovalRecord[];
  auditHistory: ConfigurationAuditRecord[];
  sectionCounts: Record<ConfigurationSectionId, number>;
};

export type ConfigurationFilterState = {
  query: string;
  sectionId: ConfigurationSectionId | "all";
};
