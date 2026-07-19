import { requireAdmin } from "../adminAuth.js";
import { getDatabaseStatus } from "../db.js";
import {
  acceptConciergeApplication,
  addConciergeCaseNote,
  assignConciergeConsultant,
  cancelConciergeInvoice,
  closeConciergeCase,
  completeConciergeCase,
  createConciergeInvoice,
  getConciergeCase,
  listConciergeCases,
  markConciergeInvoicePaid,
  recordConciergeProgress,
  rejectConciergeApplication,
  reopenConciergeCase,
  setConciergeCaseStatus,
  startConciergeReview,
  submitConciergeApplication,
  transferConciergeConsultant
} from "../services/conciergeOperations.js";
import { logObservabilityEvent, observabilityContext } from "../services/observability.js";
import { sanitizeApiErrorForLog } from "../services/errorResponse.js";

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

function databaseUnavailable(res) {
  return res.status(503).json({
    ok: false,
    error: "Database is not connected.",
    database: getDatabaseStatus()
  });
}

export default async function conciergeOperationsHandler(req, res) {
  const action = String(req.query?.action || req.body?.action || "")
    .trim()
    .toLowerCase();
  const body = parseBody(req);

  try {
    if (!(await requireAdmin(req, res))) return;
    if (getDatabaseStatus() !== "connected") {
      return databaseUnavailable(res);
    }

    if (action === "list-cases") {
      const result = await listConciergeCases({
        opsStatus: body.opsStatus,
        consultantId: body.consultantId,
        limit: body.limit
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "get-case") {
      const result = await getConciergeCase(body.memberId);
      return res.status(result.ok ? 200 : 404).json(result);
    }

    if (action === "submit-application") {
      const result = await submitConciergeApplication({
        memberId: body.memberId,
        journeyId: body.journeyId,
        preferredTier: body.preferredTier,
        application: body.application || {},
        actor: body.actor || "admin"
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "start-review") {
      const result = await startConciergeReview({
        memberId: body.memberId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "accept") {
      const result = await acceptConciergeApplication({
        memberId: body.memberId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "reject") {
      const result = await rejectConciergeApplication({
        memberId: body.memberId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "assign-consultant") {
      const result = await assignConciergeConsultant({
        memberId: body.memberId,
        consultantId: body.consultantId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "transfer-consultant") {
      const result = await transferConciergeConsultant({
        memberId: body.memberId,
        consultantId: body.consultantId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "add-note") {
      const result = await addConciergeCaseNote({
        memberId: body.memberId,
        note: body.note,
        actor: body.actor || "admin",
        internal: body.internal !== false
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "record-progress") {
      const result = await recordConciergeProgress({
        memberId: body.memberId,
        summary: body.summary,
        actor: body.actor || "consultant",
        advanceToInProgress: body.advanceToInProgress !== false
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "create-invoice") {
      const result = await createConciergeInvoice({
        memberId: body.memberId,
        lineItems: body.lineItems,
        notes: body.notes,
        dueAt: body.dueAt,
        consultantId: body.consultantId,
        actor: body.actor || "admin",
        send: Boolean(body.send)
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "mark-invoice-paid") {
      const result = await markConciergeInvoicePaid({
        invoiceId: body.invoiceId,
        paymentRef: body.paymentRef,
        amountPaidKobo: body.amountPaidKobo,
        actor: body.actor || "admin"
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "cancel-invoice") {
      const result = await cancelConciergeInvoice({
        invoiceId: body.invoiceId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "complete") {
      const result = await completeConciergeCase({
        memberId: body.memberId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "close") {
      const result = await closeConciergeCase({
        memberId: body.memberId,
        actor: body.actor || "admin",
        notes: body.notes
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "reopen") {
      const result = await reopenConciergeCase({
        memberId: body.memberId,
        actor: body.actor || "admin",
        notes: body.notes,
        toStatus: body.toStatus
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "set-status") {
      const result = await setConciergeCaseStatus({
        memberId: body.memberId,
        opsStatus: body.opsStatus,
        actor: body.actor || "admin",
        notes: body.notes,
        force: Boolean(body.force)
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    return res.status(400).json({
      ok: false,
      error: "Unknown action.",
      actions: [
        "list-cases",
        "get-case",
        "submit-application",
        "start-review",
        "accept",
        "reject",
        "assign-consultant",
        "transfer-consultant",
        "add-note",
        "record-progress",
        "create-invoice",
        "mark-invoice-paid",
        "cancel-invoice",
        "complete",
        "close",
        "reopen",
        "set-status"
      ]
    });
  } catch (error) {
    logObservabilityEvent({
      type: "concierge_operations_error",
      level: "error",
      ...observabilityContext(req),
      error: sanitizeApiErrorForLog(error)
    });
    return res.status(500).json({ ok: false, error: "Concierge operations failed." });
  }
}
