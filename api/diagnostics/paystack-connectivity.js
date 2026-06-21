import { probePaystackConnectivity } from "../../server/services/paystackClient.js";
import {
  requireDiagnosticsAccess,
  sendDiagnosticsAccessDenied
} from "../../server/services/diagnosticsAccess.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const access = await requireDiagnosticsAccess(req);
  if (!access.ok) {
    return sendDiagnosticsAccessDenied(res, access);
  }

  try {
    const probe = await probePaystackConnectivity();
    return res.status(200).json({
      ok: probe.ok,
      service: "bamsignal",
      checkedAt: new Date().toISOString(),
      paystack: probe
    });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "paystack_diagnostics_failed",
      error,
      status: 200,
      message: "Diagnostics probe failed.",
      context: { service: "paystack" },
      body: {
        service: "bamsignal",
        checkedAt: new Date().toISOString()
      }
    });
  }
}
