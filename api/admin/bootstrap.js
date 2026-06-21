import { bootstrapOpsAdmin } from "../../server/services/adminBootstrap.js";
import {
  logAdminBootstrapSuccess,
  requireAdminBootstrapAccess,
  sendAdminBootstrapAccessDenied
} from "../../server/services/adminBootstrapAccess.js";

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

  const access = requireAdminBootstrapAccess(req);
  if (!access.ok) {
    return sendAdminBootstrapAccessDenied(res, access);
  }

  const body = parseBody(req);

  try {
    const result = await bootstrapOpsAdmin({
      email: body.email || process.env.ADMIN_BOOTSTRAP_EMAIL || "ops@bamsignal.com",
      password: body.password || process.env.ADMIN_BOOTSTRAP_PASSWORD
    });
    if (!result.ok) {
      return res.status(500).json({ ok: false, error: result.error || "Bootstrap failed." });
    }

    logAdminBootstrapSuccess(req, {
      email: result.email,
      userId: result.userId,
      created: result.created
    });

    return res.status(200).json({
      ok: true,
      message: result.created ? "Admin user ready." : "Admin user updated."
    });
  } catch (error) {
    console.error("[bamsignal] admin bootstrap error:", error instanceof Error ? error.message : "Bootstrap failed.");
    return res.status(500).json({ ok: false, error: "Bootstrap failed." });
  }
}
