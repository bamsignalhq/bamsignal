import type {
  EnterpriseFeatureFlagKey,
  FeatureFlagEnvironmentId,
  FeatureFlagRolloutScopeId
} from "../constants/featureFlagPlatform";

export type FeatureFlagRolloutConfig = {
  scope: FeatureFlagRolloutScopeId;
  countries?: string[];
  states?: string[];
  cities?: string[];
  memberIds?: string[];
  consultantIds?: string[];
};

export type EnterpriseFeatureFlagRecord = {
  id: string;
  key: EnterpriseFeatureFlagKey;
  label: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: FeatureFlagEnvironmentId;
  description?: string;
  rollout: FeatureFlagRolloutConfig;
  createdBy: string;
  updatedAt: string;
  active: boolean;
};

export type FeatureFlagAuditRecord = {
  id: string;
  flagId: string;
  flagKey: EnterpriseFeatureFlagKey;
  changedBy: string;
  previousValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  reason?: string;
  createdAt: string;
};

export type FeatureFlagEvaluationContext = {
  memberId?: string;
  consultantId?: string;
  country?: string;
  state?: string;
  city?: string;
  memberHash?: number;
  environment?: FeatureFlagEnvironmentId;
};

export type FeatureFlagPlatformBundle = {
  generatedAt: string;
  environment: FeatureFlagEnvironmentId;
  flags: EnterpriseFeatureFlagRecord[];
  audits: FeatureFlagAuditRecord[];
  summary: {
    total: number;
    enabled: number;
    disabled: number;
    active: number;
  };
};

export type FeatureFlagToggleInput = {
  flagId: string;
  enabled: boolean;
  actor: string;
  reason?: string;
};

export type FeatureFlagRolloutUpdateInput = {
  flagId: string;
  rolloutPercentage: number;
  rollout: FeatureFlagRolloutConfig;
  actor: string;
  reason?: string;
};
