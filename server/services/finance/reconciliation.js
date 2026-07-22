import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { getLedgerEntriesByReference } from "./ledger.js";

const TABLE = "member_financial_reconciliation_runs";

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(TABLE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compare internal ledger vs payment_fulfillments vs payment_events.
 * Never modifies records — report only.
 */
export async function runFinancialReconciliation(options = {}) {
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const runId = String(options.runId || crypto.randomUUID());
  const limit = Math.min(Math.max(Number(options.limit) || 200, 1), 1000);
  const discrepancies = [];

  await query(
    `insert into member_financial_reconciliation_runs (run_id, status, metadata)
     values ($1, 'running', $2::jsonb)
     on conflict (run_id) do nothing`,
    [runId, JSON.stringify({ startedBy: options.actor || "system" })]
  );

  try {
    const fulfillments = await query(
      `select pf.paystack_reference, pf.status, pf.amount_kobo, pf.product_type, pf.product_id,
              pe.verified_at, pe.email_sent_at
       from payment_fulfillments pf
       left join payment_events pe on pe.paystack_reference = pf.paystack_reference
       order by pf.updated_at desc
       limit $1`,
      [limit]
    );

    let matched = 0;
    let missingLedger = 0;
    let statusMismatch = 0;

    for (const row of fulfillments.rows) {
      const reference = row.paystack_reference;
      const ledger = await getLedgerEntriesByReference(reference);
      const latestLedger = ledger[ledger.length - 1];

      if (!latestLedger) {
        missingLedger += 1;
        discrepancies.push({
          kind: "missing_ledger",
          reference,
          fulfillmentStatus: row.status
        });
        continue;
      }

      matched += 1;
      const fulfillmentSuccess = row.status === "fulfilled";
      const ledgerSuccess = latestLedger.lifecycle_status === "successful";
      if (fulfillmentSuccess !== ledgerSuccess) {
        statusMismatch += 1;
        discrepancies.push({
          kind: "status_mismatch",
          reference,
          fulfillmentStatus: row.status,
          ledgerStatus: latestLedger.lifecycle_status
        });
      }
    }

    const summary = {
      scanned: fulfillments.rows.length,
      matched,
      missingLedger,
      statusMismatch,
      discrepancyCount: discrepancies.length
    };

    await query(
      `update member_financial_reconciliation_runs
       set status = 'completed',
           summary = $2::jsonb,
           discrepancies = $3::jsonb,
           completed_at = now()
       where run_id = $1`,
      [runId, JSON.stringify(summary), JSON.stringify(discrepancies)]
    );

    return { ok: true, runId, summary, discrepancies };
  } catch (error) {
    await query(
      `update member_financial_reconciliation_runs
       set status = 'failed', completed_at = now(), metadata = metadata || $2::jsonb
       where run_id = $1`,
      [runId, JSON.stringify({ error: error?.message || "reconciliation_failed" })]
    );
    return { ok: false, runId, error: error?.message || "reconciliation_failed" };
  }
}

export async function getLatestReconciliationRun() {
  if (!(await ensureTable())) return null;
  const { rows } = await query(
    `select run_id, status, summary, discrepancies, started_at, completed_at
     from member_financial_reconciliation_runs
     order by started_at desc
     limit 1`
  );
  return rows[0] || null;
}
