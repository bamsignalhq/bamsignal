/**
 * Server-side boost entitlements — granted only by payment fortress after successful Paystack payment.
 */
import { isDatabaseReady, normalizeUserKey, query } from "../db.js";

const SHOP_BOOST_IDS = new Set([
  "signal-boost",
  "priority-signal-once",
  "profile-boost",
  "city-boost",
  "city-spotlight"
]);

export async function ensureMemberBoostsTable() {
  await query(`
    create table if not exists app_member_boosts (
      id uuid primary key default gen_random_uuid(),
      user_key text not null,
      product_id text not null,
      activated_at timestamptz not null default now(),
      expires_at timestamptz,
      status text not null default 'active',
      consumed boolean not null default false,
      paystack_reference text,
      city text,
      created_at timestamptz not null default now()
    )
  `);
  await query(`
    create unique index if not exists app_member_boosts_paystack_reference_uidx
      on app_member_boosts (paystack_reference)
      where paystack_reference is not null and paystack_reference <> ''
  `).catch(() => null);
  await query(`
    create index if not exists app_member_boosts_user_active_idx
      on app_member_boosts (user_key, status, expires_at desc)
  `).catch(() => null);
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

  await ensureMemberBoostsTable();
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
