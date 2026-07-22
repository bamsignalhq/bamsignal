import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const TABLE = "member_financial_lifecycle_log";

export const FINANCIAL_STATUSES = Object.freeze([
  "initialized",
  "pending",
  "processing",
  "successful",
  "failed",
  "cancelled",
  "refunded",
  "reversed",
  "expired"
]);

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(TABLE);
    return true;
  } catch {
    return false;
  }
}

export async function transitionFinancialLifecycle(input = {}) {
  const newStatus = String(input.newStatus || "").trim();
  if (!FINANCIAL_STATUSES.includes(newStatus)) {
    return { ok: false, error: "invalid_status" };
  }
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const transactionId = String(input.transactionId || input.reference || "").trim();
  if (!transactionId) return { ok: false, error: "missing_transaction_id" };

  const logId = String(input.logId || crypto.randomUUID());
  const previousStatus = String(input.previousStatus || "unknown");

  try {
    await query(
      `insert into member_financial_lifecycle_log (
         log_id, transaction_id, reference, previous_status, new_status,
         reason_code, reason, actor, actor_role, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
       on conflict (log_id) do nothing`,
      [
        logId,
        transactionId,
        input.reference || null,
        previousStatus,
        newStatus,
        String(input.reasonCode || "system"),
        String(input.reason || "").slice(0, 500),
        String(input.actor || "system"),
        ["member", "admin", "system", "gateway"].includes(input.actorRole)
          ? input.actorRole
          : "system",
        JSON.stringify(input.metadata && typeof input.metadata === "object" ? input.metadata : {})
      ]
    );
    return { ok: true, logId, previousStatus, newStatus };
  } catch (error) {
    console.warn("[finance:lifecycle] transition failed", error?.message || error);
    return { ok: false, error: error?.message || "transition_failed" };
  }
}

export async function listFinancialLifecycleTransitions(transactionId, options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, previous_status, new_status, reason_code, reason, actor, actor_role, occurred_at
     from member_financial_lifecycle_log
     where transaction_id = $1
     order by occurred_at desc
     limit $2`,
    [transactionId, limit]
  );
  return rows;
}
