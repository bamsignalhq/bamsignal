import { verifySignupOtp, SignupOtpError } from "../../server/services/signupOtp.js";
import {
  PLAY_REVIEWER,
  provisionPlayReviewerAccount
} from "../../server/provisionPlayReviewer.js";
import { getDatabaseStatus } from "../../server/db.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

/**
 * Finish Play reviewer setup after email OTP when Supabase service role is unavailable.
 * Only accepts reviewer@bamsignal.com + a valid signup OTP.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (getDatabaseStatus() !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected." });
  }

  const body = parseBody(req);
  const code = String(body.code || "").trim();
  const pin = String(body.pin || "").trim();

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ ok: false, error: "Enter the 6-digit code from your email." });
  }
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ ok: false, error: "PIN must be 6 digits." });
  }

  try {
    await verifySignupOtp(PLAY_REVIEWER.email, code);
    const result = await provisionPlayReviewerAccount(pin);
    return res.status(200).json({
      ok: true,
      username: PLAY_REVIEWER.username,
      email: PLAY_REVIEWER.email,
      authCreated: result.authUser.created,
      memberProfileId: result.memberProfileId
    });
  } catch (error) {
    if (error instanceof SignupOtpError) {
      return res.status(error.status).json({ ok: false, error: error.message });
    }
    console.error("[bamsignal] play-reviewer-finish failed:", error);
    return res.status(500).json({ ok: false, error: error.message || "Setup failed." });
  }
}
