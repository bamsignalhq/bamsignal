import { requireAdmin } from "../../server/adminAuth.js";
import { getDatabaseStatus } from "../../server/db.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";
import { buildAdminFinancialOperationsContract } from "../../server/services/finance/adminContract.js";
import {
  searchLedgerEntries,
  getLedgerEntriesByReference
} from "../../server/services/finance/ledger.js";
import {
  createRefundRecord,
  completeRefundRecord,
  listRefundRecords
} from "../../server/services/finance/refunds.js";
import { runFinancialReconciliation } from "../../server/services/finance/reconciliation.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!(await requireAdmin(req, res))) return;

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected.", database });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "dashboard").toLowerCase();

  try {
    if (action === "dashboard") {
      const contract = await buildAdminFinancialOperationsContract();
      return res.status(200).json({ ok: true, ...contract });
    }

    if (action === "search-transactions") {
      const transactions = await searchLedgerEntries({
        reference: body.reference || null,
        status: body.status || null,
        limit: body.limit
      });
      return res.status(200).json({ ok: true, transactions });
    }

    if (action === "transaction-detail") {
      const reference = String(body.reference || "").trim();
      if (!reference) {
        return res.status(400).json({ ok: false, error: "reference required" });
      }
      const entries = await getLedgerEntriesByReference(reference);
      return res.status(200).json({ ok: true, reference, entries });
    }

    if (action === "refund-queue") {
      const refunds = await listRefundRecords({ status: body.status || null, limit: body.limit });
      return res.status(200).json({ ok: true, refunds });
    }

    if (action === "create-refund") {
      const result = await createRefundRecord({
        transactionId: body.transactionId || body.reference,
        reference: body.reference || null,
        memberId: body.memberId || null,
        amountKobo: body.amountKobo,
        refundKind: body.refundKind || "manual",
        reason: body.reason || "",
        requestedBy: body.requestedBy || "admin"
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "complete-refund") {
      const refundId = String(body.refundId || "").trim();
      if (!refundId) {
        return res.status(400).json({ ok: false, error: "refundId required" });
      }
      const result = await completeRefundRecord(refundId, {
        success: body.success !== false,
        actor: "admin",
        metadata: body.metadata || {}
      });
      return res.status(result.ok ? 200 : 404).json(result);
    }

    if (action === "reconcile") {
      const result = await runFinancialReconciliation({
        limit: body.limit,
        actor: "admin"
      });
      return res.status(result.ok ? 200 : 500).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "finance_admin_error",
      error,
      status: 500,
      message: "Financial admin request failed.",
      context: { action }
    });
  }
}
