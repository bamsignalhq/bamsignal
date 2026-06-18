import { getDatabaseStatus } from "../../server/db.js";
import {
  checkLoginRequires2fa,
  getAccountSecuritySettings,
  sendLogin2faCode,
  setTwoFactorEnabled,
  verifyLogin2faCode,
  Login2faError
} from "../../server/services/accountSecurity.js";

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

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected.", database });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = normalizePhone(body.phone);
  const deviceId = String(body.deviceId || "").trim();
  const ip = clientIp(req);
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 512) || null;

  if (!email && !phone) {
    return res.status(400).json({ ok: false, error: "Email or phone is required." });
  }

  try {
    if (action === "login-check") {
      const check = await checkLoginRequires2fa({ email, phone, deviceId });
      return res.status(200).json({ ok: true, ...check });
    }

    if (action === "login-2fa-send") {
      const result = await sendLogin2faCode({ email, phone, deviceId, ip, userAgent });
      return res.status(200).json(result);
    }

    if (action === "login-2fa-verify") {
      const result = await verifyLogin2faCode({
        email,
        phone,
        code: body.code,
        deviceId,
        ip,
        userAgent
      });
      return res.status(200).json(result);
    }

    if (action === "security-settings") {
      const settings = await getAccountSecuritySettings({ email, phone });
      return res.status(200).json({ ok: true, settings });
    }

    if (action === "two-factor-enable") {
      const result = await setTwoFactorEnabled({
        email,
        phone,
        enabled: Boolean(body.enabled),
        method: body.method,
        ip,
        userAgent
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    if (error instanceof Login2faError) {
      return res.status(error.status || 400).json({ ok: false, error: error.message, code: error.code });
    }
    console.error("[bamsignal] login-security error:", error);
    return res.status(500).json({ ok: false, error: error.message || "Login security request failed." });
  }
}
