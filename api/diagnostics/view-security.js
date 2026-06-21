import {
  fixSecurityDefinerViews,
  securityInvokerViewStatus
} from "../../server/fixSecurityDefinerViews.js";
import {
  requireDiagnosticsAccess,
  sendDiagnosticsAccessDenied
} from "../../server/services/diagnosticsAccess.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

export default async function handler(req, res) {
  const access = await requireDiagnosticsAccess(req);
  if (!access.ok) {
    return sendDiagnosticsAccessDenied(res, access);
  }

  if (req.method === "GET") {
    try {
      const views = await securityInvokerViewStatus();
      return res.status(200).json({ ok: true, views });
    } catch (error) {
      return sendLoggedApiError({
        req,
        res,
        event: "diagnostics_view_security_failed",
        error,
        status: 500,
        message: "View security check failed.",
        context: { action: "status" }
      });
    }
  }

  if (req.method === "POST") {
    try {
      const result = await fixSecurityDefinerViews();
      const views = await securityInvokerViewStatus();
      return res.status(200).json({ ok: result.ok, fixed: result.fixed, views });
    } catch (error) {
      return sendLoggedApiError({
        req,
        res,
        event: "diagnostics_view_security_failed",
        error,
        status: 500,
        message: "View security fix failed.",
        context: { action: "fix" }
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
