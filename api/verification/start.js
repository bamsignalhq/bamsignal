import { requireMemberAuth } from "../../server/services/memberAuth.js";
import { normalizeUserKey } from "../../server/db.js";
import { checkRateLimit } from "../../server/services/rateLimit.js";
import {
  ensureApiRequestContext,
  sendLoggedApiError
} from "../../server/services/errorResponse.js";
import { startVerificationSession } from "../../server/lib/verification/index.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { requestId } = ensureApiRequestContext(req, res);
  const body = req.body || {};

  const auth = await requireMemberAuth(req, body);
  if (!auth.ok) {
    return res.status(auth.status || 401).json({
      ok: false,
      error: "Sign in to start verification.",
      errorCode: auth.error || "not_authorized",
      requestId
    });
  }

  const rate = await checkRateLimit({
    req,
    endpoint: "verification_start",
    email: auth.email,
    phone: auth.phone
  });
  if (!rate.ok) {
    return sendLoggedApiError({
      req,
      res,
      status: 429,
      message: "Too many verification attempts. Try again shortly.",
      errorCode: "rate_limited",
      event: "verification_rate_limited"
    });
  }

  try {
    const userKey = auth.userKey || normalizeUserKey({ email: auth.email, phone: auth.phone });
    const result = await startVerificationSession({
      userKey,
      authUserId: auth.authUserId,
      email: auth.email,
      phone: auth.phone,
      deviceFingerprint: String(body.deviceFingerprint || "").trim() || null,
      providerId: body.provider || process.env.FACE_VERIFICATION_PROVIDER
    });
    return res.status(200).json({ ok: true, ...result, requestId });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "verification_start_failed",
      error,
      status: 500,
      message: "Could not start verification.",
      body: { errorCode: "unexpected_error" }
    });
  }
}
