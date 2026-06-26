import type { ReactNode } from "react";
import type { EnterpriseFeatureFlagKey } from "../constants/featureFlagPlatform";
import type { FeatureFlagEvaluationContext } from "../types/featureFlagPlatform";
import { useFeatureFlag } from "../hooks/useFeatureFlag";

type FeatureGateProps = {
  flag: EnterpriseFeatureFlagKey;
  context?: FeatureFlagEvaluationContext;
  fallback?: ReactNode;
  children: ReactNode;
};

export function FeatureGate({ flag, context, fallback = null, children }: FeatureGateProps) {
  const enabled = useFeatureFlag(flag, context);
  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}
