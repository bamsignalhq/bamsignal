import {
  confirmWhatsappVerification,
  WhatsappVerificationError
} from "../../../server/services/whatsappVerification.js";
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
  const code = String(body.code || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  if (!phone) {
    return res.status(400).json({
      ok: false,
      error: "Phone number is required.",
      errorCode: "invalid_phone",
      requestId
    });
  }

  try {
    const result = await confirmWhatsappVerification(phone, code, {
      email: email || undefined,
      requestId,
      memberId: email || undefined
    });
    return res.status(200).json({
      ok: true,
      message: result.message || "Phone verified successfully.",
      phone: result.phone,
      phoneVerified: true,
      verifiedPhone: result.verifiedPhone || result.phone,
      requestId
    });
  } catch (error) {
    if (error instanceof WhatsappVerificationError) {
      logError(req, "whatsapp_verification_confirm_failed", error, {
        action: "confirm",
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
      event: "whatsapp_verification_failed",
      error,
      status: 500,
      message: "Unexpected server error.",
      context: { action: "confirm" },
      body: { errorCode: "unexpected_error" }
    });
  }
}
