import { commandCenterEmails } from "./consoleEnv.js";
import { isPlatformAdminEmail } from "./db.js";
import {
  GENERIC_NOT_AUTHORIZED,
  logAdminStatusHidden
} from "./services/identityExposure.js";
import { logAlertableEvent, observabilityContext } from "./services/observability.js";

export function allowedAdminEmails() {
  return commandCenterEmails();
}

export async function verifySupabaseAdmin(req) {
  const adminEmails = allowedAdminEmails();
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!bearer || !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) return false;

  const response = await fetch(`${process.env.VITE_SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${bearer}`
    }
  });
  if (!response.ok) return false;
  const user = await response.json();
  const email = String(user.email || "").toLowerCase();
  return adminEmails.includes(email) || (await isPlatformAdminEmail(email));
}

export async function requireAdmin(req, res) {
  const allowedSecrets = [process.env.CRON_SECRET].filter(Boolean);
  const provided = req.headers["x-bamsignal-secret"];
  if (provided && allowedSecrets.includes(provided)) {
    logAlertableEvent(
      "admin_cron_secret_auth",
      observabilityContext(req, {
        endpoint: req?.path || req?.url || "admin"
      })
    );
    return true;
  }
  if (await verifySupabaseAdmin(req)) return true;
  logAdminStatusHidden({ endpoint: req?.path || req?.url || "admin" });
  logAlertableEvent(
    "admin_auth_failed",
    observabilityContext(req, {
      endpoint: req?.path || req?.url || "admin"
    })
  );
  res.status(401).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
  return false;
}
