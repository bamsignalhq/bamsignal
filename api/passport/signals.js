/**
 * Internal Passport Signal API — contributor-authenticated ingestion and query.
 */

import { getDatabaseStatus } from "../../server/db.js";
import { ensureApiRequestContext, sendLoggedApiError } from "../../server/services/apiErrorResponse.js";
import {
  authorizeContributor,
  bootstrapContributorApiKey
} from "../../server/services/passportSignals/contributorAuth.js";
import {
  ingestTrustSignal,
  parseIngestionRequest,
  ingestionErrorResponse
} from "../../server/services/passportSignals/ingestion.js";
import {
  getSignalById,
  listSignalsForPassport,
  mapRowToValidatedSignal
} from "../../server/services/passportSignals/persistence.js";
import {
  isPassportSignalError,
  PassportSignalDatabaseError
} from "../../server/services/passportSignals/errors.js";
import { normalizePassportId } from "../../server/services/passportSignals/signalRegistry.js";
import { checkRateLimit } from "../../server/services/passportSignals/rateLimit.js";

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

async function enforceContributorRateLimit(req, res, contributorId) {
  const result = await checkRateLimit({
    req,
    endpoint: "passport_signal_ingest",
    scope: "passport_signal",
    memberHash: contributorId,
    limit: 120,
    windowMs: 60_000
  });
  if (!result.allowed) {
    res.status(429).json({ ok: false, error: "rate_limited" });
    return false;
  }
  return true;
}

export default async function passportSignalsHandler(req, res) {
  ensureApiRequestContext(req, res);
  const method = String(req.method || "GET").toUpperCase();

  try {
    if (method === "POST") {
      if (!requireDatabase(res)) return;
      const contributor = await authorizeContributor(req);
      if (!(await enforceContributorRateLimit(req, res, contributor.contributorId))) return;

      const body = parseBody(req);
      const { submission, idempotency } = parseIngestionRequest(body);
      const result = await ingestTrustSignal({ submission, idempotency, contributor });

      if (!result.ok) {
        return res.status(422).json(result);
      }

      return res.status(result.duplicate ? 200 : 201).json({
        ok: true,
        duplicate: Boolean(result.duplicate),
        signal: result.signal,
        stagesCompleted: result.stagesCompleted
      });
    }

    if (method === "GET" && req.params?.signalId) {
      if (!requireDatabase(res)) return;
      await authorizeContributor(req);
      const signalId = decodeURIComponent(req.params.signalId);
      const row = await getSignalById(signalId);
      if (!row) {
        return res.status(404).json({ ok: false, error: "not_found" });
      }
      return res.status(200).json({
        ok: true,
        signal: mapRowToValidatedSignal(row, row.provenance_id)
      });
    }

    if (method === "GET" && req.params?.passportId) {
      if (!requireDatabase(res)) return;
      await authorizeContributor(req);
      const passportId = normalizePassportId(decodeURIComponent(req.params.passportId));
      if (!passportId) {
        return res.status(400).json({ ok: false, error: "invalid_passport_id" });
      }
      const rows = await listSignalsForPassport(passportId);
      return res.status(200).json({
        ok: true,
        passportId,
        signals: rows.map((row) => mapRowToValidatedSignal(row, row.provenance_id))
      });
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
      fallbackMessage: "Passport signal request failed"
    });
  }
}

export async function bootstrapPassportSignalContributors() {
  const key = process.env.PASSPORT_SIGNAL_CONTRIBUTOR_BAMSIGNAL_KEY;
  if (key) {
    await bootstrapContributorApiKey("bamsignal", key);
  }
}
