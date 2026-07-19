import { requireAdmin } from "../../server/adminAuth.js";
import { requireAdminConsent } from "../../server/adminConsent.js";
import { ensureApiRequestContext, sendLoggedApiError } from "../../server/services/errorResponse.js";
import {
  adminDecideVerification,
  createVerificationSignedUrl,
  listAdminVerificationQueue
} from "../../server/lib/verification/index.js";

export default async function handler(req, res) {
  const { requestId } = ensureApiRequestContext(req, res);
  if (!(await requireAdmin(req, res))) return;

  const body = req.body || {};
  const action = String(req.query.action || body.action || "list").trim();

  if (action === "list") {
    const status = String(req.query.status || body.status || "manual_review").trim();
    const rows = await listAdminVerificationQueue({ status, limit: Number(body.limit) || 50 });
    const withUrls = [];
    for (const row of rows) {
      let selfieUrl = null;
      if (row.selfiePath) {
        try {
          selfieUrl = await createVerificationSignedUrl(row.selfiePath, 300);
        } catch {
          selfieUrl = null;
        }
      }
      withUrls.push({
        sessionId: row.sessionId,
        status: row.status,
        decision: row.decision,
        trustScore: row.trustScore,
        confidence: row.confidence,
        provider: row.provider,
        modelVersion: row.modelVersion,
        reasonCodes: row.reasonCodes,
        messagingUnlocked: row.messagingUnlocked,
        email: row.email,
        phone: row.phone,
        selfieUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      });
    }
    return res.status(200).json({ ok: true, submissions: withUrls, requestId });
  }

  if (["approve", "reject", "request_new_selfie", "suspend"].includes(action)) {
    if (!(await requireAdminConsent(req, res))) return;
    const sessionId = String(body.sessionId || "").trim();
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "sessionId is required.", requestId });
    }
    try {
      const result = await adminDecideVerification({
        sessionId,
        decision: action,
        actor: "admin",
        rejectReason: String(body.rejectReason || "").trim() || undefined
      });
      if (!result.ok) {
        return res.status(result.status || 400).json({ ok: false, error: result.error, requestId });
      }
      return res.status(200).json({ ok: true, status: result.status, requestId });
    } catch (error) {
      return sendLoggedApiError({
        req,
        res,
        event: "verification_admin_decision_failed",
        error,
        status: 500,
        message: "Could not apply verification decision."
      });
    }
  }

  return res.status(400).json({ ok: false, error: "Unknown action.", requestId });
}
