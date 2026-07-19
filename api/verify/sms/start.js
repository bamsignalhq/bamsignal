import {
  startSmsVerification,
  SmsVerificationError
} from "../../../server/services/smsVerification.js";
import { requireMemberAuth } from "../../../server/services/memberAuth.js";
import {
  clientError,
  ensureApiRequestContext,
  logError,
  sendLoggedApiError
} from "../../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { requestId } = ensureApiRequestContext(req, res);
  const body = req.body || {};
  const phone = String(body.phone || "").trim();

  const auth = await requireMemberAuth(req, body);
  if (!auth.ok) {
    return res.status(auth.status || 401).json({
      ok: false,
      error: "Sign in to verify your phone.",
      errorCode: auth.error || "not_authorized",
      requestId
    });
  }

  if (!phone) {
    return res.status(400).json({
      ok: false,
      error: "Phone number is required.",
      errorCode: "invalid_phone",
      requestId
    });
  }

  try {
    const result = await startSmsVerification(phone, {
      email: auth.email || undefined,
      requestId,
      memberId: auth.memberId || auth.email || undefined,
      authUserId: auth.authUserId
    });
    return res.status(200).json({ ...result, requestId });
  } catch (error) {
    if (error instanceof SmsVerificationError) {
      logError(req, "sms_verification_start_failed", error, {
        action: "start",
        errorCode: error.code
      });
      return clientError(res, {
        status: error.status,
        message: error.message,
        requestId,
        body: { errorCode: error.code }
      });
    }
    return sendLoggedApiError({
      req,
      res,
      event: "sms_verification_failed",
      error,
      status: 500,
      message: "Unexpected server error.",
      context: { action: "start" },
      body: { errorCode: "unexpected_error" }
    });
  }
}
