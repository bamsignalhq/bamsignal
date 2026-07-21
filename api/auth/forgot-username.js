import {
  ForgotUsernameError,
  completeForgotUsername,
  sendForgotUsernameCode
} from "../../server/services/forgotUsername.js";
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
  safeClientMessage,
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
      const result = await sendForgotUsernameCode({
        email: body.email,
        phone: body.phone
      });
      return res.status(200).json(result);
    }

    if (action === "complete") {
      const email = String(body.email || "").trim();
      const phone = String(body.phone || "").trim();
      const throttleId = email || phone || "unknown";
      const throttle = await checkPinResetThrottle(req, throttleId);
      if (throttle.locked) {
        logObservabilityEvent(
          "forgot_username_locked",
          observabilityContext(
            req,
            buildAuthAuditContext({ email, lockedUntil: throttle.lockedUntil || null })
          )
        );
        return res.status(429).json({ ok: false, error: lockError });
      }

      try {
        const result = await completeForgotUsername({
          email,
          phone,
          code: body.code
        });
        await recordPinResetSuccess(throttleId);
        return res.status(200).json(result);
      } catch (error) {
        if (error instanceof ForgotUsernameError && error.status === 400) {
          await recordPinResetFailure(req, throttleId);
        }
        throw error;
      }
    }

    return res.status(400).json({ ok: false, error: "Invalid action." });
  } catch (error) {
    if (error instanceof ForgotUsernameError) {
      const { requestId } = ensureApiRequestContext(req, res);
      return clientError(res, {
        status: error.status,
        message: safeClientMessage(error.message, "We couldn't recover your username right now."),
        requestId,
        body: { code: error.code || undefined }
      });
    }
    return sendLoggedApiError({
      req,
      res,
      event: "forgot_username_failed",
      error,
      status: 500,
      message: "We couldn't recover your username right now.",
      context: { action },
      body: { code: "forgot_username_failed" }
    });
  }
}
