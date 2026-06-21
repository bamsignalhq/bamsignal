import {
  confirmWhatsappVerification,
  WhatsappVerificationError
} from "../../../server/services/whatsappVerification.js";
import {
  clientError,
  ensureApiRequestContext,
  sendLoggedApiError
} from "../../../server/services/errorResponse.js";

const WHATSAPP_CONFIRM_MESSAGES = new Set([
  "Enter a valid Nigerian phone number.",
  "Request a new code and try again.",
  "That code has expired. Request a new one.",
  "Too many attempts. Request a new code.",
  "We couldn't verify that code. Check it and try again."
]);

function whatsappConfirmMessage(error) {
  const message = String(error?.message || "");
  return WHATSAPP_CONFIRM_MESSAGES.has(message)
    ? message
    : "We couldn't verify that code. Check it and try again.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const phone = String(body.phone || "").trim();
  const code = String(body.code || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  if (!phone) {
    return res.status(400).json({ ok: false, error: "Phone number is required." });
  }

  try {
    const result = await confirmWhatsappVerification(phone, code, { email: email || undefined });
    return res.status(200).json({
      ok: true,
      message: result.message || "Phone verified successfully.",
      phone: result.phone,
      phoneVerified: true,
      verifiedPhone: result.verifiedPhone || result.phone
    });
  } catch (error) {
    if (error instanceof WhatsappVerificationError) {
      const { requestId } = ensureApiRequestContext(req, res);
      return clientError(res, {
        status: error.status,
        message: whatsappConfirmMessage(error),
        requestId
      });
    }
    return sendLoggedApiError({
      req,
      res,
      event: "whatsapp_verification_failed",
      error,
      status: 500,
      message: "We couldn't verify that code. Check it and try again.",
      context: { action: "confirm" }
    });
  }
}
