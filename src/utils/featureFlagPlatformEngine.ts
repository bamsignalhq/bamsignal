import type { FeatureFlagEnvironmentId } from "../constants/featureFlagPlatform";
import type { FeatureFlagPlatformBundle } from "../types/featureFlagPlatform";
import { buildFeatureFlagPlatformBundle } from "./featureFlagPlatformLogic";
import { listFeatureFlagAudits, listFeatureFlags } from "./featureFlagPlatformStore";

export function buildFeatureFlagPlatformDashboard(
  environment: FeatureFlagEnvironmentId = "production"
): FeatureFlagPlatformBundle {
  return buildFeatureFlagPlatformBundle(listFeatureFlags(), listFeatureFlagAudits(), environment);
}

export { buildFeatureFlagPlatformBundle };
