import { requireAdmin } from "../../server/adminAuth.js";
import { getDatabaseStatus } from "../../server/db.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";
import {
  getMessagingObservabilityMetrics,
  listOpenModerationEvents,
  listRealtimeEvents,
  processPendingDeliveries,
  expireStalePresence,
  expireStaleTyping
} from "../../server/services/messaging/index.js";

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

  if (!(await requireAdmin(req, res))) return;

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected.", database });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "metrics").toLowerCase();

  try {
    if (action === "metrics") {
      return res.status(200).json({ ok: true, metrics: getMessagingObservabilityMetrics() });
    }

    if (action === "moderation-queue") {
      const events = await listOpenModerationEvents({ limit: body.limit });
      return res.status(200).json({ ok: true, events });
    }

    if (action === "realtime-events") {
      const events = await listRealtimeEvents({
        eventType: body.eventType || null,
        conversationId: body.conversationId || null,
        limit: body.limit
      });
      return res.status(200).json({ ok: true, events });
    }

    if (action === "process-deliveries") {
      const result = await processPendingDeliveries({ limit: body.limit });
      return res.status(200).json({ ok: true, ...result });
    }

    if (action === "expire-stale") {
      const [presence, typing] = await Promise.all([expireStalePresence(), expireStaleTyping()]);
      return res.status(200).json({ ok: true, presence, typing });
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "messaging_admin_error",
      error,
      status: 500,
      message: "Messaging admin request failed.",
      context: { action }
    });
  }
}
