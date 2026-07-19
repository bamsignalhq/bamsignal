declare module "../../shared/membershipCapabilities.mjs" {
  export const CAPABILITY: Readonly<Record<string, string>>;
  export const FREE_TIER_LIMITS: Readonly<{
    signalsPerDay: number;
    messagesPerDay: number;
    signalCooldownMs: number;
    premiumSignalCooldownMs: number;
  }>;
  export const EXPERIENCE_BUNDLES: Readonly<Record<string, readonly string[]>>;
  export const PRODUCT_TO_EXPERIENCE: Readonly<Record<string, string>>;
  export function experienceBundleForProduct(productId: string): string | null;
  export function hasCapability(
    capabilitySet: Set<string> | string[] | null | undefined,
    capability: string
  ): boolean;
  export function resolveCapabilitySet(input?: {
    isGuest?: boolean;
    isMember?: boolean;
    discoverMembershipActive?: boolean;
    discreetActive?: boolean;
    conciergeActive?: boolean;
    isAdmin?: boolean;
  }): Set<string>;
  export function resolveLimitsFromCapabilities(capabilitySet: Set<string> | string[]): {
    signalsPerDay: number | null;
    messagesPerDay: number | null;
    signalCooldownMs: number;
  };
}

declare module "*/shared/membershipCapabilities.mjs" {
  export const CAPABILITY: Readonly<Record<string, string>>;
  export const FREE_TIER_LIMITS: Readonly<{
    signalsPerDay: number;
    messagesPerDay: number;
    signalCooldownMs: number;
    premiumSignalCooldownMs: number;
  }>;
  export const EXPERIENCE_BUNDLES: Readonly<Record<string, readonly string[]>>;
  export const PRODUCT_TO_EXPERIENCE: Readonly<Record<string, string>>;
  export function experienceBundleForProduct(productId: string): string | null;
  export function hasCapability(
    capabilitySet: Set<string> | string[] | null | undefined,
    capability: string
  ): boolean;
  export function resolveCapabilitySet(input?: {
    isGuest?: boolean;
    isMember?: boolean;
    discoverMembershipActive?: boolean;
    discreetActive?: boolean;
    conciergeActive?: boolean;
    isAdmin?: boolean;
  }): Set<string>;
  export function resolveLimitsFromCapabilities(capabilitySet: Set<string> | string[]): {
    signalsPerDay: number | null;
    messagesPerDay: number | null;
    signalCooldownMs: number;
  };
}
