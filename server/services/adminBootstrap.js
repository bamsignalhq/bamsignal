import crypto from "node:crypto";
import { upsertPlatformAdmin } from "../db.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";

function supabaseAdminUrl(path) {
  const base = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
}

function randomPassword() {
  return crypto.randomBytes(12).toString("base64url");
}

export async function bootstrapOpsAdmin({
  email = "ops@bamsignal.com",
  password,
  role = "admin"
} = {}) {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail.includes("@")) {
    return { ok: false, error: "Valid admin email is required." };
  }

  const headers = supabaseServiceHeaders();
  if (!headers?.Authorization) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is required to bootstrap admin login." };
  }

  const finalPassword = String(password || process.env.ADMIN_BOOTSTRAP_PASSWORD || "").trim() || randomPassword();
  const generated = !String(password || process.env.ADMIN_BOOTSTRAP_PASSWORD || "").trim();

  let userId = null;
  let created = false;

  const listResponse = await fetch(
    `${supabaseAdminUrl("/auth/v1/admin/users")}?${new URLSearchParams({
      page: "1",
      per_page: "1",
      email: normalizedEmail
    })}`,
    { headers }
  );
  if (listResponse.ok) {
    const payload = await listResponse.json();
    const existing = Array.isArray(payload?.users) ? payload.users[0] : null;
    if (existing?.id) {
      userId = existing.id;
      const updateResponse = await fetch(`${supabaseAdminUrl("/auth/v1/admin/users")}/${userId}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: finalPassword,
          email_confirm: true
        })
      });
      if (!updateResponse.ok) {
        const err = await updateResponse.json().catch(() => ({}));
        return { ok: false, error: err.msg || err.message || "Could not update admin password." };
      }
    }
  }

  if (!userId) {
    const createResponse = await fetch(`${supabaseAdminUrl("/auth/v1/admin/users")}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: finalPassword,
        email_confirm: true,
        user_metadata: { name: "BamSignal Ops" }
      })
    });
    const createdPayload = await createResponse.json().catch(() => ({}));
    if (!createResponse.ok) {
      return {
        ok: false,
        error: createdPayload.msg || createdPayload.message || "Could not create admin auth user."
      };
    }
    userId = createdPayload.id || createdPayload.user?.id || null;
    created = true;
  }

  const adminRow = await upsertPlatformAdmin(normalizedEmail, role);

  return {
    ok: true,
    email: normalizedEmail,
    userId,
    created,
    password: generated ? finalPassword : undefined,
    generated,
    dbAdmin: adminRow
  };
}
