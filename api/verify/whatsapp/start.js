import { ensureApiRequestContext } from "../../../server/services/errorResponse.js";

/** WhatsApp OTP retired — use POST /api/verify/sms/start */
export default async function handler(req, res) {
  const { requestId } = ensureApiRequestContext(req, res);
  res.setHeader("Allow", "POST");
  return res.status(410).json({
    ok: false,
    error: "WhatsApp verification has been replaced by SMS Verification. Use /api/verify/sms/start.",
    errorCode: "whatsapp_otp_retired",
    replacement: "/api/verify/sms/start",
    requestId
  });
}
