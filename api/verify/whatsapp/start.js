import {
  startWhatsappVerification,
  WhatsappVerificationError
} from "../../../server/services/whatsappVerification.js";
import {
  clientError,
  ensureApiRequestContext,
  sendLoggedApiError
} from "../../../server/services/errorResponse.js";

const WHATSAPP_START_MESSAGES = new Set([
  "Enter a valid Nigerian phone number.",
  "Please wait a minute before requesting another code.",
  "We couldn't send the code right now. Please try again."
]);

function whatsappStartMessage(error) {
  const message = String(error?.message || "");
  return WHATSAPP_START_MESSAGES.has(message) ? message : "We couldn't send the code right now. Please try again.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  if (!phone) {
    return res.status(400).json({ ok: false, error: "Phone number is required." });
  }

  try {
    const result = await startWhatsappVerification(phone, { email: email || undefined });
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof WhatsappVerificationError) {
      const { requestId } = ensureApiRequestContext(req, res);
      return clientError(res, {
        status: error.status,
        message: whatsappStartMessage(error),
        requestId
      });
    }
    return sendLoggedApiError({
      req,
      res,
      event: "whatsapp_verification_failed",
      error,
      status: 500,
      message: "We couldn't send the code right now. Please try again.",
      context: { action: "start" }
    });
  }
}
