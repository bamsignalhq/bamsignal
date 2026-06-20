import {
  fixFunctionSecurity,
  functionSecurityStatus
} from "../../server/fixFunctionSecurity.js";
import {
  requireDiagnosticsAccess,
  sendDiagnosticsAccessDenied
} from "../../server/services/diagnosticsAccess.js";

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
      return res.status(500).json({ ok: false, error: error.message || "Function security check failed." });
    }
  }

  if (req.method === "POST") {
    try {
      const result = await fixFunctionSecurity();
      const functions = await functionSecurityStatus();
      return res.status(200).json({ ok: result.ok, ...result, functions });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message || "Function security fix failed." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
