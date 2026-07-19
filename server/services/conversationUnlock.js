/**
 * Discover commerce — conversation unlock (Pass 1).
 * Payment Fortress verifies money; this module grants the unlock + match + audit event.
 * Does NOT grant Premium / unlimited signals / messaging entitlements.
 */

import { findAppUserIdentity, isDatabaseReady, normalizeUserKey, persistMatch, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import {
  CONVERSATION_UNLOCK_AMOUNT_KOBO,
  DISCOVER_PRODUCT,
  DISCOVER_PRODUCT_EVENT,
  conversationUnlockLabel,
  isConversationUnlockProductId
} from "../../shared/discoverCommerceHelpers.mjs";

export {
  CONVERSATION_UNLOCK_AMOUNT_KOBO,
  DISCOVER_PRODUCT,
  DISCOVER_PRODUCT_EVENT,
  conversationUnlockLabel,
  isConversationUnlockProductId
};

function buildMatchId(a, b) {
  return `m-${[String(a), String(b)].sort().join("-")}`;
}

async function recordDiscoverProductEvent({
  eventType,
  buyerUserKey = null,
  targetProfileId = null,
  productId = null,
  sourcePaymentRef = null,
  actor = "system",
  metadata = {}
}) {
  if (!isDatabaseReady() || !eventType) return null;
  try {
    const result = await query(
      `insert into discover_product_events (
         event_type, buyer_user_key, target_profile_id, product_id, source_payment_ref, actor, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7::jsonb)
       returning *`,
      [
        eventType,
        buyerUserKey,
        targetProfileId,
        productId,
        sourcePaymentRef,
        String(actor || "system").slice(0, 120),
        JSON.stringify(metadata || {})
      ]
    );
    return result.rows[0] || null;
  } catch (error) {
    if (String(error?.code) === "23505" && sourcePaymentRef) {
      const existing = await query(
        `select * from discover_product_events
         where source_payment_ref = $1 and event_type = $2
         order by created_at desc limit 1`,
        [sourcePaymentRef, eventType]
      );
      return existing.rows[0] || null;
    }
    return null;
  }
}

export async function hasConversationUnlock({ email, phone, targetProfileId }) {
  if (!isDatabaseReady() || !targetProfileId) return false;
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return false;
  try {
    const result = await query(
      `select id from app_conversation_unlocks
       where buyer_user_key = $1 and target_profile_id = $2
       limit 1`,
      [userKey, String(targetProfileId).trim()]
    );
    return Boolean(result.rows[0]);
  } catch {
    return false;
  }
}

export async function listConversationUnlocks({ email, phone, limit = 50 } = {}) {
  if (!isDatabaseReady()) return [];
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return [];
  try {
    const result = await query(
      `select * from app_conversation_unlocks
       where buyer_user_key = $1
       order by created_at desc
       limit $2`,
      [userKey, Math.min(200, Math.max(1, Number(limit) || 50))]
    );
    return result.rows;
  } catch {
    return [];
  }
}

export async function listAllConversationUnlocksAdmin({ limit = 100 } = {}) {
  if (!isDatabaseReady()) return [];
  try {
    const result = await query(
      `select * from app_conversation_unlocks
       order by created_at desc
       limit $1`,
      [Math.min(500, Math.max(1, Number(limit) || 100))]
    );
    return result.rows;
  } catch {
    return [];
  }
}

/**
 * Activate unlock after verified payment. Idempotent on payment ref.
 */
export async function activateConversationUnlockFromPayment({
  email,
  phone,
  name = "",
  targetProfileId,
  paymentRef,
  ledgerSource = "verify",
  metadata = {}
} = {}) {
  if (!isDatabaseReady()) {
    return { ok: false, reason: "database_unavailable", grantsPremium: false };
  }

  const targetId = String(targetProfileId || "").trim();
  if (!targetId) {
    return { ok: false, reason: "target_profile_required", grantsPremium: false };
  }

  const ref = String(paymentRef || "").trim();
  const user = await findAppUserIdentity({ email, phone });
  const buyer = await findMemberProfileByUserKey(email, phone);
  const userKey = user?.user_key || buyer?.user_key || normalizeUserKey({ email, phone });
  if (!userKey || !buyer?.id) {
    return { ok: false, reason: "buyer_profile_required", grantsPremium: false };
  }
  if (buyer.id === targetId) {
    return { ok: false, reason: "cannot_unlock_self", grantsPremium: false };
  }

  if (ref) {
    const prior = await query(
      `select * from app_conversation_unlocks where source_payment_ref = $1 limit 1`,
      [ref]
    ).catch(() => ({ rows: [] }));
    if (prior.rows[0]) {
      return {
        ok: true,
        duplicate: true,
        unlock: prior.rows[0],
        matchId: prior.rows[0].match_id,
        grantsPremium: false
      };
    }
  }

  const existingPair = await query(
    `select * from app_conversation_unlocks
     where buyer_user_key = $1 and target_profile_id = $2
     limit 1`,
    [userKey, targetId]
  ).catch(() => ({ rows: [] }));
  if (existingPair.rows[0]) {
    return {
      ok: true,
      duplicate: true,
      unlock: existingPair.rows[0],
      matchId: existingPair.rows[0].match_id,
      grantsPremium: false
    };
  }

  const target = await query(
    `select id, name, city, profile, updated_at from app_member_profiles where id = $1 limit 1`,
    [targetId]
  );
  const targetRow = target.rows[0];
  if (!targetRow) {
    return { ok: false, reason: "target_not_found", grantsPremium: false };
  }

  const photos = Array.isArray(targetRow.profile?.photos) ? targetRow.profile.photos : [];
  const matchId = buildMatchId(buyer.id, targetId);
  const match = {
    id: matchId,
    profileId: targetId,
    name: targetRow.name || "Member",
    photo: photos[0] || "",
    city: targetRow.city || "",
    matchedAt: new Date().toISOString(),
    lastActiveAt: targetRow.updated_at,
    source: "conversation_unlock"
  };

  await persistMatch({ email, phone, match });

  let unlockRow = null;
  try {
    const inserted = await query(
      `insert into app_conversation_unlocks (
         buyer_user_key, target_profile_id, match_id, source_payment_ref, actor, metadata
       ) values ($1,$2,$3,$4,$5,$6::jsonb)
       returning *`,
      [
        userKey,
        targetId,
        matchId,
        ref || null,
        "payment_fortress",
        JSON.stringify({
          ledgerSource,
          buyerName: name || buyer.name || null,
          targetName: targetRow.name || null,
          grantsPremium: false,
          ...metadata
        })
      ]
    );
    unlockRow = inserted.rows[0];
  } catch (error) {
    if (String(error?.code) === "23505") {
      const again = await query(
        `select * from app_conversation_unlocks
         where buyer_user_key = $1 and target_profile_id = $2
         limit 1`,
        [userKey, targetId]
      );
      return {
        ok: true,
        duplicate: true,
        unlock: again.rows[0],
        matchId: again.rows[0]?.match_id || matchId,
        grantsPremium: false
      };
    }
    throw error;
  }

  await recordDiscoverProductEvent({
    eventType: DISCOVER_PRODUCT_EVENT.PAYMENT_COMPLETED,
    buyerUserKey: userKey,
    targetProfileId: targetId,
    productId: DISCOVER_PRODUCT.CONVERSATION_UNLOCK,
    sourcePaymentRef: ref || null,
    actor: "payment_fortress",
    metadata: { amountKobo: CONVERSATION_UNLOCK_AMOUNT_KOBO, ledgerSource }
  });

  await recordDiscoverProductEvent({
    eventType: DISCOVER_PRODUCT_EVENT.CONVERSATION_UNLOCKED,
    buyerUserKey: userKey,
    targetProfileId: targetId,
    productId: DISCOVER_PRODUCT.CONVERSATION_UNLOCK,
    sourcePaymentRef: ref || null,
    actor: "payment_fortress",
    metadata: { matchId, grantsPremium: false }
  });

  return {
    ok: true,
    duplicate: false,
    unlock: unlockRow,
    match,
    matchId,
    grantsPremium: false,
    productLabel: conversationUnlockLabel()
  };
}
