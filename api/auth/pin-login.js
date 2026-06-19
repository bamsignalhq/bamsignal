import { INVALID_LOGIN_MESSAGE, loginWithUsernameAndPassword, resolveLoginUsername } from "../../server/services/pinLogin.js";

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
  const username = String(body.username || body.identifier || "").trim();
  const password =
    body.password != null ? String(body.password) : body.pin != null ? String(body.pin) : "";

  try {
    if (!password) {
      const resolved = await resolveLoginUsername(username);
      if (!resolved.email) {
        return res.status(401).json({ ok: false, error: INVALID_LOGIN_MESSAGE });
      }
      return res.status(200).json({ ok: true, email: resolved.email });
    }

    const result = await loginWithUsernameAndPassword(username, password);
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
