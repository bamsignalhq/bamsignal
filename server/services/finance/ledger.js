import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { transitionFinancialLifecycle } from "./lifecycle.js";
import { incrementFinancialMetric } from "./observability.js";
import { resolveFinancialIdempotencyKey } from "./idempotency.js";
import { publishFinancialEvent } from "./eventBus.js";

const TABLE = "member_financial_ledger";

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(TABLE);
    return true;
  } catch {
    return false;
  }
}

function transactionIdFromReference(reference = "") {
  return String(reference || "").trim() || crypto.randomUUID();
}

/**
 * Append immutable ledger entry. Never updates existing rows.
 */
export async function appendFinancialLedgerEntry(input = {}) {
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const reference = String(input.reference || "").trim() || null;
  const transactionId = String(input.transactionId || transactionIdFromReference(reference));
  const idempotencyKey = resolveFinancialIdempotencyKey({ ...input, reference, transactionId });
  const entryId = String(input.entryId || idempotencyKey).slice(0, 120);

  const amountKobo = Number(input.amountKobo) || 0;
  const feeKobo = Number(input.feeKobo) || 0;
  const taxKobo = Number(input.taxKobo) || 0;
  const netKobo = Number.isFinite(Number(input.netKobo))
    ? Number(input.netKobo)
    : amountKobo - feeKobo - taxKobo;

  const lifecycleStatus = String(input.lifecycleStatus || "initialized");

  try {
    const insert = await query(
      `insert into member_financial_ledger (
         entry_id, idempotency_key, transaction_id, reference, gateway_reference,
         member_id, auth_user_id, user_key,
         amount_kobo, currency, tax_kobo, fee_kobo, net_kobo,
         product_type, product_id, purpose, source, destination,
         entry_type, lifecycle_status, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb)
       on conflict (idempotency_key) do nothing
       returning entry_id, idempotency_key`,
      [
        entryId,
        idempotencyKey,
        transactionId,
        reference,
        input.gatewayReference || null,
        input.memberId || null,
        input.authUserId || null,
        input.userKey || null,
        amountKobo,
        String(input.currency || "NGN").slice(0, 8),
        taxKobo,
        feeKobo,
        netKobo,
        input.productType || null,
        input.productId || null,
        String(input.purpose || "purchase"),
        String(input.source || "paystack"),
        String(input.destination || "bamsignal"),
        ["credit", "debit", "adjustment"].includes(input.entryType) ? input.entryType : "credit",
        lifecycleStatus,
        JSON.stringify({
          ...(input.metadata && typeof input.metadata === "object" ? input.metadata : {}),
          idempotencyKey
        })
      ]
    );

    const inserted = Boolean(insert.rows[0]);
    if (!inserted) {
      return { ok: true, duplicate: true, entryId, idempotencyKey, transactionId };
    }

    if (input.recordLifecycle !== false) {
      await transitionFinancialLifecycle({
        transactionId,
        reference,
        previousStatus: input.previousStatus || "unknown",
        newStatus: lifecycleStatus,
        reasonCode: input.reasonCode || "ledger_write",
        reason: input.reason || "Ledger entry appended",
        actorRole: input.actorRole || "system",
        metadata: { entryId, idempotencyKey }
      });
    }

    if (lifecycleStatus === "successful") incrementFinancialMetric("successfulPayments");
    if (lifecycleStatus === "failed") incrementFinancialMetric("failedPayments");

    await publishFinancialEvent({
      ...input,
      reference,
      transactionId,
      idempotencyKey,
      lifecycleStatus,
      amountKobo,
      productType: input.productType,
      productId: input.productId
    });

    return { ok: true, entryId, idempotencyKey, transactionId };
  } catch (error) {
    console.warn("[finance:ledger] append failed", error?.message || error);
    return { ok: false, error: error?.message || "append_failed" };
  }
}

export async function getLedgerEntriesByReference(reference) {
  if (!(await ensureTable()) || !reference) return [];
  const { rows } = await query(
    `select entry_id, idempotency_key, transaction_id, reference, amount_kobo, net_kobo, fee_kobo,
            product_type, product_id, purpose, lifecycle_status, created_at
     from member_financial_ledger
     where reference = $1
     order by created_at asc`,
    [reference]
  );
  return rows;
}

export async function getLedgerEntriesForMember(memberId, options = {}) {
  if (!(await ensureTable()) || !memberId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select entry_id, idempotency_key, transaction_id, reference, amount_kobo, net_kobo,
            product_type, product_id, purpose, lifecycle_status, created_at
     from member_financial_ledger
     where member_id = $1
     order by created_at desc
     limit $2`,
    [memberId, limit]
  );
  return rows;
}

export async function searchLedgerEntries(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select entry_id, idempotency_key, transaction_id, reference, member_id, amount_kobo, net_kobo,
            product_type, product_id, lifecycle_status, created_at
     from member_financial_ledger
     where ($1::text is null or reference = $1)
       and ($2::text is null or lifecycle_status = $2)
     order by created_at desc
     limit $3`,
    [options.reference || null, options.status || null, limit]
  );
  return rows;
}

/** Payment hook — record initialize → pending, verify → processing/successful, fail → failed */
export async function recordPaymentLedgerEvent(input = {}) {
  const reference = String(input.reference || "").trim();
  if (!reference) return { ok: false, skipped: true };

  const lifecycleStatus = String(input.lifecycleStatus || "pending");
  const previousStatus = String(input.previousStatus || "initialized");

  return appendFinancialLedgerEntry({
    ...input,
    entryId: input.entryId,
    transactionId: reference,
    reference,
    gatewayReference: input.gatewayReference || input.transaction?.id || null,
    memberId: input.memberId || null,
    authUserId: input.authUserId || input.userId || null,
    userKey: input.userKey || input.email || null,
    amountKobo: Number(input.amountKobo || input.transaction?.amount || 0),
    currency: input.currency || input.transaction?.currency || "NGN",
    feeKobo: Number(input.feeKobo || 0),
    taxKobo: Number(input.taxKobo || 0),
    productType: input.productType || null,
    productId: input.productId || null,
    purpose: input.purpose || input.productType || "purchase",
    source: input.source || "paystack",
    destination: "bamsignal",
    entryType: "credit",
    lifecycleStatus,
    previousStatus,
    reasonCode: input.reasonCode || lifecycleStatus,
    reason: input.reason || "",
    actorRole: input.actorRole || "system",
    metadata: {
      ledgerSource: input.ledgerSource || null,
      webhookEventId: input.webhookEventId || null,
      ...(input.metadata || {})
    }
  });
}
