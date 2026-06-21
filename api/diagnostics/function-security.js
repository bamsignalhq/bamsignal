import {
  fixFunctionSecurity,
  functionSecurityStatus
} from "../../server/fixFunctionSecurity.js";
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
      const functions = await functionSecurityStatus();
      return res.status(200).json({ ok: true, functions });
    } catch (error) {
      return sendLoggedApiError({
        req,
        res,
        event: "diagnostics_function_security_failed",
        error,
        status: 500,
        message: "Function security check failed.",
        context: { action: "status" }
      });
    }
  }

  if (req.method === "POST") {
    try {
      const result = await fixFunctionSecurity();
      const functions = await functionSecurityStatus();
      return res.status(200).json({ ok: result.ok, ...result, functions });
    } catch (error) {
      return sendLoggedApiError({
        req,
        res,
        event: "diagnostics_function_security_failed",
        error,
        status: 500,
        message: "Function security fix failed.",
        context: { action: "fix" }
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
