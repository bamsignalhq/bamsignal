import { requireMemberAuth } from "../../server/services/memberAuth.js";
import {
  getAccountLifecycleSnapshot,
  listLifecycleTransitions,
  listAuthSecurityEventsForProfile
} from "../../server/services/auth/index.js";
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
  const action = String(req.query.action || body.action || "lifecycle").toLowerCase();

  try {
    const auth = await requireMemberAuth(req, body);
    if (!auth.ok) {
      return res.status(auth.status || 401).json({ ok: false, error: auth.error || "Unauthorized" });
    }

    const profileId = auth.memberId;
    if (!profileId) {
      return res.status(404).json({ ok: false, error: "Profile not found" });
    }

    if (action === "lifecycle") {
      const snapshot = await getAccountLifecycleSnapshot(auth.member || {}, {
        emailVerified: true,
        pinLocked: false
      });
      const transitions = await listLifecycleTransitions(profileId, { limit: body.limit });
      return res.status(200).json({ ok: true, lifecycle: snapshot, transitions });
    }

    if (action === "security-events") {
      const events = await listAuthSecurityEventsForProfile(profileId, { limit: body.limit });
      return res.status(200).json({ ok: true, events });
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "auth_account_error",
      error,
      status: 500,
      message: "Account request failed.",
      context: { action }
    });
  }
}
