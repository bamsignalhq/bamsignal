import { ensureApiRequestContext, sendLoggedApiError } from "../../../server/services/errorResponse.js";

/** WhatsApp OTP retired — use POST /api/verify/sms/start */
export default async function handler(req, res) {
  ensureApiRequestContext(req, res);
  res.setHeader("Allow", "POST");
  return sendLoggedApiError({
    req,
    res,
    status: 410,
    message: "WhatsApp verification has been replaced by SMS Verification. Use /api/verify/sms/start.",
    errorCode: "whatsapp_otp_retired",
    event: "whatsapp_otp_retired",
    body: { replacement: "/api/verify/sms/start" }
  });
}
