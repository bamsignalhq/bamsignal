/**
 * Internal Passport Signal Admin API — governance and operations.
 * Protected by existing admin authentication. No public access.
 */

import { getDatabaseStatus } from "../../../server/db.js";
import { requireAdmin } from "../../../server/adminAuth.js";
import { ensureApiRequestContext, sendLoggedApiError } from "../../../server/services/apiErrorResponse.js";
import {
  getSignalById,
  listSignalsForAdmin,
  mapRowToValidatedSignal
} from "../../../server/services/passportSignals/persistence.js";
import {
  applyGovernanceAction,
  approveSignal,
  rejectSignal,
  revokeSignal,
  restoreSignal,
  quarantineSignal,
  listGovernanceActions
} from "../../../server/services/passportSignals/governance/actions.js";
import {
  listSignalHistory,
  getRetentionMetadata
} from "../../../server/services/passportSignals/governance/index.js";
import { listReviewQueue } from "../../../server/services/passportSignals/governance/reviewQueue.js";
import { buildGovernanceDashboardSnapshot } from "../../../server/services/passportSignals/governance/dashboardContract.js";
import {
  isPassportSignalError,
  PassportSignalDatabaseError
} from "../../../server/services/passportSignals/errors.js";
import { ingestionErrorResponse } from "../../../server/services/passportSignals/ingestion.js";

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

function requireDatabase(res) {
  if (getDatabaseStatus() !== "connected") {
    res.status(503).json({ ok: false, error: "database_unavailable" });
    return false;
  }
  return true;
}

function resolveAdminActor(req, body = {}) {
  const explicit = String(body.actor || req.headers["x-admin-actor"] || "").trim();
  return explicit || "admin";
}

function governanceBody(body = {}) {
  return {
    reasonCode: String(body.reasonCode || "manual_review").trim(),
    reason: String(body.reason || body.note || "").trim(),
    annotation: body.annotation ? String(body.annotation) : null
  };
}

export default async function passportAdminSignalsHandler(req, res) {
  ensureApiRequestContext(req, res);
  const method = String(req.method || "GET").toUpperCase();
  const signalId = req.params?.signalId ? decodeURIComponent(req.params.signalId) : null;
  const subAction = req.params?.action ? decodeURIComponent(req.params.action) : null;

  try {
    if (!(await requireAdmin(req, res))) return;
    if (!requireDatabase(res)) return;

    if (method === "GET" && !signalId) {
      const status = req.query?.status ? String(req.query.status) : null;
      const contributorId = req.query?.contributorId ? String(req.query.contributorId) : null;
      const passportId = req.query?.passportId ? String(req.query.passportId) : null;
      const limit = Math.max(1, Math.min(100, Number(req.query?.limit) || 50));
      const offset = Math.max(0, Number(req.query?.offset) || 0);

      if (req.query?.dashboard === "1") {
        const dashboard = await buildGovernanceDashboardSnapshot();
        return res.status(200).json({ ok: true, dashboard });
      }

      const signals = await listSignalsForAdmin({
        status,
        contributorId,
        passportId,
        limit,
        offset
      });
      return res.status(200).json({
        ok: true,
        signals: signals.map((row) => mapRowToValidatedSignal(row, row.provenance_id)),
        limit,
        offset
      });
    }

    if (method === "GET" && signalId && !subAction) {
      const row = await getSignalById(signalId);
      if (!row) {
        return res.status(404).json({ ok: false, error: "not_found" });
      }
      const [history, governanceActions, retention, queueItems] = await Promise.all([
        listSignalHistory(signalId),
        listGovernanceActions({ signalId, limit: 50 }),
        getRetentionMetadata(signalId),
        listReviewQueue({ limit: 5 })
      ]);
      const relatedQueue = queueItems.filter((item) => item.signalId === signalId);
      return res.status(200).json({
        ok: true,
        signal: mapRowToValidatedSignal(row, row.provenance_id),
        history,
        governanceActions,
        retention,
        reviewQueue: relatedQueue
      });
    }

    if (method === "POST" && signalId && subAction) {
      const body = parseBody(req);
      const actor = resolveAdminActor(req, body);
      const base = { signalId, actor, actorRole: "admin", ...governanceBody(body) };

      if (subAction === "review") {
        const decision = String(body.decision || body.action || "approve").trim().toLowerCase();
        const result =
          decision === "reject"
            ? await rejectSignal(base)
            : await approveSignal(base);
        return res.status(200).json({ ok: true, governance: result });
      }

      if (subAction === "revoke") {
        const result = await revokeSignal(base);
        return res.status(200).json({ ok: true, governance: result });
      }

      if (subAction === "restore") {
        const result = await restoreSignal(base);
        return res.status(200).json({ ok: true, governance: result });
      }

      if (subAction === "quarantine") {
        const result = await quarantineSignal(base);
        return res.status(200).json({ ok: true, governance: result });
      }

      if (subAction === "annotate") {
        const result = await applyGovernanceAction({ ...base, action: "annotate" });
        return res.status(200).json({ ok: true, governance: result });
      }

      if (subAction === "expire") {
        const result = await applyGovernanceAction({ ...base, action: "expire" });
        return res.status(200).json({ ok: true, governance: result });
      }

      return res.status(404).json({ ok: false, error: "not_found" });
    }

    return res.status(404).json({ ok: false, error: "not_found" });
  } catch (error) {
    if (isPassportSignalError(error)) {
      return res.status(error.status).json(ingestionErrorResponse(error));
    }
    if (error instanceof PassportSignalDatabaseError) {
      return res.status(503).json(ingestionErrorResponse(error));
    }
    return sendLoggedApiError(res, req, error, {
      fallbackMessage: "Passport signal admin request failed"
    });
  }
}
