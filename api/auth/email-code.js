import {
  SignupOtpError,
  handleSignupEmailCodeRequest
} from "../../server/services/signupOtp.js";
import { SignupIdentityError } from "../../server/services/signupIdentity.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const result = await handleSignupEmailCodeRequest(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SignupOtpError || error instanceof SignupIdentityError) {
      return res.status(error.status).json({
        ok: false,
        error: error.message,
        field: error.field || undefined
      });
    }
    console.error("[bamsignal] email-code error:", error);
    const action = String((req.body && req.body.action) || "send").toLowerCase();
    const fallback =
      action === "verify"
        ? "We couldn't finish creating your account. Try again shortly."
        : "We couldn't send the code right now. Wait a minute and try again, or check your spam folder.";
    return res.status(500).json({
      ok: false,
      error: fallback
    });
  }
}
