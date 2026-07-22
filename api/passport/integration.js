import { requireAdmin } from "../../server/adminAuth.js";
import { getDatabaseStatus } from "../../server/db.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";
import {
  buildPassportApiDashboard,
  buildPassportSummary,
  buildTrustTimeline,
  buildVerificationHistory,
  buildSignalHistory,
  buildConsentHistory,
  buildReputationProfileContract,
  getPassportIdForMember,
  auditTrustProducers,
  getPassportIntegrationMetrics,
  runPassportCertificationJourney
} from "../../server/services/passportIntegration/index.js";

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
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
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
    const passportId = body.passportId ? String(body.passportId).toUpperCase() : null;
    const memberId = body.memberId || null;

    if (action === "dashboard") {
      const contract = await buildPassportApiDashboard(memberId, passportId);
      return res.status(contract.ok === false ? 404 : 200).json(contract);
    }

    if (action === "resolve-passport") {
      const resolved = memberId ? await getPassportIdForMember(memberId) : passportId;
      return res.status(200).json({ ok: true, passportId: resolved });
    }

    if (action === "summary") {
      if (!passportId && memberId) {
        const resolved = await getPassportIdForMember(memberId);
        if (!resolved) return res.status(404).json({ ok: false, error: "passport_not_found" });
        return res.status(200).json({ ok: true, ...(await buildPassportSummary(resolved)) });
      }
      if (!passportId) return res.status(400).json({ ok: false, error: "passportId required" });
      return res.status(200).json({ ok: true, ...(await buildPassportSummary(passportId)) });
    }

    if (action === "timeline") {
      const id = passportId || (memberId ? await getPassportIdForMember(memberId) : null);
      if (!id) return res.status(404).json({ ok: false, error: "passport_not_found" });
      return res.status(200).json({ ok: true, ...(await buildTrustTimeline(id, body)) });
    }

    if (action === "verification-history") {
      const id = passportId || (memberId ? await getPassportIdForMember(memberId) : null);
      if (!id) return res.status(404).json({ ok: false, error: "passport_not_found" });
      return res.status(200).json({ ok: true, ...(await buildVerificationHistory(id)) });
    }

    if (action === "signal-history") {
      const id = passportId || (memberId ? await getPassportIdForMember(memberId) : null);
      if (!id) return res.status(404).json({ ok: false, error: "passport_not_found" });
      return res.status(200).json({ ok: true, ...(await buildSignalHistory(id, body)) });
    }

    if (action === "consent-history") {
      const id = passportId || (memberId ? await getPassportIdForMember(memberId) : null);
      if (!id) return res.status(404).json({ ok: false, error: "passport_not_found" });
      return res.status(200).json({ ok: true, ...(await buildConsentHistory(id)) });
    }

    if (action === "reputation-profile") {
      const id = passportId || (memberId ? await getPassportIdForMember(memberId) : null);
      if (!id) return res.status(404).json({ ok: false, error: "passport_not_found" });
      return res.status(200).json({ ok: true, ...(await buildReputationProfileContract(id)) });
    }

    if (action === "audit-producers") {
      return res.status(200).json({ ok: true, ...auditTrustProducers() });
    }

    if (action === "metrics") {
      return res.status(200).json({ ok: true, metrics: getPassportIntegrationMetrics() });
    }

    if (action === "certify-journey") {
      const result = await runPassportCertificationJourney(body);
      return res.status(result.passed ? 200 : 500).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "passport_integration_admin_error",
      error,
      status: 500,
      message: "Passport integration request failed.",
      context: { action }
    });
  }
}
