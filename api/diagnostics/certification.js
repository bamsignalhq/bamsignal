import { requireDiagnosticsAccess } from "../../server/services/diagnosticsAccess.js";
import {
  approveCertificationVerification,
  cleanupCertificationMember,
  peekCertificationOtp,
  runCertificationQuery,
  seedCertificationSignupOtp,
  setCertificationPhoneVerified,
  certificationEmailDomain,
  isCertificationEmail
} from "../../server/services/certificationE2e.js";
import { ensureApiRequestContext, sendApiError, sendLoggedApiError } from "../../server/services/errorResponse.js";

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

function sendCertificationError(req, res, error) {
  const { requestId } = ensureApiRequestContext(req, res);
  return sendApiError(res, {
    status: Number(error?.status) || 500,
    message: error?.message || "Certification request failed.",
    errorCode: error?.code || "certification_error",
    requestId
  });
}

export default async function certificationDiagnosticsHandler(req, res) {
  const access = await requireDiagnosticsAccess(req);
  if (!access.ok) {
    return sendLoggedApiError({
      req,
      res,
      status: access.status || 401,
      message: "Not authorized.",
      errorCode: "not_authorized",
      event: "certification_access_denied"
    });
  }

  const body = parseBody(req);
  const action = String(req.query?.action || body.action || "").trim().toLowerCase();

  try {
    if (action === "status") {
      return res.status(200).json({
        ok: true,
        brand: "Production E2E Certification™",
        certificationEmailDomain: certificationEmailDomain(),
        scope: "read-peek-cleanup"
      });
    }

    if (action === "peek-signup-otp") {
      const result = peekCertificationOtp(String(body.email || "").trim());
      return res.status(200).json({ ok: true, ...result });
    }

    if (action === "seed-signup-otp") {
      const result = await seedCertificationSignupOtp(
        String(body.email || "").trim(),
        body.code != null ? String(body.code) : "246810"
      );
      return res.status(200).json(result);
    }

    if (action === "query") {
      const result = await runCertificationQuery(
        String(body.name || body.query || "").trim(),
        Array.isArray(body.params) ? body.params : []
      );
      return res.status(200).json(result);
    }

    if (action === "set-phone-verified") {
      const result = await setCertificationPhoneVerified({
        email: String(body.email || "").trim(),
        phone: String(body.phone || "").trim()
      });
      return res.status(200).json(result);
    }

    if (action === "approve-verification") {
      const result = await approveCertificationVerification({
        email: String(body.email || "").trim(),
        phone: String(body.phone || "").trim()
      });
      return res.status(200).json(result);
    }

    if (action === "cleanup-member") {
      const email = String(body.email || "").trim();
      if (!isCertificationEmail(email)) {
        return sendLoggedApiError({
          req,
          res,
          status: 403,
          message: "Certification email required.",
          errorCode: "certification_email_required",
          event: "certification_cleanup_denied"
        });
      }
      const result = await cleanupCertificationMember(email);
      return res.status(200).json({ ok: true, ...result });
    }

    return sendLoggedApiError({
      req,
      res,
      status: 400,
      message: "Invalid action.",
      errorCode: "invalid_action",
      event: "certification_invalid_action"
    });
  } catch (error) {
    if (error?.name === "CertificationE2eError") {
      return sendCertificationError(req, res, error);
    }
    return sendLoggedApiError({
      req,
      res,
      error,
      status: 500,
      message: "Certification handler failed.",
      errorCode: "certification_handler_failed",
      event: "certification_handler_failed"
    });
  }
}
