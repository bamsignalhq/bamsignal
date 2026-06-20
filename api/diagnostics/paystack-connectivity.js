import { probePaystackConnectivity } from "../../server/services/paystackClient.js";
import {
  requireDiagnosticsAccess,
  sendDiagnosticsAccessDenied
} from "../../server/services/diagnosticsAccess.js";

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
    console.error("[paystack-diagnostics] probe failed:", error);
    return res.status(200).json({
      ok: false,
      service: "bamsignal",
      checkedAt: new Date().toISOString(),
      error: error.message || "Diagnostics probe failed."
    });
  }
}
