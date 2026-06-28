import {
  handleWhatsappVerificationWebhook
} from "../../../server/services/whatsappVerification.js";
import { logSanitizedApiError, sendLoggedApiError } from "../../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendLoggedApiError({
      req,
      res,
      status: 405,
      message: "Method not allowed.",
      errorCode: "method_not_allowed",
      event: "whatsapp_webhook_method_not_allowed"
    });
  }

  const body = req.body && typeof req.body === "object" ? req.body : null;
  if (!body) {
    return sendLoggedApiError({
      req,
      res,
      status: 400,
      message: "Invalid webhook payload.",
      errorCode: "invalid_payload",
      event: "whatsapp_webhook_invalid_payload"
    });
  }

  try {
    const result = await handleWhatsappVerificationWebhook(body);
    if (result.invalid) {
      return sendLoggedApiError({
        req,
        res,
        status: 400,
        message: "Invalid webhook payload.",
        errorCode: "invalid_webhook",
        event: "whatsapp_webhook_invalid"
      });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    logSanitizedApiError(req, "whatsapp_webhook_failed", error, {}, "error");
    return res.status(200).json({ ok: true });
  }
}
