import { bootstrapOpsAdmin } from "../../server/services/adminBootstrap.js";
import {
  logAdminBootstrapSuccess,
  requireAdminBootstrapAccess,
  sendAdminBootstrapAccessDenied
} from "../../server/services/adminBootstrapAccess.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";
import { buildAdminAuditContext } from "../../server/services/logRedaction.js";

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

  const access = requireAdminBootstrapAccess(req);
  if (!access.ok) {
    return sendAdminBootstrapAccessDenied(res, access);
  }

  const body = parseBody(req);

  try {
    const result = await bootstrapOpsAdmin({
      email: body.email || process.env.ADMIN_BOOTSTRAP_EMAIL || "ops@bamsignal.com",
      password: body.password || process.env.ADMIN_BOOTSTRAP_PASSWORD
    });
    if (!result.ok) {
      return sendLoggedApiError({
        req,
        res,
        event: "admin_bootstrap_failed",
        error: new Error(String(result.error || "bootstrap_failed")),
        status: 500,
        message: "Bootstrap failed."
      });
    }

    logAdminBootstrapSuccess(
      req,
      buildAdminAuditContext({
        email: result.email,
        userId: result.userId,
        created: result.created
      })
    );

    return res.status(200).json({
      ok: true,
      message: result.created ? "Admin user ready." : "Admin user updated."
    });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "admin_bootstrap_failed",
      error,
      status: 500,
      message: "Bootstrap failed."
    });
  }
}
