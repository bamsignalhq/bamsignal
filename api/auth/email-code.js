import {
  SignupOtpError,
  handleSignupEmailCodeRequest
} from "../../server/services/signupOtp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const result = await handleSignupEmailCodeRequest(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SignupOtpError) {
      return res.status(error.status).json({ ok: false, error: error.message });
    }
    console.error("[bamsignal] email-code error:", error);
    return res.status(500).json({
      ok: false,
      error: "We couldn't send the code right now. Wait a minute and try again, or check your spam folder."
    });
  }
}
