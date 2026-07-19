/**
 * Phase 3D — Membership commerce engine.
 *
 * Payment → Membership Event → Activation → Entitlement snapshot.
 * Business logic must not check payment state; it consumes entitlements.
 */

import { activateAppUserPremium, findAppUserIdentity, isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { activateDiscreetMembership, expireDiscreetMembershipIfNeeded } from "./discreetMembership.js";
import { loadMembershipEntitlements } from "./membershipEntitlements.js";
import { PRIVACY_MODE, computeDiscoverableFlag } from "./memberVisibilityPolicy.js";
import {
  MEMBERSHIP_EVENT,
  EXPERIENCE_MODE,
  clampDays,
  computeEndsAt,
  normalizeExperienceMode
} from "../../shared/membershipCommerceHelpers.mjs";

export {
  MEMBERSHIP_EVENT,
  EXPERIENCE_MODE,
  clampDays,
  computeEndsAt,
  normalizeExperienceMode
};

async function recordMembershipEvent({
  eventType,
  memberId = null,
  userKey = null,
  experienceMode = null,
  productId = null,
  planId = null,
  sourcePaymentRef = null,
  actor = "system",
  metadata = {}
}) {
  if (!isDatabaseReady() || !eventType) return null;
  try {
    const result = await query(
      `insert into membership_events (
         event_type, member_id, user_key, experience_mode, product_id, plan_id,
         source_payment_ref, actor, metadata
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
       returning *`,
      [
        eventType,
        memberId || null,
        userKey || null,
        experienceMode || null,
        productId || null,
        planId || null,
        sourcePaymentRef || null,
        String(actor || "system").slice(0, 120),
        JSON.stringify(metadata || {})
      ]
    );
    return result.rows[0] || null;
  } catch (error) {
    // Unique violation on payment activation = duplicate callback (idempotent).
    if (String(error?.code) === "23505" && sourcePaymentRef) {
      const existing = await query(
        `select * from membership_events
         where source_payment_ref = $1
           and event_type = $2
         order by created_at desc
         limit 1`,
        [sourcePaymentRef, eventType]
      );
      return existing.rows[0] || null;
    }
    // Table may be absent until migrate — do not block fulfillment of legacy columns.
    return null;
  }
}

export async function findActivationEventForPayment(sourcePaymentRef) {
  if (!isDatabaseReady() || !sourcePaymentRef) return null;
  try {
    const result = await query(
      `select * from membership_events
       where source_payment_ref = $1
         and event_type in ('MEMBERSHIP_GRANTED', 'MEMBERSHIP_RENEWED')
       order by created_at desc
       limit 1`,
      [String(sourcePaymentRef).trim()]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

async function getActiveExperienceMembership(memberId, experienceMode) {
  if (!memberId || !experienceMode) return null;
  try {
    const result = await query(
      `select * from member_experience_memberships
       where member_id = $1
         and experience_mode = $2
         and status = 'active'
         and (ends_at is null or ends_at > now())
       order by ends_at desc nulls first
       limit 1`,
      [memberId, experienceMode]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

async function upsertExperienceMembership({
  memberId,
  experienceMode,
  productId,
  planId,
  endsAt,
  sourcePaymentRef,
  metadata = {}
}) {
  if (!memberId || !experienceMode) return null;
  try {
    const existing = await getActiveExperienceMembership(memberId, experienceMode);
    if (existing?.id) {
      const result = await query(
        `update member_experience_memberships
         set product_id = coalesce($2, product_id),
             plan_id = coalesce($3, plan_id),
             ends_at = $4::timestamptz,
             source_payment_ref = coalesce($5, source_payment_ref),
             metadata = coalesce(metadata, '{}'::jsonb) || $6::jsonb,
             status = 'active',
             updated_at = now()
         where id = $1
         returning *`,
        [
          existing.id,
          productId || null,
          planId || null,
          endsAt || null,
          sourcePaymentRef || null,
          JSON.stringify(metadata)
        ]
      );
      return { row: result.rows[0] || existing, renewed: true };
    }

    const result = await query(
      `insert into member_experience_memberships (
         member_id, experience_mode, product_id, plan_id, status,
         starts_at, ends_at, source_payment_ref, metadata
       ) values (
         $1, $2, $3, $4, 'active', now(), $5::timestamptz, $6, $7::jsonb
       )
       returning *`,
      [
        memberId,
        experienceMode,
        productId || null,
        planId || null,
        endsAt || null,
        sourcePaymentRef || null,
        JSON.stringify(metadata)
      ]
    );
    return { row: result.rows[0] || null, renewed: false };
  } catch {
    return null;
  }
}

async function resolveMemberContext({ email, phone, name }) {
  const user = await findAppUserIdentity({ email, phone });
  const member = await findMemberProfileByUserKey(email, phone);
  const userKey =
    user?.user_key || member?.user_key || normalizeUserKey({ email, phone }) || null;
  return { user, member, userKey, name: name || user?.name || member?.name || null };
}

async function applyDiscoverEffect({ email, phone, name, endsAt, paymentRef }) {
  return activateAppUserPremium({
    email: email || null,
    phone: phone || null,
    name: name || null,
    premiumUntil: endsAt,
    paystackReference: paymentRef || null,
    inviteLink: null
  });
}

async function applyDiscreetEffect({ email, phone, days, planId, productId, paymentRef, metadata }) {
  return activateDiscreetMembership({
    email,
    phone,
    days,
    planId,
    productId,
    paystackReference: paymentRef,
    metadata
  });
}

async function applyConciergeEffect({ memberId, endsAt, productId, planId, paymentRef, metadata }) {
  return upsertExperienceMembership({
    memberId,
    experienceMode: EXPERIENCE_MODE.CONCIERGE,
    productId: productId || "concierge",
    planId,
    endsAt,
    sourcePaymentRef: paymentRef,
    metadata
  });
}

async function clearDiscoverEffect({ email, phone }) {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `update app_users
     set is_premium = false,
         premium_until = case when premium_until > now() then now() else premium_until end,
         updated_at = now()
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     returning *`,
    [email || null, phone || null]
  );
  return result.rows[0] || null;
}

async function clearDiscreetEffect(memberRow) {
  if (!memberRow?.id) return null;
  const cleared = await query(
    `update app_member_profiles
     set privacy_mode = 'discover',
         discreet_until = null,
         updated_at = now()
     where id = $1
     returning *`,
    [memberRow.id]
  );
  const row = cleared.rows[0];
  if (!row) return null;
  const profile = row.profile || {};
  const discoverable = computeDiscoverableFlag({
    hideFromDiscovery: Boolean(profile.safetySettings?.hideFromDiscovery),
    paused: Boolean(row.profile_paused_at),
    accountStatus: row.account_status || "active",
    privacyMode: PRIVACY_MODE.DISCOVER,
    discreetUntil: null,
    clientDiscoverable: true
  });
  const synced = await query(
    `update app_member_profiles set discoverable = $2, updated_at = now() where id = $1 returning *`,
    [row.id, discoverable]
  );
  return synced.rows[0] || row;
}

async function markExperienceExpired(memberId, experienceMode) {
  if (!memberId || !experienceMode) return;
  try {
    await query(
      `update member_experience_memberships
       set status = 'expired', updated_at = now()
       where member_id = $1
         and experience_mode = $2
         and status = 'active'`,
      [memberId, experienceMode]
    );
  } catch {
    /* optional table */
  }
}

/**
 * Apply membership effects + GRANT/RENEW event. Does not emit PAYMENT_COMPLETED.
 */
async function applyMembershipActivation({
  mode,
  email,
  phone,
  name,
  days,
  productId,
  planId,
  paymentRef,
  actor,
  metadata,
  eventType
}) {
  const ctx = await resolveMemberContext({ email, phone, name });
  const memberId = ctx.member?.id || ctx.userKey;

  if ((mode === EXPERIENCE_MODE.DISCREET || mode === EXPERIENCE_MODE.CONCIERGE) && !ctx.member?.id) {
    return { ok: false, reason: "member_profile_required" };
  }

  const existingMembership = ctx.member?.id
    ? await getActiveExperienceMembership(ctx.member.id, mode)
    : null;
  const existingEnds =
    mode === EXPERIENCE_MODE.DISCOVER
      ? ctx.user?.premium_until
      : mode === EXPERIENCE_MODE.DISCREET
        ? ctx.member?.discreet_until
        : existingMembership?.ends_at;
  const renewing = Boolean(
    eventType === MEMBERSHIP_EVENT.MEMBERSHIP_RENEWED ||
      existingMembership ||
      (existingEnds && new Date(existingEnds).getTime() > Date.now())
  );
  const endsAt = computeEndsAt(existingEnds, days);
  const durationDays = clampDays(days);
  const resolvedEventType =
    eventType || (renewing ? MEMBERSHIP_EVENT.MEMBERSHIP_RENEWED : MEMBERSHIP_EVENT.MEMBERSHIP_GRANTED);

  let effect = null;
  if (mode === EXPERIENCE_MODE.DISCOVER) {
    effect = await applyDiscoverEffect({
      email,
      phone,
      name: ctx.name || name,
      endsAt,
      paymentRef
    });
    if (!effect) return { ok: false, reason: "discover_activation_failed" };
    await upsertExperienceMembership({
      memberId: memberId,
      experienceMode: mode,
      productId: productId || "discover",
      planId,
      endsAt,
      sourcePaymentRef: paymentRef,
      metadata
    });
  } else if (mode === EXPERIENCE_MODE.DISCREET) {
    effect = await applyDiscreetEffect({
      email,
      phone,
      days: durationDays,
      planId,
      productId: productId || "discreet",
      paymentRef,
      metadata
    });
    if (!effect?.ok) return { ok: false, reason: "discreet_activation_failed" };
  } else if (mode === EXPERIENCE_MODE.CONCIERGE) {
    effect = await applyConciergeEffect({
      memberId: ctx.member.id,
      endsAt,
      productId,
      planId,
      paymentRef,
      metadata
    });
    if (!effect?.row) return { ok: false, reason: "concierge_activation_failed" };
  }

  const event = await recordMembershipEvent({
    eventType: resolvedEventType,
    memberId: ctx.member?.id || null,
    userKey: ctx.userKey,
    experienceMode: mode,
    productId,
    planId,
    sourcePaymentRef: paymentRef,
    actor,
    metadata: {
      endsAt: mode === EXPERIENCE_MODE.DISCREET ? effect.discreetUntil || endsAt : endsAt,
      days: durationDays,
      renewed: renewing,
      ...metadata
    }
  });

  const entitlements = await loadMembershipEntitlements({ email, phone });
  return {
    ok: true,
    duplicate: false,
    renewed: renewing,
    experienceMode: mode,
    endsAt: mode === EXPERIENCE_MODE.DISCREET ? effect.discreetUntil || endsAt : endsAt,
    effect,
    event,
    entitlements,
    ctx
  };
}

/**
 * Core commercial activation — called after Payment Fortress verifies payment.
 * Idempotent on sourcePaymentRef.
 */
export async function activateMembershipFromPayment({
  experienceMode,
  email,
  phone = "",
  name = "",
  days = 30,
  productId = null,
  planId = null,
  paymentRef = null,
  ledgerSource = "verify",
  metadata = {}
} = {}) {
  const mode = normalizeExperienceMode(experienceMode);
  if (!mode) {
    return { ok: false, reason: "invalid_experience_mode" };
  }
  if (!isDatabaseReady()) {
    return { ok: false, reason: "database_unavailable" };
  }

  const ref = String(paymentRef || "").trim() || null;
  if (ref) {
    const prior = await findActivationEventForPayment(ref);
    if (prior) {
      const entitlements = await loadMembershipEntitlements({ email, phone });
      return {
        ok: true,
        duplicate: true,
        experienceMode: mode,
        event: prior,
        entitlements,
        endsAt: prior.metadata?.endsAt || null
      };
    }
  }

  const ctx = await resolveMemberContext({ email, phone, name });

  await recordMembershipEvent({
    eventType: MEMBERSHIP_EVENT.PAYMENT_COMPLETED,
    memberId: ctx.member?.id || null,
    userKey: ctx.userKey,
    experienceMode: mode,
    productId,
    planId,
    sourcePaymentRef: ref,
    actor: "payment_fortress",
    metadata: { ledgerSource, ...metadata }
  });

  return applyMembershipActivation({
    mode,
    email,
    phone,
    name,
    days,
    productId,
    planId,
    paymentRef: ref,
    actor: "payment_fortress",
    metadata: { ledgerSource, ...metadata }
  });
}

export async function grantMembershipManual({
  experienceMode,
  email,
  phone = "",
  days = 30,
  productId = null,
  planId = null,
  adminActor = "admin",
  metadata = {}
} = {}) {
  const mode = normalizeExperienceMode(experienceMode);
  if (!mode) return { ok: false, reason: "invalid_experience_mode" };
  if (!isDatabaseReady()) return { ok: false, reason: "database_unavailable" };

  const result = await applyMembershipActivation({
    mode,
    email,
    phone,
    days,
    productId,
    planId,
    paymentRef: null,
    actor: String(adminActor || "admin"),
    metadata: { ...metadata, source: "admin_grant" },
    eventType: MEMBERSHIP_EVENT.ADMIN_GRANTED
  });

  if (result.ok) {
    await recordMembershipEvent({
      eventType: MEMBERSHIP_EVENT.MEMBERSHIP_GRANTED,
      memberId: result.ctx?.member?.id || null,
      userKey: result.ctx?.userKey || null,
      experienceMode: mode,
      productId,
      planId,
      actor: String(adminActor || "admin"),
      metadata: { endsAt: result.endsAt, days: clampDays(days), source: "admin_grant", ...metadata }
    });
  }
  return result;
}

export async function revokeMembershipManual({
  experienceMode,
  email,
  phone = "",
  adminActor = "admin",
  reason = "",
  metadata = {}
} = {}) {
  const mode = normalizeExperienceMode(experienceMode);
  if (!mode) return { ok: false, reason: "invalid_experience_mode" };
  if (!isDatabaseReady()) return { ok: false, reason: "database_unavailable" };

  const ctx = await resolveMemberContext({ email, phone });
  if (mode === EXPERIENCE_MODE.DISCOVER) {
    await clearDiscoverEffect({ email, phone });
  } else if (mode === EXPERIENCE_MODE.DISCREET) {
    if (ctx.member) await clearDiscreetEffect(ctx.member);
  }
  await markExperienceExpired(ctx.member?.id || ctx.userKey, mode);

  await recordMembershipEvent({
    eventType: MEMBERSHIP_EVENT.ADMIN_REVOKED,
    memberId: ctx.member?.id || null,
    userKey: ctx.userKey,
    experienceMode: mode,
    actor: String(adminActor || "admin"),
    metadata: { reason: String(reason || "").slice(0, 500), ...metadata }
  });
  await recordMembershipEvent({
    eventType: MEMBERSHIP_EVENT.MEMBERSHIP_REVOKED,
    memberId: ctx.member?.id || null,
    userKey: ctx.userKey,
    experienceMode: mode,
    actor: String(adminActor || "admin"),
    metadata: { reason: String(reason || "").slice(0, 500), ...metadata }
  });

  const entitlements = await loadMembershipEntitlements({ email, phone });
  return { ok: true, experienceMode: mode, entitlements };
}

export async function applyMembershipRefund({
  experienceMode,
  email,
  phone = "",
  paymentRef = null,
  revoke = true,
  metadata = {}
} = {}) {
  const mode = normalizeExperienceMode(experienceMode) || EXPERIENCE_MODE.DISCOVER;
  const ctx = await resolveMemberContext({ email, phone });

  await recordMembershipEvent({
    eventType: MEMBERSHIP_EVENT.REFUND_APPLIED,
    memberId: ctx.member?.id || null,
    userKey: ctx.userKey,
    experienceMode: mode,
    sourcePaymentRef: paymentRef || null,
    actor: "payment_fortress",
    metadata
  });

  if (revoke) {
    return revokeMembershipManual({
      experienceMode: mode,
      email,
      phone,
      adminActor: "refund",
      reason: "refund_applied",
      metadata
    });
  }

  const entitlements = await loadMembershipEntitlements({ email, phone });
  return { ok: true, revoked: false, entitlements };
}

/**
 * Expire due memberships and emit MEMBERSHIP_EXPIRED events.
 */
export async function processExpiredMemberships({ limit = 100 } = {}) {
  if (!isDatabaseReady()) return { processed: 0 };
  let processed = 0;

  try {
    const due = await query(
      `select * from member_experience_memberships
       where status = 'active'
         and ends_at is not null
         and ends_at <= now()
       order by ends_at asc
       limit $1`,
      [Math.min(500, Math.max(1, limit))]
    );

    for (const row of due.rows) {
      await query(
        `update member_experience_memberships
         set status = 'expired', updated_at = now()
         where id = $1`,
        [row.id]
      );

      if (row.experience_mode === EXPERIENCE_MODE.DISCOVER) {
        // member_id may be profile id or user_key depending on activation path.
        const identity = await query(
          `select user_key from app_member_profiles where id = $1
           union
           select user_key from app_users where user_key = $1 or id::text = $1
           limit 1`,
          [row.member_id]
        ).catch(() => ({ rows: [] }));
        const userKey = identity.rows[0]?.user_key || row.member_id;
        await query(
          `update app_users
           set is_premium = false, updated_at = now()
           where user_key = $1
             and (premium_until is null or premium_until <= now())`,
          [userKey]
        ).catch(() => null);
      }

      if (row.experience_mode === EXPERIENCE_MODE.DISCREET) {
        const member = await query(`select * from app_member_profiles where id = $1 limit 1`, [
          row.member_id
        ]);
        if (member.rows[0]) {
          await expireDiscreetMembershipIfNeeded(member.rows[0]);
        }
      }

      await recordMembershipEvent({
        eventType: MEMBERSHIP_EVENT.MEMBERSHIP_EXPIRED,
        memberId: row.member_id,
        experienceMode: row.experience_mode,
        productId: row.product_id,
        planId: row.plan_id,
        sourcePaymentRef: row.source_payment_ref,
        actor: "expiration_hook",
        metadata: { membershipId: row.id, endsAt: row.ends_at }
      });
      processed += 1;
    }
  } catch {
    return { processed };
  }

  return { processed };
}

/**
 * Member-facing Discreet purchase / renewal / refund history (audit trail).
 */
export async function listMembershipEventsForMember({
  email,
  phone = "",
  experienceMode = EXPERIENCE_MODE.DISCREET,
  limit = 40
} = {}) {
  if (!isDatabaseReady()) return [];
  const ctx = await resolveMemberContext({ email, phone });
  const mode = normalizeExperienceMode(experienceMode) || EXPERIENCE_MODE.DISCREET;
  try {
    const result = await query(
      `select *
       from membership_events
       where experience_mode = $1
         and (
           ($2::text is not null and member_id = $2)
           or ($3::text is not null and user_key = $3)
         )
       order by created_at desc
       limit $4`,
      [
        mode,
        ctx.member?.id || null,
        ctx.userKey || null,
        Math.min(200, Math.max(1, Number(limit) || 40))
      ]
    );
    return result.rows;
  } catch {
    return [];
  }
}

/** Admin audit — recent Discreet commerce events (grants, renewals, refunds, expiry). */
export async function listDiscreetMembershipAdminEvents({ limit = 50 } = {}) {
  if (!isDatabaseReady()) return { events: [], activeMemberships: [] };
  try {
    const [events, active] = await Promise.all([
      query(
        `select *
         from membership_events
         where experience_mode = 'discreet'
         order by created_at desc
         limit $1`,
        [Math.min(200, Math.max(1, Number(limit) || 50))]
      ),
      query(
        `select *
         from member_experience_memberships
         where experience_mode = 'discreet'
           and status = 'active'
           and (ends_at is null or ends_at > now())
         order by ends_at asc nulls first
         limit $1`,
        [Math.min(100, Math.max(1, Number(limit) || 50))]
      )
    ]);
    return { events: events.rows, activeMemberships: active.rows };
  } catch {
    return { events: [], activeMemberships: [] };
  }
}
