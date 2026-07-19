/**
 * Member-facing Concierge CX API — wraps Operations engine without redesigning it.
 * Admin workflow stays on /api/concierge-operations.
 */
import { getDatabaseStatus } from "../db.js";
import { requireMemberAuth } from "../services/memberAuth.js";
import {
  getConciergeCase,
  getConciergeInvoiceForMember,
  listMemberVisibleInvoices,
  submitConciergeApplication
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

export default async function conciergeMemberHandler(req, res) {
  const action = String(req.query?.action || req.body?.action || "")
    .trim()
    .toLowerCase();
  const body = parseBody(req);

  try {
    const memberAuth = await requireMemberAuth(req, body);
    if (!memberAuth?.ok || !memberAuth.memberId) {
      return res.status(memberAuth?.status || 401).json({
        ok: false,
        error: memberAuth?.error || "not_authorized"
      });
    }

    if (getDatabaseStatus() !== "connected") {
      return databaseUnavailable(res);
    }

    const memberId = String(memberAuth.memberId).trim();

    if (action === "my-case" || action === "case") {
      const result = await getConciergeCase(memberId);
      if (!result.ok) {
        return res.status(result.error === "case_not_found" ? 404 : 400).json(result);
      }
      // Strip internal private notes from member CX; hide draft invoices.
      const caseRow = result.case
        ? {
            ...result.case,
            privateNotes: undefined,
            private_notes: undefined
          }
        : null;
      const invoices = (result.invoices || []).filter((row) =>
        ["sent", "partially_paid", "paid", "overdue"].includes(String(row.status || ""))
      );
      const outstandingKobo = invoices
        .filter((row) => ["sent", "partially_paid", "overdue"].includes(String(row.status || "")))
        .reduce(
          (sum, row) =>
            sum + Math.max(0, Number(row.total_kobo || 0) - Number(row.amount_paid_kobo || 0)),
          0
        );
      const history = (result.history || []).map((event) => ({
        id: event.id,
        eventType: event.event_type,
        fromStatus: event.from_status,
        toStatus: event.to_status,
        notes: event.notes,
        createdAt: event.created_at,
        invoiceId: event.invoice_id,
        consultantId: event.consultant_id,
        metadata: event.metadata
      }));
      return res.status(200).json({
        ok: true,
        case: caseRow,
        history,
        invoices,
        payments: {
          outstandingKobo,
          paidCount: invoices.filter((row) => row.status === "paid").length,
          openCount: invoices.filter((row) =>
            ["sent", "partially_paid", "overdue"].includes(String(row.status || ""))
          ).length
        }
      });
    }

    if (action === "submit-application") {
      const result = await submitConciergeApplication({
        memberId,
        journeyId: body.journeyId,
        preferredTier: body.preferredTier,
        application: body.application || {},
        actor: "member"
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "list-invoices") {
      const invoices = await listMemberVisibleInvoices(memberId);
      return res.status(200).json({ ok: true, invoices });
    }

    if (action === "get-invoice") {
      const invoiceId = String(body.invoiceId || "").trim();
      const result = await getConciergeInvoiceForMember({ memberId, invoiceId });
      return res.status(result.ok ? 200 : 404).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unsupported action." });
  } catch (error) {
    logObservabilityEvent(
      "concierge_member_cx_failed",
      observabilityContext(req, {
        action,
        error: sanitizeApiErrorForLog(error).message
      }),
      "error"
    );
    return res.status(500).json({ ok: false, error: "Concierge member request failed." });
  }
}
