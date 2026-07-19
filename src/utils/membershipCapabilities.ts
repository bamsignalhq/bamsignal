/**
 * Client helpers for membership capabilities (Phase 3C).
 * Prefer canCapability() over plan-name or isPremium checks in new code.
 */
import {
  CAPABILITY,
  FREE_TIER_LIMITS,
  EXPERIENCE_BUNDLES,
  PRODUCT_TO_EXPERIENCE,
  hasCapability as sharedHasCapability,
  resolveCapabilitySet,
  resolveLimitsFromCapabilities
} from "../../shared/membershipCapabilities.mjs";

export {
  CAPABILITY,
  FREE_TIER_LIMITS,
  EXPERIENCE_BUNDLES,
  PRODUCT_TO_EXPERIENCE,
  resolveCapabilitySet,
  resolveLimitsFromCapabilities
};

export type MembershipEntitlementSnapshot = {
  version?: number;
  experiences?: {
    guest?: boolean;
    member?: boolean;
    discoverMembership?: boolean;
    discreet?: boolean;
    concierge?: boolean;
    admin?: boolean;
  };
  capabilities?: string[];
  limits?: {
    signalsPerDay?: number | null;
    messagesPerDay?: number | null;
    signalCooldownMs?: number;
  };
  signalPass?: { isPremium?: boolean; premiumUntil?: string | null };
  fastConnectionPass?: { active?: boolean; expiresAt?: string | null };
  discreetUntil?: string | null;
};

export function canCapability(
  snapshot: MembershipEntitlementSnapshot | null | undefined,
  capability: string
): boolean {
  return sharedHasCapability(snapshot?.capabilities, capability);
}

export function signalsPerDayLimit(
  snapshot: MembershipEntitlementSnapshot | null | undefined
): number | null {
  if (canCapability(snapshot, CAPABILITY.UNLIMITED_SIGNALS)) return null;
  return snapshot?.limits?.signalsPerDay ?? FREE_TIER_LIMITS.signalsPerDay;
}

export function messagesPerDayLimit(
  snapshot: MembershipEntitlementSnapshot | null | undefined
): number | null {
  if (canCapability(snapshot, CAPABILITY.UNLIMITED_MESSAGING)) return null;
  return snapshot?.limits?.messagesPerDay ?? FREE_TIER_LIMITS.messagesPerDay;
}
