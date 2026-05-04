import { findAppUserIdentity, upsertAppUserIdentity } from "../../server/db.js";
import { registerDevicePush } from "../../server/firebase.js";

function normalizePhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234") && digits.length >= 13) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

function normalizePayload(body = {}) {
  return {
    email: String(body.email || "").trim().toLowerCase(),
    phone: normalizePhone(body.phone),
    name: String(body.name || "").trim(),
    referralCode: String(body.referralCode || "").trim().toUpperCase()
  };
}

function allowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function verifySupabaseAdmin(req) {
  const adminEmails = allowedAdminEmails();
  if (!adminEmails.length) return false;

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
  return adminEmails.includes(String(user.email || "").toLowerCase());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    if (req.query.action === "admin-session") {
      const allowedSecrets = [process.env.SIGNAL_WORKER_SECRET, process.env.CRON_SECRET].filter(Boolean);
      const provided = req.headers["x-bamsignal-secret"] || req.query.secret || req.body?.secret;
      if (provided && allowedSecrets.includes(provided)) return res.status(200).json({ ok: true, method: "secret" });
      if (await verifySupabaseAdmin(req)) return res.status(200).json({ ok: true, method: "supabase" });
      return res.status(401).json({ ok: false, error: "Admin login required." });
    }

    const identity = normalizePayload(req.body);
    if (!identity.email && !identity.phone) {
      return res.status(400).json({ ok: false, error: "Email or phone number is required" });
    }

    if (req.query.action === "status") {
      const user = await findAppUserIdentity(identity);
      return res.status(200).json({ ok: true, user });
    }

    if (req.query.action === "push-token") {
      const token = String(req.body?.token || "").trim();
      if (!token) return res.status(400).json({ ok: false, error: "Push token is required" });
      const user = await findAppUserIdentity(identity);
      const premiumUntil = user?.premium_until ? new Date(user.premium_until).getTime() : 0;
      const isPremium = Boolean(user?.is_premium && premiumUntil > Date.now());
      const registration = await registerDevicePush({ token, isPremium });
      return res.status(200).json({ ok: true, is_premium: isPremium, registration });
    }

    if (req.query.action === "register") {
      const existing = await findAppUserIdentity(identity);
      const emailTaken = existing?.email && identity.email && existing.email.toLowerCase() !== identity.email.toLowerCase();
      const phoneTaken = existing?.phone && identity.phone && existing.phone !== identity.phone;
      if (emailTaken || phoneTaken) {
        return res.status(409).json({
          ok: false,
          exists: true,
          field: emailTaken ? "email" : "phone",
          error: `${emailTaken ? "Email" : "Phone number"} is already in use. Login instead.`
        });
      }
      const user = await upsertAppUserIdentity(identity);
      return res.status(200).json({ ok: true, user });
    }

    const existing = await findAppUserIdentity(identity);
    if (!existing) return res.status(200).json({ ok: true, exists: false });

    const field = identity.email && existing.email?.toLowerCase() === identity.email ? "email" : "phone";
    return res.status(200).json({ ok: true, exists: true, field });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Identity check failed" });
  }
}
