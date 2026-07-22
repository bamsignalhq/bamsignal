import { INVALID_LOGIN_MESSAGE, loginWithUsernameAndPin } from "../../server/services/pinLogin.js";
import {
  checkPinLoginThrottle,
  recordPinLoginFailure,
  recordPinLoginSuccess
} from "../../server/services/pinAuthThrottle.js";
import { normalizeLoginUsername } from "../../server/services/loginResolve.js";
import { buildAuthAuditContext } from "../../server/services/logRedaction.js";
import { logObservabilityEvent, observabilityContext } from "../../server/services/observability.js";
import { sendLoggedApiError } from "../../server/services/apiErrorResponse.js";
import {
  handlePostLoginAuth,
  incrementAuthMetric,
  recordAuthSecurityEvent
} from "../../server/services/auth/index.js";

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
      incrementAuthMetric("failedLogins");
      incrementAuthMetric("pinFailures");
      await recordAuthSecurityEvent({
        eventType: "failed_login",
        userKey: username,
        ip: String(req.headers?.["x-forwarded-for"] || req.ip || "").split(",")[0].trim() || null,
        userAgent: String(req.headers?.["user-agent"] || ""),
        summary: "Invalid username or PIN"
      });
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

    const sessionUser = result.session?.user;
    const authUserId = sessionUser?.id ? String(sessionUser.id) : null;
    const profileId = result.resolved?.member?.id ? String(result.resolved.member.id) : null;
    await handlePostLoginAuth(req, {
      session: result.session,
      authUserId,
      profileId,
      userKey: username
    });

    return res.status(200).json({
      ok: true,
      email: result.email,
      session: result.session
    });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "pin_login_error",
      error,
      status: 500,
      message: "Login failed.",
      context: {
        action: "pin_login",
        ...buildAuthAuditContext({ username })
      }
    });
  }
}
