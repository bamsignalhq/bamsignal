import { PinResetError, completePinReset, sendPinResetCode } from "../../server/services/pinReset.js";
import {
  checkPinResetThrottle,
  recordPinResetFailure,
  recordPinResetSuccess
} from "../../server/services/pinAuthThrottle.js";

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

const INVALID_RESET_MESSAGE = "Invalid reset code or email.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "send").toLowerCase();
  const lockError = "Too many attempts. Please try again later.";

  try {
    if (action === "send") {
      const email = String(body.email || "").trim();
      const result = await sendPinResetCode(email);
      return res.status(200).json(result);
    }

    if (action === "complete") {
      const email = String(body.email || "").trim();
      const throttle = await checkPinResetThrottle(req, email);
      if (throttle.locked) {
        console.info("pin_reset_locked", {
          email,
          lockedUntil: throttle.lockedUntil || null
        });
        return res.status(429).json({
          ok: false,
          error: lockError
        });
      }

      const result = await completePinReset({
        email,
        code: body.code,
        newPin: body.newPin != null ? body.newPin : body.pin
      });
      if (!result?.ok) {
        const record = await recordPinResetFailure(req, email);
        console.info("pin_reset_failed", {
          email,
          attempts: record.attempts,
          locked: record.locked,
          lockedUntil: record.lockedUntil || null
        });
        return res.status(400).json({
          ok: false,
          error: INVALID_RESET_MESSAGE
        });
      }

      await recordPinResetSuccess(email);
      console.info("pin_reset_success", {
        email
      });
      return res.status(200).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action. Use send or complete." });
  } catch (error) {
    if (error instanceof PinResetError) {
      console.error("[bamsignal] pin-reset error:", error.code || "pin_reset_error");
      return res.status(error.status || 400).json({
        ok: false,
        error: INVALID_RESET_MESSAGE
      });
    }
    console.error("[bamsignal] pin-reset error:", error);
    return res.status(500).json({ ok: false, error: "PIN reset failed." });
  }
}
