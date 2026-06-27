import { pingDatabase } from "../../server/db.js";

/** Lightweight database latency probe for performance certification and ops. */
export default async function handler(req, res) {
  if (req.method !== "HEAD" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
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

  res.status(ok ? 200 : 503).json({ ok, durationMs });
}
