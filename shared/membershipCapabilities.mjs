/**
 * Membership capabilities — stable capability IDs (not plan names).
 * Plans / experience modes grant entitlement bundles; product code checks capabilities.
 */

export const CAPABILITY = Object.freeze({
  UNLIMITED_SIGNALS: "unlimited_signals",
  UNLIMITED_MESSAGING: "unlimited_messaging",
  APPEAR_IN_DISCOVER: "appear_in_discover",
  BROWSE_DISCOVER: "browse_discover",
  SEARCH_MEMBERS: "search_members",
  SEND_SIGNAL: "send_signal",
  SEND_MESSAGE: "send_message",
  VIEW_VISITORS: "view_visitors",
  DISCREET_PRIVACY: "discreet_privacy",
  PURCHASE_BOOST: "purchase_boost",
  PURCHASE_CITY_BOOST: "purchase_city_boost",
  PURCHASE_SPOTLIGHT: "purchase_spotlight",
  USE_FAST_CONNECTION: "use_fast_connection",
  USE_CONCIERGE: "use_concierge",
  REDUCED_SIGNAL_COOLDOWN: "reduced_signal_cooldown",
  ADMIN_TOOLS: "admin_tools"
});

/** Free-tier daily limits (capabilities stay stable; numbers may be admin-tuned later). */
export const FREE_TIER_LIMITS = Object.freeze({
  signalsPerDay: 5,
  messagesPerDay: 5,
  signalCooldownMs: 15_000,
  premiumSignalCooldownMs: 5_000
});

/**
 * Experience → capability bundles.
 * Never key business logic on plan ids like "weekly" / "monthly".
 */
export const EXPERIENCE_BUNDLES = Object.freeze({
  guest: Object.freeze([]),

  /** Authenticated Discover member without paid Discover Membership */
  free_discover: Object.freeze([
    CAPABILITY.APPEAR_IN_DISCOVER,
    CAPABILITY.BROWSE_DISCOVER,
    CAPABILITY.SEARCH_MEMBERS,
    CAPABILITY.SEND_SIGNAL,
    CAPABILITY.SEND_MESSAGE,
    CAPABILITY.PURCHASE_BOOST,
    CAPABILITY.PURCHASE_CITY_BOOST,
    CAPABILITY.PURCHASE_SPOTLIGHT,
    CAPABILITY.USE_FAST_CONNECTION
  ]),

  /** Paid Discover Membership (legacy Signal Pass / premium_until) */
  discover_membership: Object.freeze([
    CAPABILITY.UNLIMITED_SIGNALS,
    CAPABILITY.UNLIMITED_MESSAGING,
    CAPABILITY.APPEAR_IN_DISCOVER,
    CAPABILITY.BROWSE_DISCOVER,
    CAPABILITY.SEARCH_MEMBERS,
    CAPABILITY.SEND_SIGNAL,
    CAPABILITY.SEND_MESSAGE,
    CAPABILITY.VIEW_VISITORS,
    CAPABILITY.PURCHASE_BOOST,
    CAPABILITY.PURCHASE_CITY_BOOST,
    CAPABILITY.PURCHASE_SPOTLIGHT,
    CAPABILITY.USE_FAST_CONNECTION,
    CAPABILITY.REDUCED_SIGNAL_COOLDOWN
  ]),

  /**
   * Discreet Membership — full self-serve power, no passive exposure.
   * City boost / spotlight purchases stay off (would force passive placement).
   */
  discreet_membership: Object.freeze([
    CAPABILITY.UNLIMITED_SIGNALS,
    CAPABILITY.UNLIMITED_MESSAGING,
    CAPABILITY.DISCREET_PRIVACY,
    CAPABILITY.BROWSE_DISCOVER,
    CAPABILITY.SEARCH_MEMBERS,
    CAPABILITY.SEND_SIGNAL,
    CAPABILITY.SEND_MESSAGE,
    CAPABILITY.VIEW_VISITORS,
    CAPABILITY.PURCHASE_BOOST,
    CAPABILITY.USE_FAST_CONNECTION,
    CAPABILITY.REDUCED_SIGNAL_COOLDOWN
  ]),

  /** Concierge eligibility only — journey/workflow is out of scope for 3C */
  concierge: Object.freeze([CAPABILITY.USE_CONCIERGE]),

  admin: Object.freeze(Object.values(CAPABILITY))
});

/**
 * Plan catalog product ids → experience bundle keys.
 * Pricing/admin may rename plans; these product ids stay stable.
 */
export const PRODUCT_TO_EXPERIENCE = Object.freeze({
  discover: "discover_membership",
  signal_pass: "discover_membership",
  premium: "discover_membership",
  discreet: "discreet_membership",
  discreet_membership: "discreet_membership",
  concierge: "concierge",
  signal_concierge: "concierge"
});

export function experienceBundleForProduct(productId) {
  const key = PRODUCT_TO_EXPERIENCE[String(productId || "").trim().toLowerCase()];
  return key || null;
}

export function hasCapability(capabilitySet, capability) {
  if (!capability) return false;
  if (capabilitySet instanceof Set) return capabilitySet.has(capability);
  if (Array.isArray(capabilitySet)) return capabilitySet.includes(capability);
  return false;
}

/**
 * Pure resolver — plans/experiences grant capabilities; never branch on plan display names.
 */
export function resolveCapabilitySet({
  isGuest = false,
  isMember = false,
  discoverMembershipActive = false,
  discreetActive = false,
  conciergeActive = false,
  isAdmin = false
} = {}) {
  const caps = new Set();

  if (isAdmin) {
    for (const c of EXPERIENCE_BUNDLES.admin) caps.add(c);
    return caps;
  }

  if (isGuest || !isMember) {
    return caps;
  }

  for (const c of EXPERIENCE_BUNDLES.free_discover) caps.add(c);

  if (discoverMembershipActive) {
    for (const c of EXPERIENCE_BUNDLES.discover_membership) caps.add(c);
  }

  if (discreetActive) {
    for (const c of EXPERIENCE_BUNDLES.discreet_membership) caps.add(c);
    // Privacy mode wins: never passively appear, never buy city placement products.
    caps.delete(CAPABILITY.APPEAR_IN_DISCOVER);
    caps.delete(CAPABILITY.PURCHASE_CITY_BOOST);
    caps.delete(CAPABILITY.PURCHASE_SPOTLIGHT);
  }

  if (conciergeActive) {
    for (const c of EXPERIENCE_BUNDLES.concierge) caps.add(c);
  }

  return caps;
}

export function resolveLimitsFromCapabilities(capabilitySet) {
  const unlimitedSignals = hasCapability(capabilitySet, CAPABILITY.UNLIMITED_SIGNALS);
  const unlimitedMessaging = hasCapability(capabilitySet, CAPABILITY.UNLIMITED_MESSAGING);
  const reducedCooldown = hasCapability(capabilitySet, CAPABILITY.REDUCED_SIGNAL_COOLDOWN);
  return {
    signalsPerDay: unlimitedSignals ? null : FREE_TIER_LIMITS.signalsPerDay,
    messagesPerDay: unlimitedMessaging ? null : FREE_TIER_LIMITS.messagesPerDay,
    signalCooldownMs: reducedCooldown
      ? FREE_TIER_LIMITS.premiumSignalCooldownMs
      : FREE_TIER_LIMITS.signalCooldownMs
  };
}
