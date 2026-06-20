import { createConsoleOperator, needsConsoleSetup } from "../../server/services/consoleSetup.js";
import { logAdminStatusHidden } from "../../server/services/identityExposure.js";

function hasSetupSecret(req) {
  const allowed = String(process.env.CRON_SECRET || "").trim();
  if (!allowed) return false;
  const provided = String(
    req.headers["x-bamsignal-secret"] ||
      req.query.secret ||
      parseBody(req)?.setupSecret ||
      ""
  ).trim();
  return Boolean(provided && provided === allowed);
}

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
  const action = String(req.query.action || "status").toLowerCase();

  if (action === "status") {
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    try {
      if (!hasSetupSecret(req)) {
        logAdminStatusHidden({ endpoint: "hard/setup", action: "status" });
        return res.status(200).json({ ok: true });
      }
      const needsSetup = await needsConsoleSetup();
      return res.status(200).json({ ok: true, needsSetup });
    } catch (error) {
      console.error("[bamsignal] console setup status error:", error);
      return res.status(500).json({ ok: false, error: "Could not check setup status." });
    }
  }

  if (action === "create") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = parseBody(req);
    try {
      const result = await createConsoleOperator({
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
        setupSecret: body.setupSecret
      });
      if (!result.ok) {
        return res.status(result.status || 500).json({ ok: false, error: result.error || "Setup failed." });
      }
      return res.status(200).json({
        ok: true,
        email: result.email,
        created: result.created
      });
    } catch (error) {
      console.error("[bamsignal] console setup create error:", error);
      return res.status(500).json({ ok: false, error: error.message || "Setup failed." });
    }
  }

  return res.status(400).json({ ok: false, error: "Unknown action." });
}
