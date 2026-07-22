import { requireMemberAuth } from "../../server/services/memberAuth.js";
import {
  listAuthSessions,
  revokeAuthSession,
  revokeAllAuthSessions,
  recordAuthLogout,
  deriveSessionId
} from "../../server/services/auth/sessions.js";
import {
  listAuthDevices,
  revokeAuthDevice,
  setDeviceTrusted
} from "../../server/services/auth/devices.js";
import { parseAuthRequestContext } from "../../server/services/auth/requestContext.js";
import { sendLoggedApiError } from "../../server/services/apiErrorResponse.js";

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
  const action = String(req.query.action || body.action || "list").toLowerCase();

  try {
    const auth = await requireMemberAuth(req, body);
    if (!auth.ok) {
      return res.status(auth.status || 401).json({ ok: false, error: auth.error || "Unauthorized" });
    }

    const authUserId = auth.authUserId;
    const profileId = auth.memberId || null;

    if (action === "list") {
      const sessions = await listAuthSessions(authUserId, { status: body.status || null });
      const devices = await listAuthDevices(authUserId);
      return res.status(200).json({ ok: true, sessions, devices });
    }

    if (action === "revoke") {
      const sessionId = String(body.sessionId || "").trim();
      if (!sessionId) {
        return res.status(400).json({ ok: false, error: "sessionId required" });
      }
      const result = await revokeAuthSession(sessionId, "member_revoked", "member");
      return res.status(result.ok ? 200 : 404).json(result);
    }

    if (action === "revoke-all") {
      const ctx = parseAuthRequestContext(req, body);
      const currentSessionId =
        String(body.currentSessionId || "").trim() ||
        (body.session ? deriveSessionId(body.session) : ctx.deviceId);
      const result = await revokeAllAuthSessions(authUserId, currentSessionId || null);
      return res.status(200).json(result);
    }

    if (action === "logout") {
      const ctx = parseAuthRequestContext(req, body);
      const sessionId =
        String(body.sessionId || "").trim() ||
        (body.session ? deriveSessionId(body.session) : null);
      await recordAuthLogout(req, {
        authUserId,
        profileId,
        sessionId,
        deviceId: ctx.deviceId
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "revoke-device") {
      const deviceId = String(body.deviceId || "").trim();
      if (!deviceId) {
        return res.status(400).json({ ok: false, error: "deviceId required" });
      }
      const result = await revokeAuthDevice(authUserId, deviceId);
      return res.status(result.ok ? 200 : 404).json(result);
    }

    if (action === "trust-device") {
      const deviceId = String(body.deviceId || "").trim();
      if (!deviceId) {
        return res.status(400).json({ ok: false, error: "deviceId required" });
      }
      const result = await setDeviceTrusted(authUserId, deviceId, body.trusted !== false);
      return res.status(result.ok ? 200 : 404).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "auth_sessions_error",
      error,
      status: 500,
      message: "Session request failed.",
      context: { action }
    });
  }
}
