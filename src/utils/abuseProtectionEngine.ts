import type { AbuseProtectionCenterBundle } from "../types/abuseProtection";
import { buildAbuseProtectionCenterBundle } from "./abuseProtectionLogic";
import { listAbuseBlocks, listAbuseRateLimits } from "./abuseProtectionStore";

export async function buildLiveAbuseProtectionCenterBundle(): Promise<AbuseProtectionCenterBundle> {
  return buildAbuseProtectionCenterBundle({
    blocks: listAbuseBlocks(),
    rateLimits: listAbuseRateLimits()
  });
}

export { buildAbuseProtectionCenterBundle };
