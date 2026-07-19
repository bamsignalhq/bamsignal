import { requireMemberAuth } from "../../server/services/memberAuth.js";
import { normalizeUserKey } from "../../server/db.js";
import { checkRateLimit } from "../../server/services/rateLimit.js";
import {
  ensureApiRequestContext,
  sendLoggedApiError
} from "../../server/services/errorResponse.js";
import { uploadVerificationSelfieForSession } from "../../server/lib/verification/index.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { requestId } = ensureApiRequestContext(req, res);
  const body = req.body || {};
  const sessionId = String(body.sessionId || "").trim();
  const selfieDataUrl = String(body.selfieDataUrl || body.verificationSelfie || "").trim();

  const auth = await requireMemberAuth(req, body);
  if (!auth.ok) {
    return res.status(auth.status || 401).json({
      ok: false,
      error: "Sign in to upload a verification selfie.",
      errorCode: auth.error || "not_authorized",
      requestId
    });
  }

  if (!sessionId || !selfieDataUrl) {
    return res.status(400).json({
      ok: false,
      error: "sessionId and selfie are required.",
      errorCode: "invalid_request",
      requestId
    });
  }

  const rate = await checkRateLimit({
    req,
    endpoint: "verification_upload",
    email: auth.email,
    phone: auth.phone
  });
  if (!rate.ok) {
    return sendLoggedApiError({
      req,
      res,
      status: 429,
      message: "Too many uploads. Try again shortly.",
      errorCode: "rate_limited",
      event: "verification_rate_limited"
    });
  }

  try {
    const userKey = auth.userKey || normalizeUserKey({ email: auth.email, phone: auth.phone });
    const result = await uploadVerificationSelfieForSession({
      sessionId,
      userKey,
      authUserId: auth.authUserId,
      selfieDataUrl
    });
    if (!result.ok) {
      return res.status(result.status || 400).json({
        ok: false,
        error: result.error,
        errorCode: result.errorCode,
        requestId
      });
    }
    return res.status(200).json({ ok: true, status: result.status, requestId });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "verification_upload_failed",
      error,
      status: 500,
      message: "Could not upload verification selfie.",
      body: { errorCode: "unexpected_error" }
    });
  }
}
