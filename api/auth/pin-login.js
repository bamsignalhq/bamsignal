import { loginWithIdentifierAndPin, resolveLoginIdentifier } from "../../server/services/pinLogin.js";

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
  const identifier = String(body.identifier || body.username || body.email || body.phone || "").trim();
  const pin = body.pin != null ? String(body.pin) : "";

  try {
    if (!pin) {
      const resolved = await resolveLoginIdentifier(identifier);
      if (!resolved.email) {
        return res.status(404).json({ ok: false, error: "Account not found." });
      }
      return res.status(200).json({ ok: true, email: resolved.email });
    }

    const result = await loginWithIdentifierAndPin(identifier, pin);
    if (!result.resolved?.email) {
      return res.status(404).json({ ok: false, error: "Account not found. Check your username and PIN." });
    }
    if (!result.ok) {
      return res.status(401).json({
        ok: false,
        error: result.error || "Invalid PIN. Check your username and PIN."
      });
    }
    return res.status(200).json({
      ok: true,
      email: result.email,
      session: result.session
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Login failed." });
  }
}
