/**
 * Discreet Membership entitlement (Phase 3B).
 * Billing UI is out of scope — this activates privacy mode after a verified purchase
 * (or admin/test tooling) and keeps discoverable in sync with the visibility policy.
 */

import { findAppUserIdentity, isDatabaseReady, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import {
  PRIVACY_MODE,
  computeDiscoverableFlag,
  isDiscreetPrivacyActive
} from "./memberVisibilityPolicy.js";

function hideFromDiscovery(profile = {}) {
  return Boolean(profile?.safetySettings?.hideFromDiscovery);
}

export function resolveDiscreetStatus(memberRow) {
  if (!memberRow) {
    return {
      active: false,
      privacyMode: PRIVACY_MODE.DISCOVER,
      discreetUntil: null
    };
  }
  const active = isDiscreetPrivacyActive(memberRow);
  return {
    active,
    privacyMode: active ? PRIVACY_MODE.DISCREET : PRIVACY_MODE.DISCOVER,
    discreetUntil: memberRow.discreet_until || null
  };
}

/**
 * Recompute and persist discoverable from policy + safety settings.
 * Call after any pause/unpause/restore/privacy change.
 */
export async function syncMemberDiscoverableFromPolicy(memberRow) {
  if (!isDatabaseReady() || !memberRow?.id) return null;
  const profile = memberRow.profile || {};
  const discoverable = computeDiscoverableFlag({
    hideFromDiscovery: hideFromDiscovery(profile),
    paused: Boolean(memberRow.profile_paused_at),
    accountStatus: memberRow.account_status || "active",
    privacyMode: memberRow.privacy_mode || PRIVACY_MODE.DISCOVER,
    discreetUntil: memberRow.discreet_until || null,
    clientDiscoverable: true
  });

  const result = await query(
    `update app_member_profiles
     set discoverable = $2, updated_at = now()
     where id = $1
     returning *`,
    [memberRow.id, discoverable]
  );
  return result.rows[0] || null;
}

export async function activateDiscreetMembership({
  email,
  phone,
  days = 30,
  planId = null,
  productId = "discreet",
  paystackReference = null,
  metadata = {}
} = {}) {
  if (!isDatabaseReady()) return null;

  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return null;

  const durationDays = Math.max(1, Math.min(366, Math.round(Number(days) || 30)));
  const baseMs =
    isDiscreetPrivacyActive(member) && member.discreet_until
      ? Math.max(Date.now(), new Date(member.discreet_until).getTime())
      : Date.now();
  const discreetUntil = new Date(baseMs + durationDays * 86400000).toISOString();

  const profile = member.profile || {};
  const discoverable = computeDiscoverableFlag({
    hideFromDiscovery: hideFromDiscovery(profile),
    paused: Boolean(member.profile_paused_at),
    accountStatus: member.account_status || "active",
    privacyMode: PRIVACY_MODE.DISCREET,
    discreetUntil,
    clientDiscoverable: true
  });

  const updated = await query(
    `update app_member_profiles
     set privacy_mode = 'discreet',
         discreet_until = $2::timestamptz,
         discoverable = $3,
         updated_at = now()
     where id = $1
     returning *`,
    [member.id, discreetUntil, discoverable]
  );

  const row = updated.rows[0];
  if (!row) return null;

  // Deactivate auto/boost placements so city home cannot passively expose them.
  await query(
    `update city_home_placements
     set active = false, updated_at = now()
     where profile_id = $1
       and active = true
       and placement_type in ('auto', 'boost', 'hot', 'featured', 'spotlight')`,
    [member.id]
  ).catch(() => null);

  const user = await findAppUserIdentity({ email, phone });
  const memberId = member.id;
  const membershipMeta = JSON.stringify({
    ...metadata,
    activatedAt: new Date().toISOString(),
    userKey: user?.user_key || member.user_key || null
  });
  try {
    const existing = await query(
      `select id from member_experience_memberships
       where member_id = $1 and experience_mode = 'discreet' and status = 'active'
       limit 1`,
      [memberId]
    );
    if (existing.rows[0]?.id) {
      await query(
        `update member_experience_memberships
         set product_id = $2,
             plan_id = $3,
             ends_at = $4::timestamptz,
             source_payment_ref = coalesce($5, source_payment_ref),
             metadata = coalesce(metadata, '{}'::jsonb) || $6::jsonb,
             updated_at = now()
         where id = $1`,
        [
          existing.rows[0].id,
          productId || "discreet",
          planId || null,
          discreetUntil,
          paystackReference || null,
          membershipMeta
        ]
      );
    } else {
      await query(
        `insert into member_experience_memberships (
           member_id, experience_mode, product_id, plan_id, status,
           starts_at, ends_at, source_payment_ref, metadata
         ) values (
           $1, 'discreet', $2, $3, 'active', now(), $4::timestamptz, $5, $6::jsonb
         )`,
        [
          memberId,
          productId || "discreet",
          planId || null,
          discreetUntil,
          paystackReference || null,
          membershipMeta
        ]
      );
    }
  } catch {
    // Table may be absent until 0050/0051 migrate — profile columns still enforce privacy.
  }

  return {
    ok: true,
    member: row,
    privacyMode: PRIVACY_MODE.DISCREET,
    discreetUntil,
    discoverable: false
  };
}

export async function expireDiscreetMembershipIfNeeded(memberRow) {
  if (!memberRow?.id) return memberRow;
  const mode = String(memberRow.privacy_mode || "").toLowerCase();
  if (mode !== PRIVACY_MODE.DISCREET) return memberRow;
  if (isDiscreetPrivacyActive(memberRow)) return memberRow;

  await query(
    `update member_experience_memberships
     set status = 'expired', updated_at = now()
     where member_id = $1
       and experience_mode = 'discreet'
       and status = 'active'`,
    [memberRow.id]
  ).catch(() => null);

  const cleared = await query(
    `update app_member_profiles
     set privacy_mode = 'discover',
         discreet_until = null,
         updated_at = now()
     where id = $1
     returning *`,
    [memberRow.id]
  );
  const next = cleared.rows[0] || memberRow;
  return (await syncMemberDiscoverableFromPolicy(next)) || next;
}

export async function getDiscreetMembershipForIdentity({ email, phone }) {
  if (!isDatabaseReady()) return resolveDiscreetStatus(null);
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member) return resolveDiscreetStatus(null);
  const healed = await expireDiscreetMembershipIfNeeded(member);
  return {
    ...resolveDiscreetStatus(healed),
    profileId: healed?.id || null
  };
}
