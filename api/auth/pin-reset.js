import { PinResetError, completePinReset, sendPinResetCode } from "../../server/services/pinReset.js";
import {
  checkPinResetThrottle,
  recordPinResetFailure,
  recordPinResetSuccess
} from "../../server/services/pinAuthThrottle.js";
import { buildAuthAuditContext } from "../../server/services/logRedaction.js";
import { logObservabilityEvent, observabilityContext } from "../../server/services/observability.js";
import {
  clientError,
  ensureApiRequestContext,
  sendLoggedApiError
} from "../../server/services/errorResponse.js";

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
        logObservabilityEvent(
          "pin_reset_locked",
          observabilityContext(
            req,
            buildAuthAuditContext({ email, lockedUntil: throttle.lockedUntil || null })
          )
        );
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
        logObservabilityEvent(
          "pin_reset_failed",
          observabilityContext(
            req,
            buildAuthAuditContext({
              email,
              attempts: record.attempts,
              locked: record.locked,
              lockedUntil: record.lockedUntil || null
            })
          )
        );
        return res.status(400).json({
          ok: false,
          error: INVALID_RESET_MESSAGE
        });
      }

      await recordPinResetSuccess(email);
      logObservabilityEvent(
        "pin_reset_success",
        observabilityContext(req, buildAuthAuditContext({ email }))
      );
      return res.status(200).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action. Use send or complete." });
  } catch (error) {
    if (error instanceof PinResetError) {
      logObservabilityEvent(
        "pin_reset_error",
        observabilityContext(req, {
          action,
          code: error.code || "pin_reset_error"
        }),
        "warn"
      );
      const { requestId } = ensureApiRequestContext(req, res);
      return clientError(res, {
        status: error.status || 400,
        message: INVALID_RESET_MESSAGE,
        requestId
      });
    }
    return sendLoggedApiError({
      req,
      res,
      event: "pin_reset_error",
      error,
      status: 500,
      message: "PIN reset failed.",
      context: { action }
    });
  }
}
