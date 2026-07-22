import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { appendFinancialLedgerEntry } from "./ledger.js";
import { incrementFinancialMetric } from "./observability.js";
import { resolveRefundIdempotencyKey } from "./idempotency.js";
import { publishFinancialEvent } from "./eventBus.js";

const TABLE = "member_refund_records";

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(TABLE);
    return true;
  } catch {
    return false;
  }
}

export async function createRefundRecord(input = {}) {
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const refundId = String(input.refundId || crypto.randomUUID());
  const idempotencyKey = resolveRefundIdempotencyKey(refundId, "create");
  const transactionId = String(input.transactionId || input.reference || "").trim();
  if (!transactionId) return { ok: false, error: "missing_transaction_id" };

  const amountKobo = Number(input.amountKobo) || 0;
  if (amountKobo <= 0) return { ok: false, error: "invalid_amount" };

  try {
    const result = await query(
      `insert into member_refund_records (
         refund_id, idempotency_key, transaction_id, reference, member_id, amount_kobo, currency,
         refund_kind, status, reason, requested_by, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,$10,$11::jsonb)
       on conflict (idempotency_key) do nothing
       returning refund_id, idempotency_key`,
      [
        refundId,
        idempotencyKey,
        transactionId,
        input.reference || null,
        input.memberId || null,
        amountKobo,
        String(input.currency || "NGN"),
        ["manual", "gateway", "partial", "full"].includes(input.refundKind)
          ? input.refundKind
          : "manual",
        String(input.reason || "").slice(0, 500),
        input.requestedBy || null,
        JSON.stringify({ ...input.metadata, idempotencyKey })
      ]
    );

    if (!result.rows[0]) {
      return { ok: true, duplicate: true, refundId, idempotencyKey };
    }

    incrementFinancialMetric("refundRequests");
    await publishFinancialEvent({
      eventType: "refund.created",
      refundId,
      idempotencyKey,
      reference: input.reference || null,
      transactionId,
      memberId: input.memberId || null,
      amountKobo,
      refundKind: input.refundKind || "manual"
    });

    return { ok: true, refundId, idempotencyKey, status: "pending" };
  } catch (error) {
    console.warn("[finance:refunds] create failed", error?.message || error);
    return { ok: false, error: error?.message || "create_failed" };
  }
}

export async function completeRefundRecord(refundId, input = {}) {
  if (!(await ensureTable()) || !refundId) return { ok: false };

  const status = input.success === false ? "failed" : "completed";
  const result = await query(
    `update member_refund_records
     set status = $2,
         completed_at = case when $2 = 'completed' then now() else completed_at end,
         metadata = metadata || $3::jsonb,
         updated_at = now()
     where refund_id = $1 and status in ('pending', 'processing')
     returning *`,
    [
      refundId,
      status,
      JSON.stringify({ completedBy: input.actor || "admin", ...(input.metadata || {}) })
    ]
  );

  const row = result.rows[0];
  if (row && status === "completed") {
    incrementFinancialMetric("refunds");
    const completeKey = resolveRefundIdempotencyKey(refundId, "complete");
    await appendFinancialLedgerEntry({
      idempotencyKey: completeKey,
      transactionId: row.transaction_id,
      reference: row.reference,
      memberId: row.member_id,
      amountKobo: row.amount_kobo,
      netKobo: row.amount_kobo,
      entryType: "debit",
      lifecycleStatus: "refunded",
      previousStatus: "successful",
      purpose: "refund",
      source: row.refund_kind === "gateway" ? "paystack" : "admin",
      destination: "member",
      reasonCode: "refund_completed",
      metadata: { refundId, idempotencyKey: completeKey }
    });

    await publishFinancialEvent({
      eventType: "refund.completed",
      refundCompleted: true,
      refundId,
      idempotencyKey: completeKey,
      reference: row.reference,
      transactionId: row.transaction_id,
      memberId: row.member_id,
      amountKobo: row.amount_kobo
    });
  }

  return { ok: Boolean(row), refund: row || null };
}

export async function listRefundRecords(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select refund_id, idempotency_key, transaction_id, reference, member_id, amount_kobo,
            refund_kind, status, reason, created_at, completed_at
     from member_refund_records
     where ($1::text is null or status = $1)
     order by created_at desc
     limit $2`,
    [options.status || null, limit]
  );
  return rows;
}

export async function listRefundsForMember(memberId, options = {}) {
  if (!(await ensureTable()) || !memberId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select refund_id, idempotency_key, transaction_id, reference, amount_kobo, refund_kind, status, reason, created_at
     from member_refund_records
     where member_id = $1
     order by created_at desc
     limit $2`,
    [memberId, limit]
  );
  return rows;
}
