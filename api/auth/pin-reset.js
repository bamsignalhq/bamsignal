import { PinResetError, completePinReset, sendPinResetCode } from "../../server/services/pinReset.js";

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

  try {
    if (action === "send") {
      const email = String(body.email || "").trim();
      const result = await sendPinResetCode(email);
      return res.status(200).json(result);
    }

    if (action === "complete") {
      const result = await completePinReset({
        email: body.email,
        code: body.code,
        newPin: body.newPin != null ? body.newPin : body.pin
      });
      return res.status(200).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action. Use send or complete." });
  } catch (error) {
    if (error instanceof PinResetError) {
      return res.status(error.status || 400).json({
        ok: false,
        error: error.message,
        code: error.code || null
      });
    }
    console.error("[bamsignal] pin-reset error:", error);
    return res.status(500).json({ ok: false, error: "PIN reset failed." });
  }
}
