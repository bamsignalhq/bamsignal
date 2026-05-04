import { findAppUserIdentity, upsertAppUserIdentity } from "../../server/db.js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const identity = normalizePayload(req.body);
    if (!identity.email && !identity.phone) {
      return res.status(400).json({ ok: false, error: "Email or phone number is required" });
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
