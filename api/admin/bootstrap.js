import { bootstrapOpsAdmin } from "../../server/services/adminBootstrap.js";

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

  const allowedSecrets = [process.env.CRON_SECRET, process.env.DIAGNOSTICS_SECRET].filter(Boolean);
  const body = parseBody(req);
  const provided =
    req.headers["x-bamsignal-secret"] || req.query.secret || body.secret || req.headers.authorization?.replace(/^Bearer /i, "");
  if (!provided || !allowedSecrets.includes(provided)) {
    return res.status(401).json({ ok: false, error: "Bootstrap secret required." });
  }

  try {
    const result = await bootstrapOpsAdmin({
      email: body.email || process.env.ADMIN_BOOTSTRAP_EMAIL || "ops@bamsignal.com",
      password: body.password || process.env.ADMIN_BOOTSTRAP_PASSWORD
    });
    if (!result.ok) {
      return res.status(500).json(result);
    }
    return res.status(200).json({
      ok: true,
      email: result.email,
      userId: result.userId,
      created: result.created,
      dbAdmin: result.dbAdmin,
      password: result.password,
      generated: result.generated,
      message: result.generated
        ? "Admin user ready. Copy the password now — it will not be shown again."
        : "Admin user password updated."
    });
  } catch (error) {
    console.error("[bamsignal] admin bootstrap error:", error);
    return res.status(500).json({ ok: false, error: error.message || "Bootstrap failed." });
  }
}
