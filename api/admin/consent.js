import { requireAdmin } from "../../server/adminAuth.js";
import {
  createConsentFromPin,
  isAdminActionPinConfigured,
  rotateAdminActionPin,
  setInitialAdminActionPin
} from "../../server/adminConsent.js";

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
  const action = String(req.query.action || body.action || "verify").toLowerCase();

  try {
    if (action === "status") {
      if (!(await requireAdmin(req, res))) return;
      return res.status(200).json({
        ok: true,
        pinConfigured: await isAdminActionPinConfigured()
      });
    }

    if (action === "verify") {
      const result = await createConsentFromPin(req, body.pin);
      if (!result.ok) {
        return res.status(result.status || 400).json({ ok: false, error: result.error });
      }
      return res.status(200).json({
        ok: true,
        consentToken: result.consentToken,
        expiresAt: result.expiresAt
      });
    }

    if (action === "set-pin") {
      if (!(await requireAdmin(req, res))) return;
      const configured = await isAdminActionPinConfigured();
      const result = configured
        ? await rotateAdminActionPin(req, body.currentPin, body.nextPin)
        : await setInitialAdminActionPin(body.nextPin || body.pin);
      if (!result.ok) {
        return res.status(result.status || 400).json(result);
      }
      return res.status(200).json({ ok: true });
    }

    if (action === "rotate-pin") {
      if (!(await requireAdmin(req, res))) return;
      const result = await rotateAdminActionPin(req, body.currentPin, body.nextPin);
      if (!result.ok) {
        return res.status(result.status || 400).json(result);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "Unknown consent action." });
  } catch (error) {
    console.error("[bamsignal] admin consent error:", error);
    return res.status(500).json({ ok: false, error: error.message || "Consent request failed." });
  }
}
