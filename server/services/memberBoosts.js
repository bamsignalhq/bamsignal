/**
 * Server-side boost entitlements — granted only by payment fortress after successful Paystack payment.
 * Schema: migrations/0038_member_boost_entitlements.sql
 */
import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { assertSchemaTable } from "./schemaVerification.js";

const SHOP_BOOST_IDS = new Set([
  "signal-boost",
  "priority-signal-once",
  "profile-boost",
  "city-boost",
  "city-spotlight"
]);

export async function ensureMemberBoostsTable() {
  return assertSchemaTable("app_member_boosts");
}

/**
 * Grant a boost entitlement. Idempotent on paystack_reference.
 */
export async function activateMemberBoost({
  email,
  phone,
  boostId,
  expiresAt = null,
  paystackReference = null,
  city = ""
}) {
  if (!isDatabaseReady()) return null;
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return null;

  const productId = String(boostId || "").trim();
  if (!productId || !SHOP_BOOST_IDS.has(productId)) {
    return null;
  }

  await ensureMemberBoostsTable();

  const reference = paystackReference ? String(paystackReference).trim() : "";
  if (reference) {
    const existing = await query(
      "select * from app_member_boosts where paystack_reference = $1 limit 1",
      [reference]
    );
    if (existing.rows[0]) {
      return mapBoostRow(existing.rows[0]);
    }
  }

  const isPriority = productId === "priority-signal-once";
  const result = await query(
    `insert into app_member_boosts (
       user_key, product_id, activated_at, expires_at, status, consumed, paystack_reference, city
     ) values ($1, $2, now(), $3, 'active', $4, $5, $6)
     returning *`,
    [
      userKey,
      productId,
      isPriority ? null : expiresAt,
      false,
      reference || null,
      city || null
    ]
  );
  return mapBoostRow(result.rows[0]);
}

export async function listActiveMemberBoosts({ email, phone }) {
  if (!isDatabaseReady()) return [];
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return [];

  try {
    await ensureMemberBoostsTable();
  } catch {
    return [];
  }
  const result = await query(
    `select *
     from app_member_boosts
     where user_key = $1
       and status = 'active'
       and consumed = false
       and (expires_at is null or expires_at > now())
     order by activated_at desc`,
    [userKey]
  );
  return result.rows.map(mapBoostRow);
}

function mapBoostRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    activatedAt: row.activated_at ? new Date(row.activated_at).toISOString() : null,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    status: row.status || "active",
    consumed: Boolean(row.consumed),
    paystackReference: row.paystack_reference || null,
    city: row.city || "",
    memberDiscoverId: `member-${String(row.user_key || "").replace(/[^a-z0-9]/gi, "").toLowerCase()}`
  };
}
