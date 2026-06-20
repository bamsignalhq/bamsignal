import { INVALID_LOGIN_MESSAGE, loginWithUsernameAndPin } from "../../server/services/pinLogin.js";
import { normalizeLoginUsername } from "../../server/services/loginResolve.js";

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
  const rawUsername = String(body.username || "");
  const username = normalizeLoginUsername(rawUsername);
  const pin = body.pin != null ? String(body.pin) : "";

  try {
    if (!username || !pin) {
      return res.status(401).json({ ok: false, error: INVALID_LOGIN_MESSAGE });
    }

    const result = await loginWithUsernameAndPin(username, pin);
    if (!result.ok) {
      return res.status(401).json({
        ok: false,
        error: result.error || INVALID_LOGIN_MESSAGE
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
