import { pingDatabase } from "../../server/db.js";
import { ensureApiRequestContext, sendLoggedApiError } from "../../server/services/errorResponse.js";

/** Lightweight database latency probe for performance certification and ops. */
export default async function handler(req, res) {
  if (req.method !== "HEAD" && req.method !== "GET") {
    return sendLoggedApiError({
      req,
      res,
      status: 405,
      message: "Method not allowed.",
      errorCode: "method_not_allowed",
      event: "db_ping_method_not_allowed"
    });
  }

  const started = Date.now();
  const ok = await pingDatabase();
  const durationMs = Date.now() - started;

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Server-Timing", `db;dur=${durationMs}`);

  if (req.method === "HEAD") {
    res.status(ok ? 200 : 503).end();
    return;
  }

  const { requestId } = ensureApiRequestContext(req, res);
  if (ok) {
    return res.status(200).json({ ok: true, durationMs, requestId });
  }

  return res.status(503).json({
    ok: false,
    error: "Database unavailable.",
    errorCode: "database_unavailable",
    durationMs,
    requestId
  });
}
