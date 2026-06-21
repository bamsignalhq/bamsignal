import { INVALID_LOGIN_MESSAGE, loginWithUsernameAndPin } from "../../server/services/pinLogin.js";
import {
  checkPinLoginThrottle,
  recordPinLoginFailure,
  recordPinLoginSuccess
} from "../../server/services/pinAuthThrottle.js";
import { normalizeLoginUsername } from "../../server/services/loginResolve.js";
import { buildAuthAuditContext } from "../../server/services/logRedaction.js";
import { logObservabilityEvent, observabilityContext } from "../../server/services/observability.js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req);
  const rawUsername = String(body.username || "");
  const username = normalizeLoginUsername(rawUsername);
  const pin = body.pin != null ? String(body.pin) : "";
  const lockError = "Too many attempts. Please try again later.";

  try {
    if (!username || !pin) {
      return res.status(401).json({ ok: false, error: INVALID_LOGIN_MESSAGE });
    }

    const throttle = await checkPinLoginThrottle(req, username);
    if (throttle.locked) {
      logObservabilityEvent(
        "pin_login_locked",
        observabilityContext(
          req,
          buildAuthAuditContext({ username, lockedUntil: throttle.lockedUntil || null })
        )
      );
      return res.status(429).json({
        ok: false,
        error: lockError
      });
    }

    const result = await loginWithUsernameAndPin(username, pin);
    if (!result.ok) {
      const record = await recordPinLoginFailure(req, username);
      logObservabilityEvent(
        "pin_login_failed",
        observabilityContext(
          req,
          buildAuthAuditContext({
            username,
            attempts: record.attempts,
            locked: record.locked,
            lockedUntil: record.lockedUntil || null
          })
        )
      );
      return res.status(401).json({
        ok: false,
        error: INVALID_LOGIN_MESSAGE
      });
    }

    await recordPinLoginSuccess(username);
    logObservabilityEvent(
      "pin_login_success",
      observabilityContext(req, buildAuthAuditContext({ username }))
    );

    return res.status(200).json({
      ok: true,
      email: result.email,
      session: result.session
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Login failed." });
  }
}
