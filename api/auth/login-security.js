import { getDatabaseStatus } from "../../server/db.js";
import {
  checkLoginRequires2fa,
  getAccountSecuritySettings,
  sendLogin2faCode,
  setTwoFactorEnabled,
  verifyLogin2faCode,
  Login2faError
} from "../../server/services/accountSecurity.js";
import { requireMemberAuth } from "../../server/services/memberAuth.js";
import {
  GENERIC_NOT_AUTHORIZED,
  logIdentityExposureBlocked,
  sendGenericServiceUnavailable
} from "../../server/services/identityExposure.js";
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

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (getDatabaseStatus() !== "connected") {
    return sendGenericServiceUnavailable(res);
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "").trim();
  const deviceId = String(body.deviceId || "").trim();
  const ip = clientIp(req);
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 512) || null;

  if (action === "security-settings" || action === "two-factor-enable") {
    logIdentityExposureBlocked({ endpoint: "login-security", action, reason: "deprecated_public_action" });
    return res.status(401).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
  }

  const authResult = await requireMemberAuth(req, body);
  if (!authResult.ok) {
    logIdentityExposureBlocked({ endpoint: "login-security", action });
    return res.status(authResult.status || 401).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
  }

  const identity = authResult.identity;
  const email = identity.email;
  const phone = identity.phone;

  try {
    if (action === "login-check") {
      const check = await checkLoginRequires2fa({ email, phone, deviceId });
      return res.status(200).json({ ok: true, ...check });
    }

    if (action === "login-2fa-send") {
      const result = await sendLogin2faCode({ email, phone, deviceId, ip, userAgent });
      return res.status(200).json(result);
    }

    if (action === "login-2fa-verify") {
      const result = await verifyLogin2faCode({
        email,
        phone,
        code: body.code,
        deviceId,
        ip,
        userAgent
      });
      return res.status(200).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    if (error instanceof Login2faError) {
      const { requestId } = ensureApiRequestContext(req, res);
      return clientError(res, {
        status: error.status || 400,
        message: safeClientMessage(error?.message, "Login security request failed."),
        requestId,
        body: { code: error.code }
      });
    }
    return sendLoggedApiError({
      req,
      res,
      event: "login_security_failed",
      error,
      status: 500,
      message: "Login security request failed.",
      context: {
        action,
        code: error instanceof Error ? error.code || null : null
      }
    });
  }
}
