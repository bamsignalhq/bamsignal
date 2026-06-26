import { useEffect, useState } from "react";
import type { EnterpriseFeatureFlagKey } from "../constants/featureFlagPlatform";
import type { FeatureFlagEvaluationContext } from "../types/featureFlagPlatform";
import {
  getCachedFeatureFlags,
  isFeatureFlagEnabled,
  loadFeatureFlags
} from "../services/featureFlagClient";

export function useFeatureFlag(
  key: EnterpriseFeatureFlagKey,
  context: FeatureFlagEvaluationContext = {}
): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadFeatureFlags().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  void ready;
  return isFeatureFlagEnabled(key, context, getCachedFeatureFlags());
}
