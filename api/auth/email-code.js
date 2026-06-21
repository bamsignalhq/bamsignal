import {
  SignupOtpError,
  handleSignupEmailCodeRequest
} from "../../server/services/signupOtp.js";
import { SignupIdentityError } from "../../server/services/signupIdentity.js";
import {
  clientError,
  ensureApiRequestContext,
  safeClientMessage,
  sendLoggedApiError
} from "../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const result = await handleSignupEmailCodeRequest(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    const action = String((req.body && req.body.action) || "send").toLowerCase();
    if (error instanceof SignupOtpError || error instanceof SignupIdentityError) {
      const fallback =
        action === "verify"
          ? "We couldn't complete your signup. Please try again."
          : "We couldn't send the code right now. Wait a minute and try again, or check your spam folder.";
      const { requestId } = ensureApiRequestContext(req, res);
      return clientError(res, {
        status: error.status,
        message: safeClientMessage(error?.message, fallback),
        requestId,
        body: {
          field: error.field || undefined,
          code: error.code || undefined
        }
      });
    }
    const fallback =
      action === "verify"
        ? "We couldn't complete your signup. Please try again."
        : "We couldn't send the code right now. Wait a minute and try again, or check your spam folder.";
    return sendLoggedApiError({
      req,
      res,
      event: "signup_email_code_failed",
      error,
      status: 500,
      message: fallback,
      context: { action },
      body: {
        code: action === "verify" ? "signup_verify_failed" : "otp_send_failed"
      }
    });
  }
}
