/**
 * Membership entitlement service — single source of truth for member capabilities.
 * Membership ≠ pricing ≠ payment. Plans grant entitlements; entitlements grant capabilities.
 */

import { findAppUserIdentity, isDatabaseReady, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import {
  resolveFastConnectionPassStatus,
  resolveSignalPassStatus,
  shouldClearStalePremiumFlag
} from "../../shared/memberEntitlements.mjs";
import {
  CAPABILITY,
  hasCapability,
  resolveCapabilitySet,
  resolveLimitsFromCapabilities
} from "../../shared/membershipCapabilities.mjs";
import { isDiscreetPrivacyActive } from "./memberVisibilityPolicy.js";
import { expireDiscreetMembershipIfNeeded, resolveDiscreetStatus } from "./discreetMembership.js";

export { CAPABILITY, hasCapability };

async function expireStalePremiumFlags(user) {
  if (!user?.id || !shouldClearStalePremiumFlag(user)) return user;
  const result = await query(
    `update app_users
     set is_premium = false, updated_at = now()
     where id = $1
     returning *`,
    [user.id]
  );
  return result.rows[0] || user;
}

async function loadConciergeActive(memberId) {
  if (!memberId || !isDatabaseReady()) return false;
  try {
    const result = await query(
      `select id from member_experience_memberships
       where member_id = $1
         and experience_mode = 'concierge'
         and status = 'active'
         and (ends_at is null or ends_at > now())
       limit 1`,
      [memberId]
    );
    return Boolean(result.rows[0]);
  } catch {
    return false;
  }
}

/**
 * Build a serializable entitlement snapshot (no functions).
 * Clients and servers both use hasCapability(snapshot.capabilities, id).
 */
export function buildEntitlementSnapshot({
  isGuest = false,
  isMember = false,
  discoverMembershipActive = false,
  discreetActive = false,
  discreetUntil = null,
  conciergeActive = false,
  isAdmin = false,
  signalPass = null,
  fastConnectionPass = null
} = {}) {
  const capabilitySet = resolveCapabilitySet({
    isGuest,
    isMember,
    discoverMembershipActive,
    discreetActive,
    conciergeActive,
    isAdmin
  });
  const capabilities = [...capabilitySet].sort();
  const limits = resolveLimitsFromCapabilities(capabilitySet);
  const unlimitedEngagement =
    hasCapability(capabilitySet, CAPABILITY.UNLIMITED_SIGNALS) ||
    hasCapability(capabilitySet, CAPABILITY.UNLIMITED_MESSAGING);

  // Back-compat: legacy clients read signalPass.isPremium for unlimited gates.
  // Prefer capabilities in new code. Never key on plan display names.
  const legacyPass = signalPass || { isPremium: false, premiumUntil: null };
  const mirroredPass = {
    isPremium: Boolean(legacyPass.isPremium) || unlimitedEngagement,
    premiumUntil:
      legacyPass.premiumUntil ||
      (discreetActive ? discreetUntil || null : null)
  };

  return {
    version: 1,
    experiences: {
      guest: Boolean(isGuest),
      member: Boolean(isMember),
      discoverMembership: Boolean(discoverMembershipActive),
      discreet: Boolean(discreetActive),
      concierge: Boolean(conciergeActive),
      admin: Boolean(isAdmin)
    },
    discreetUntil: discreetActive ? discreetUntil || null : null,
    capabilities,
    limits,
    /** Back-compat mirrors — prefer capabilities over these fields in new code */
    signalPass: mirroredPass,
    fastConnectionPass: fastConnectionPass || { active: false, expiresAt: null }
  };
}

export function canFromSnapshot(snapshot, capability) {
  return hasCapability(snapshot?.capabilities, capability);
}

/**
 * Load entitlements for an identity. Fail closed on capabilities when DB is down for guests.
 */
export async function loadMembershipEntitlements({
  email = null,
  phone = null,
  isAdmin = false
} = {}) {
  if (isAdmin) {
    return buildEntitlementSnapshot({
      isGuest: false,
      isMember: true,
      discoverMembershipActive: true,
      discreetActive: false,
      conciergeActive: true,
      isAdmin: true,
      signalPass: { isPremium: true, premiumUntil: null },
      fastConnectionPass: { active: true, expiresAt: null }
    });
  }

  if (!isDatabaseReady()) {
    return buildEntitlementSnapshot({ isGuest: true, isMember: false });
  }

  let user = await findAppUserIdentity({ email, phone });
  let member = await findMemberProfileByUserKey(email, phone);

  if (!user && !member) {
    return buildEntitlementSnapshot({ isGuest: true, isMember: false });
  }

  if (user) {
    user = await expireStalePremiumFlags(user);
  }
  if (member) {
    member = (await expireDiscreetMembershipIfNeeded(member)) || member;
  }

  const signalPass = resolveSignalPassStatus(user);
  const fastConnectionPass = resolveFastConnectionPassStatus(user);
  const discreet = resolveDiscreetStatus(member);
  const conciergeActive = await loadConciergeActive(member?.id);

  // Discreet is independent of Discover Membership; either or both may be active.
  const discoverMembershipActive = Boolean(signalPass.isPremium);

  return buildEntitlementSnapshot({
    isGuest: false,
    isMember: true,
    discoverMembershipActive,
    discreetActive: discreet.active,
    discreetUntil: discreet.discreetUntil,
    conciergeActive,
    isAdmin: false,
    signalPass,
    fastConnectionPass
  });
}

/** Convenience: load + can */
export async function memberCan(capability, identity = {}) {
  const snapshot = await loadMembershipEntitlements(identity);
  return canFromSnapshot(snapshot, capability);
}

export async function assertMemberCapability(capability, identity = {}) {
  const snapshot = await loadMembershipEntitlements(identity);
  if (!canFromSnapshot(snapshot, capability)) {
    return {
      ok: false,
      error: "Profile not available.",
      capability,
      entitlements: snapshot
    };
  }
  return { ok: true, entitlements: snapshot };
}

export function isCityPlacementPurchaseAllowed(snapshot) {
  return (
    canFromSnapshot(snapshot, CAPABILITY.PURCHASE_CITY_BOOST) ||
    canFromSnapshot(snapshot, CAPABILITY.PURCHASE_SPOTLIGHT)
  );
}

/** Sync helper when member row already loaded (boost activation paths). */
export function entitlementsFromMemberRow(memberRow, userRow = null, { isAdmin = false } = {}) {
  const signalPass = resolveSignalPassStatus(userRow);
  const discreetActive = isDiscreetPrivacyActive(memberRow);
  return buildEntitlementSnapshot({
    isGuest: false,
    isMember: Boolean(memberRow || userRow),
    discoverMembershipActive: Boolean(signalPass.isPremium),
    discreetActive,
    discreetUntil: memberRow?.discreet_until || null,
    conciergeActive: false,
    isAdmin,
    signalPass,
    fastConnectionPass: resolveFastConnectionPassStatus(userRow)
  });
}
