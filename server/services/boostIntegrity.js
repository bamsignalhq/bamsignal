/**
 * Boost activation integrity — database is the authority.
 * A boost is ACTIVE only when fulfillment, entitlement, audit, and expiry align.
 */
import { isDatabaseReady, normalizeUserKey, pool, query } from "../db.js";
import { boostExpiresAtFromIntent } from "./paymentCatalog.js";
import { appendPaymentAudit } from "./paymentEvents.js";
import { getPaymentFulfillment } from "./paymentFulfillments.js";
import { PaymentDatabaseError } from "./paymentDb.js";
import {
  activateMemberBoost,
  getBoostEntitlementByReference,
  mapBoostRow
} from "./memberBoosts.js";

const SHOP_BOOST_IDS = new Set([
  "signal-boost",
  "priority-signal-once",
  "profile-boost"
]);

export function isShopBoostProduct(boostId) {
  return SHOP_BOOST_IDS.has(String(boostId || "").trim());
}

export class BoostIntegrityError extends Error {
  constructor(message, code = "boost_integrity_failed") {
    super(message);
    this.name = "BoostIntegrityError";
    this.code = code;
  }
}

export async function getBoostEntitlementRow(reference) {
  return getBoostEntitlementByReference(reference);
}

export async function isBoostEntitlementActive(row) {
  if (!row) return false;
  if (row.status !== "active" || row.consumed) return false;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return false;
  return true;
}

/** Single source of truth — all gates must pass. */
export async function evaluateBoostActivationIntegrity(reference, { email = "", phone = "" } = {}) {
  const paystackReference = String(reference || "").trim();
  if (!paystackReference) {
    return { ok: false, reason: "missing_reference", fulfillment: null, entitlement: null };
  }

  const fulfillment = await getPaymentFulfillment(paystackReference);
  if (!fulfillment || fulfillment.status !== "fulfilled") {
    return { ok: false, reason: "fulfillment_not_fulfilled", fulfillment, entitlement: null };
  }

  const entitlement = await getBoostEntitlementRow(paystackReference);
  if (!entitlement) {
    return { ok: false, reason: "missing_entitlement", fulfillment, entitlement: null };
  }

  if (!(await isBoostEntitlementActive(entitlement))) {
    return { ok: false, reason: "entitlement_inactive", fulfillment, entitlement };
  }

  const userKey = normalizeUserKey({ email, phone });
  if (userKey && entitlement.user_key && entitlement.user_key !== userKey) {
    return { ok: false, reason: "identity_mismatch", fulfillment, entitlement };
  }

  return {
    ok: true,
    reason: "active",
    fulfillment,
    entitlement: mapBoostRow(entitlement)
  };
}

export async function findFulfilledBoostsMissingEntitlements(limit = 100) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select pf.paystack_reference,
            pf.product_id,
            pf.user_id,
            pf.fulfilled_at,
            pf.raw_payload
     from payment_fulfillments pf
     left join app_member_boosts amb on amb.paystack_reference = pf.paystack_reference
     where pf.status = 'fulfilled'
       and pf.product_type = 'boost'
       and amb.id is null
     order by pf.fulfilled_at desc nulls last
     limit $1`,
    [Math.max(1, Math.min(500, Number(limit) || 100))]
  );
  return result.rows;
}

async function resolveIdentityFromFulfillment(row, ctx) {
  if (ctx.email || ctx.phone) return ctx;
  const userId = String(row?.user_id || "").trim();
  if (!userId) return ctx;
  const result = await query(
    "select email, phone from app_users where id = $1 limit 1",
    [userId]
  );
  const user = result.rows[0];
  if (!user) return ctx;
  return {
    ...ctx,
    email: ctx.email || String(user.email || "").toLowerCase(),
    phone: ctx.phone || String(user.phone || "").replace(/\D/g, "").replace(/^234/, "")
  };
}

function extractBoostContextFromFulfillment(row) {
  const raw = row?.raw_payload || {};
  const purchaseIntent = raw.purchaseIntent || {};
  const transaction = raw.transaction || {};
  const metadata = transaction?.metadata || {};
  const activation = raw.activation || {};

  return {
    boostId: String(
      purchaseIntent.boostId || purchaseIntent.productId || row.product_id || activation.boostId || ""
    ).trim(),
    email: String(metadata.email || transaction?.customer?.email || "").toLowerCase(),
    phone: String(metadata.phone || metadata.phone_number || "").replace(/\D/g, "").replace(/^234/, ""),
    city: String(metadata.city || activation.city || "").trim(),
    expiresAt: activation.expiresAt || purchaseIntent.durationHours || null
  };
}

export async function repairBoostEntitlementForReference(reference, { dryRun = false, source = "repair_command" } = {}) {
  const paystackReference = String(reference || "").trim();
  if (!paystackReference) {
    return { ok: false, error: "reference_required" };
  }

  const existing = await getBoostEntitlementRow(paystackReference);
  if (existing) {
    return {
      ok: true,
      idempotent: true,
      entitlementId: existing.id,
      paystackReference
    };
  }

  const fulfillment = await getPaymentFulfillment(paystackReference);
  if (!fulfillment || fulfillment.status !== "fulfilled" || fulfillment.product_type !== "boost") {
    return { ok: false, error: "fulfillment_not_eligible", status: fulfillment?.status || null };
  }

  let ctx = extractBoostContextFromFulfillment(fulfillment);
  ctx = await resolveIdentityFromFulfillment(fulfillment, ctx);
  if (!ctx.boostId) {
    return { ok: false, error: "boost_id_unknown" };
  }
  if (!ctx.email && !ctx.phone) {
    return { ok: false, error: "identity_unknown" };
  }

  if (dryRun) {
    await logBoostRepair({
      paystackReference,
      userKey: normalizeUserKey({ email: ctx.email, phone: ctx.phone }),
      productId: ctx.boostId,
      entitlementId: null,
      dryRun: true,
      source,
      detail: { action: "would_create", ctx }
    });
    return { ok: true, dryRun: true, wouldCreate: true, paystackReference, boostId: ctx.boostId };
  }

  const boostRow = await activateMemberBoost({
    email: ctx.email || null,
    phone: ctx.phone || null,
    boostId: ctx.boostId,
    paystackReference,
    city: ctx.city
  }, { requireRow: true });

  if (!boostRow?.id) {
    return { ok: false, error: "activation_failed" };
  }

  await query(
    `update payment_fulfillments
     set entitlement_id = $2, updated_at = now()
     where paystack_reference = $1
       and entitlement_id is null`,
    [paystackReference, boostRow.id]
  );

  await appendPaymentAudit(paystackReference, "boost_entitlement_repaired", {
    entitlementId: boostRow.id,
    productId: ctx.boostId,
    userEmail: ctx.email || null,
    source
  });

  await logBoostRepair({
    paystackReference,
    userKey: normalizeUserKey({ email: ctx.email, phone: ctx.phone }),
    productId: ctx.boostId,
    entitlementId: boostRow.id,
    dryRun: false,
    source,
    detail: { action: "created", entitlementId: boostRow.id }
  });

  return { ok: true, idempotent: false, entitlementId: boostRow.id, boost: boostRow, paystackReference };
}

export async function repairAllMissingBoostEntitlements({ dryRun = false, limit = 100, source = "repair_command" } = {}) {
  const rows = await findFulfilledBoostsMissingEntitlements(limit);
  const results = [];
  for (const row of rows) {
    const outcome = await repairBoostEntitlementForReference(row.paystack_reference, { dryRun, source });
    results.push({ reference: row.paystack_reference, ...outcome });
  }
  return {
    scanned: rows.length,
    repaired: results.filter((r) => r.ok && !r.idempotent && !r.dryRun).length,
    idempotent: results.filter((r) => r.idempotent).length,
    failed: results.filter((r) => !r.ok).length,
    dryRun,
    results
  };
}

async function logBoostRepair({
  paystackReference,
  userKey,
  productId,
  entitlementId,
  dryRun,
  source,
  detail
}) {
  if (!isDatabaseReady()) return;
  await query(
    `insert into boost_activation_repairs (
       paystack_reference, user_key, product_id, entitlement_id, action, dry_run, source, detail
     ) values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
    [
      paystackReference,
      userKey,
      productId,
      entitlementId,
      detail?.action || "created",
      Boolean(dryRun),
      source,
      JSON.stringify(detail || {})
    ]
  ).catch(() => null);
}

export async function getBoostIntegrityDashboard(limit = 25) {
  const missing = await findFulfilledBoostsMissingEntitlements(limit);
  const pending = await query(
    `select paystack_reference, product_id, status, updated_at
     from payment_fulfillments
     where product_type = 'boost'
       and status in ('pending', 'processing')
     order by updated_at desc
     limit $1`,
    [limit]
  );
  const failed = await query(
    `select paystack_reference, product_id, status, updated_at
     from payment_fulfillments
     where product_type = 'boost'
       and status = 'failed'
     order by updated_at desc
     limit $1`,
    [limit]
  );
  const recentRepairs = await query(
    `select paystack_reference, product_id, entitlement_id, dry_run, source, created_at
     from boost_activation_repairs
     order by created_at desc
     limit $1`,
    [limit]
  );
  const recentBoostPayments = await query(
    `select paystack_reference, product_id, status, fulfilled_at, entitlement_id
     from payment_fulfillments
     where product_type = 'boost'
     order by coalesce(fulfilled_at, updated_at) desc
     limit $1`,
    [limit]
  );

  return {
    boostPayments: recentBoostPayments.rows,
    pendingFulfillments: pending.rows,
    missingEntitlements: missing,
    failedActivations: failed.rows,
    repairQueue: missing.map((row) => ({
      paystackReference: row.paystack_reference,
      productId: row.product_id,
      fulfilledAt: row.fulfilled_at
    })),
    recentRepairs: recentRepairs.rows
  };
}

export async function fulfillBoostWithIntegrity({
  intent,
  email,
  phone,
  reference,
  city,
  transaction,
  ledgerSource = "verify",
  fulfillmentPatch = {}
}) {
  if (!pool || !isDatabaseReady()) {
    throw new PaymentDatabaseError();
  }

  const boostId = String(intent.boostId || intent.productId || "").trim();
  const isPriority = boostId === "priority-signal-once";
  const expiresAt = isPriority ? null : boostExpiresAtFromIntent(intent);
  const patch = fulfillmentPatch && typeof fulfillmentPatch === "object" ? fulfillmentPatch : {};

  const client = await pool.connect();
  try {
    await client.query("begin");

    const boostRow = await activateMemberBoost(
      {
        email: email || null,
        phone: phone || null,
        boostId,
        expiresAt,
        paystackReference: reference,
        city: city || transaction?.metadata?.city || ""
      },
      { client, requireRow: true }
    );

    await client.query(
      `update payment_fulfillments
       set status = 'fulfilled',
           fulfilled_at = coalesce(fulfilled_at, now()),
           processing_started_at = null,
           entitlement_id = $2,
           user_id = coalesce($3, user_id),
           product_type = coalesce($4, product_type),
           product_id = coalesce($5, product_id),
           amount_kobo = coalesce($6, amount_kobo),
           currency = coalesce($7, currency),
           raw_payload = raw_payload || $8::jsonb,
           updated_at = now()
       where paystack_reference = $1`,
      [
        reference,
        boostRow.id,
        patch.userId ?? null,
        patch.productType ?? intent.productType ?? null,
        patch.productId ?? intent.productId ?? null,
        Number.isFinite(Number(patch.amountKobo)) ? Number(patch.amountKobo) : null,
        patch.currency ? String(patch.currency).trim() : null,
        JSON.stringify(patch.rawPayload && typeof patch.rawPayload === "object" ? patch.rawPayload : {})
      ]
    );

    await client.query("commit");

    await appendPaymentAudit(reference, "boost_entitlement_granted", {
      entitlementId: boostRow.id,
      productId: boostRow.productId,
      userEmail: email || transaction?.customer?.email || transaction?.metadata?.email || null,
      verificationSource: ledgerSource,
      activatedAt: boostRow.activatedAt,
      expiresAt: boostRow.expiresAt,
      paystackReference: reference
    });

    return {
      ok: true,
      productType: "boost",
      productId: intent.productId,
      boostId: boostRow.productId,
      expiresAt: boostRow.expiresAt,
      boost: boostRow,
      entitlementId: boostRow.id,
      fulfillmentCommitted: true
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
