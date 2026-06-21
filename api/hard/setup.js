import { createConsoleOperator, needsConsoleSetup } from "../../server/services/consoleSetup.js";
import {
  hasForbiddenSetupSecretChannel,
  logLegacySetupDenied,
  requireLegacySetupEnabled,
  sendLegacySetupAccessDenied,
  validateSetupHeader
} from "../../server/services/consoleSetupAccess.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";
import { logAdminStatusHidden } from "../../server/services/identityExposure.js";

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
  const enabled = requireLegacySetupEnabled();
  if (!enabled.ok) {
    return sendLegacySetupAccessDenied(res, enabled);
  }

  if (hasForbiddenSetupSecretChannel(req)) {
    logLegacySetupDenied(req, { reason: "forbidden_secret_channel" });
    return sendLegacySetupAccessDenied(res);
  }

  const action = String(req.query.action || "status").toLowerCase();

  if (action === "status") {
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    try {
      const access = validateSetupHeader(req);
      if (!access.ok) {
        logAdminStatusHidden({ endpoint: "hard/setup", action: "status" });
        return res.status(200).json({ ok: true });
      }
      const needsSetup = await needsConsoleSetup();
      return res.status(200).json({ ok: true, needsSetup });
    } catch (error) {
      return sendLoggedApiError({
        req,
        res,
        event: "console_setup_failed",
        error,
        status: 500,
        message: "Request failed.",
        context: { action: "status" }
      });
    }
  }

  if (action === "create") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const access = validateSetupHeader(req);
    if (!access.ok) {
      logLegacySetupDenied(req, { reason: access.reason || "invalid_or_missing_secret" });
      return sendLegacySetupAccessDenied(res);
    }

    const body = parseBody(req);
    try {
      const result = await createConsoleOperator({
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword
      });
      if (!result.ok) {
        if (result.status === 400) {
          return res.status(400).json({ ok: false, error: result.error || "Request failed." });
        }
        return sendLegacySetupAccessDenied(res, { status: result.status || 404 });
      }
      return res.status(200).json({
        ok: true,
        email: result.email,
        created: result.created
      });
    } catch (error) {
      return sendLoggedApiError({
        req,
        res,
        event: "console_setup_failed",
        error,
        status: 500,
        message: "Request failed.",
        context: { action: "create" }
      });
    }
  }

  return res.status(404).json({ ok: false, error: "not_found" });
}
