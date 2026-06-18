import crypto from "node:crypto";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { isDatabaseReady, query } from "../db.js";
import { ensureMemberTrustSchema } from "../memberTrust.js";
import { escapeHtml, loadEmailBranding, wrapEmailLayoutAsync } from "./emailBranding.js";
import { writeAuditLog } from "./auditLog.js";
import {
  isSendchampConfigured,
  sendWhatsAppVerificationOtp,
  confirmWhatsAppVerificationOtp,
  SendchampError
} from "./sendchamp.js";
import { getPhoneVerifiedStatus } from "./whatsappVerification.js";

const TRUSTED_DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 8;

export class Login2faError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = "Login2faError";
    this.status = status;
    this.code = code;
  }
}

export async function ensureAccountSecuritySchema() {
  if (!isDatabaseReady()) return;
  await ensureMemberTrustSchema();

  await query(
    "alter table app_member_profiles add column if not exists two_factor_enabled boolean not null default false"
  );
  await query("alter table app_member_profiles add column if not exists two_factor_method text");
  await query(
    "alter table app_member_profiles add column if not exists trusted_devices jsonb not null default '[]'::jsonb"
  );
  await query("alter table app_member_profiles add column if not exists last_2fa_at timestamptz");

  await query(`
    create table if not exists login_2fa_codes (
      user_key text primary key,
      code_hash text,
      method text not null,
      verification_reference text,
      attempts int not null default 0,
      last_sent_at timestamptz not null default now(),
      expires_at timestamptz not null,
      device_id text,
      ip text
    )
  `);
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

function normalizeTrustedDevices(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((row) => row && row.deviceId);
}

function isDeviceTrusted(devices, deviceId) {
  if (!deviceId) return false;
  const now = Date.now();
  for (const device of normalizeTrustedDevices(devices)) {
    if (device.deviceId !== deviceId) continue;
    const expires = device.trustedUntil ? new Date(device.trustedUntil).getTime() : 0;
    if (expires > now) return true;
  }
  return false;
}

function pruneTrustedDevices(devices) {
  const now = Date.now();
  return normalizeTrustedDevices(devices).filter((device) => {
    const expires = device.trustedUntil ? new Date(device.trustedUntil).getTime() : 0;
    return expires > now;
  });
}

function trustDeviceEntry(devices, { deviceId, ip, userAgent }) {
  const pruned = pruneTrustedDevices(devices);
  const trustedUntil = new Date(Date.now() + TRUSTED_DEVICE_TTL_MS).toISOString();
  const without = pruned.filter((row) => row.deviceId !== deviceId);
  return [
    ...without,
    {
      deviceId,
      ip: ip || null,
      userAgent: userAgent || null,
      trustedAt: new Date().toISOString(),
      trustedUntil
    }
  ];
}

async function sendLoginEmailCode(email, name = "") {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Login2faError(503, "Email delivery is not configured. Try again shortly.", "resend_not_configured");
  }

  const code = generateCode();
  const safeName = String(name || "there").trim() || "there";
  const branding = await loadEmailBranding();
  const bodyHtml = `
    <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Verify it's you</p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">Your login code</h1>
    <p style="margin:0 0 20px;color:#dbe5f4;line-height:1.7">Hi ${escapeHtml(safeName)}, enter this code to finish signing in on a new device. It expires in 10 minutes.</p>
    <div style="display:inline-block;padding:16px 28px;border-radius:16px;background:#18243b;border:1px solid #253553;font-size:32px;font-weight:800;letter-spacing:0.35em;color:#f8fafc">${code}</div>
    <p style="margin:20px 0 0;color:#9db0cf;line-height:1.6;font-size:14px">If you didn't try to sign in, change your PIN and contact support.</p>
  `;
  const html = await wrapEmailLayoutAsync({
    branding,
    preheader: `Your BamSignal login code is ${code}`,
    bodyHtml
  });

  const from =
    process.env.SIGNUP_EMAIL_FROM?.trim() ||
    process.env.SUPPORT_EMAIL_FROM?.trim() ||
    "BamSignal <support@bamsignal.com>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your BamSignal login code",
      html,
      text: `Your BamSignal login code is ${code}. It expires in 10 minutes.`
    })
  });

  if (!response.ok) {
    console.error("[bamsignal] login 2FA email failed:", await response.text());
    throw new Login2faError(
      502,
      "We couldn't send the code right now. Wait a minute and try again.",
      "otp_send_failed"
    );
  }

  return { code, hash: hashCode(code) };
}

export async function whatsapp2faAvailable({ email, phone }) {
  if (!isSendchampConfigured()) return false;
  return getPhoneVerifiedStatus({ email, phone });
}

export async function getAccountSecuritySettings({ email, phone }) {
  if (!isDatabaseReady()) {
    return {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      whatsappAvailable: false,
      trustedDeviceCount: 0
    };
  }

  await ensureAccountSecuritySchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member) {
    return {
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      whatsappAvailable: false,
      trustedDeviceCount: 0
    };
  }

  const whatsappAvailable = await whatsapp2faAvailable({ email, phone });
  const devices = pruneTrustedDevices(member.trusted_devices);

  return {
    twoFactorEnabled: Boolean(member.two_factor_enabled),
    twoFactorMethod: member.two_factor_method === "whatsapp" ? "whatsapp" : "email",
    whatsappAvailable,
    trustedDeviceCount: devices.length,
    last2faAt: member.last_2fa_at || null
  };
}

export async function setTwoFactorEnabled({
  email,
  phone,
  enabled,
  method = "email",
  ip = null,
  userAgent = null
}) {
  if (!isDatabaseReady()) return { ok: false, error: "Database unavailable." };
  await ensureAccountSecuritySchema();

  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return { ok: false, error: "Profile not found." };

  const nextEnabled = Boolean(enabled);
  let nextMethod = method === "whatsapp" ? "whatsapp" : "email";

  if (nextEnabled && nextMethod === "whatsapp") {
    const available = await whatsapp2faAvailable({ email, phone });
    if (!available) {
      nextMethod = "email";
    }
  }

  const result = await query(
    `update app_member_profiles
     set two_factor_enabled = $2,
         two_factor_method = $3,
         updated_at = now()
     where id = $1
     returning *`,
    [member.id, nextEnabled, nextEnabled ? nextMethod : null]
  );

  if (result.rows[0]) {
    await writeAuditLog({
      userId: member.id,
      action: nextEnabled ? "two_factor_enabled" : "two_factor_disabled",
      details: { method: nextEnabled ? nextMethod : null },
      ip,
      userAgent
    });
  }

  return {
    ok: Boolean(result.rows[0]),
    twoFactorEnabled: nextEnabled,
    twoFactorMethod: nextEnabled ? nextMethod : null
  };
}

export async function checkLoginRequires2fa({ email, phone, deviceId }) {
  if (!isDatabaseReady()) return { required: false };
  await ensureAccountSecuritySchema();

  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id || !member.two_factor_enabled) {
    return { required: false };
  }

  if (isDeviceTrusted(member.trusted_devices, deviceId)) {
    return { required: false };
  }

  let method = member.two_factor_method === "whatsapp" ? "whatsapp" : "email";
  if (method === "whatsapp") {
    const available = await whatsapp2faAvailable({ email, phone });
    if (!available) method = "email";
  }

  return {
    required: true,
    method,
    maskedEmail: member.email ? maskEmail(member.email) : null,
    maskedPhone: member.phone ? maskPhone(member.phone) : null
  };
}

function maskEmail(email) {
  const [local, domain] = String(email).split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function maskPhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `***${digits.slice(-4)}`;
}

export async function sendLogin2faCode({ email, phone, deviceId, ip = null, userAgent = null }) {
  if (!isDatabaseReady()) {
    throw new Login2faError(503, "We couldn't verify this login. Please try again.");
  }
  await ensureAccountSecuritySchema();

  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id || !member.two_factor_enabled) {
    throw new Login2faError(400, "Extra login protection is not enabled for this account.");
  }

  const check = await checkLoginRequires2fa({ email, phone, deviceId });
  if (!check.required) {
    return { ok: true, skipped: true };
  }

  const method = check.method === "whatsapp" ? "whatsapp" : "email";
  const userKey = member.user_key;
  const existing = await query(
    `select extract(epoch from last_sent_at) * 1000 as last_sent
     from login_2fa_codes where user_key = $1`,
    [userKey]
  );
  const lastSent = Number(existing.rows[0]?.last_sent || 0);
  const now = Date.now();
  if (lastSent && now - lastSent < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);
    throw new Login2faError(429, `Wait ${waitSec}s before requesting another code.`);
  }

  const expiresAt = new Date(now + OTP_TTL_MS);

  if (method === "whatsapp") {
    const sendchampPhone = member.phone?.startsWith("234") ? member.phone : `234${member.phone}`;
    const result = await sendWhatsAppVerificationOtp({ phone: sendchampPhone });
    const reference = result?.reference;
    if (!reference) {
      throw new Login2faError(502, "We couldn't send the code right now. Please try again.");
    }

    await query(
      `insert into login_2fa_codes (user_key, method, verification_reference, attempts, last_sent_at, expires_at, device_id, ip)
       values ($1, $2, $3, 0, now(), $4, $5, $6)
       on conflict (user_key)
       do update set
         method = excluded.method,
         verification_reference = excluded.verification_reference,
         code_hash = null,
         attempts = 0,
         last_sent_at = now(),
         expires_at = excluded.expires_at,
         device_id = excluded.device_id,
         ip = excluded.ip`,
      [userKey, "whatsapp", reference, expiresAt.toISOString(), deviceId || null, ip || null]
    );

    return { ok: true, method: "whatsapp", message: "Code sent on WhatsApp." };
  }

  const { code, hash } = await sendLoginEmailCode(member.email, member.name || member.profile?.name);
  await query(
    `insert into login_2fa_codes (user_key, code_hash, method, attempts, last_sent_at, expires_at, device_id, ip)
     values ($1, $2, $3, 0, now(), $4, $5, $6)
     on conflict (user_key)
     do update set
       code_hash = excluded.code_hash,
       method = excluded.method,
       verification_reference = null,
       attempts = 0,
       last_sent_at = now(),
       expires_at = excluded.expires_at,
       device_id = excluded.device_id,
       ip = excluded.ip`,
    [userKey, hash, "email", expiresAt.toISOString(), deviceId || null, ip || null]
  );

  return { ok: true, method: "email", message: "Code sent to your email." };
}

export async function verifyLogin2faCode({
  email,
  phone,
  code,
  deviceId,
  ip = null,
  userAgent = null
}) {
  if (!isDatabaseReady()) {
    throw new Login2faError(503, "We couldn't verify this login. Please try again.");
  }
  await ensureAccountSecuritySchema();

  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) {
    throw new Login2faError(400, "We couldn't verify this login. Please try again.");
  }

  const stored = await query(`select * from login_2fa_codes where user_key = $1`, [member.user_key]);
  const row = stored.rows[0];
  if (!row) {
    throw new Login2faError(400, "We couldn't verify this login. Please try again.");
  }

  if (Date.now() > new Date(row.expires_at).getTime()) {
    await query(`delete from login_2fa_codes where user_key = $1`, [member.user_key]);
    throw new Login2faError(400, "That code has expired. Request a new one.");
  }

  if (Number(row.attempts) >= MAX_VERIFY_ATTEMPTS) {
    throw new Login2faError(429, "Too many attempts. Request a new code.");
  }

  let verified = false;
  if (row.method === "whatsapp") {
    try {
      await confirmWhatsAppVerificationOtp({
        reference: row.verification_reference,
        code: String(code || "").trim()
      });
      verified = true;
    } catch (error) {
      await query(
        `update login_2fa_codes set attempts = attempts + 1 where user_key = $1`,
        [member.user_key]
      );
      if (error instanceof SendchampError) {
        throw new Login2faError(400, "We couldn't verify this login. Please try again.");
      }
      throw error;
    }
  } else {
    const candidate = hashCode(String(code || "").trim());
    if (!row.code_hash || candidate !== row.code_hash) {
      await query(
        `update login_2fa_codes set attempts = attempts + 1 where user_key = $1`,
        [member.user_key]
      );
      throw new Login2faError(400, "We couldn't verify this login. Please try again.");
    }
    verified = true;
  }

  if (!verified) {
    throw new Login2faError(400, "We couldn't verify this login. Please try again.");
  }

  await query(`delete from login_2fa_codes where user_key = $1`, [member.user_key]);

  const trustedDevices = trustDeviceEntry(member.trusted_devices, {
    deviceId: deviceId || row.device_id,
    ip,
    userAgent
  });

  await query(
    `update app_member_profiles
     set trusted_devices = $2::jsonb,
         last_2fa_at = now(),
         updated_at = now()
     where id = $1`,
    [member.id, JSON.stringify(trustedDevices)]
  );

  await writeAuditLog({
    userId: member.id,
    action: "new_device_verified",
    details: { method: row.method, deviceId: deviceId || row.device_id || null },
    ip,
    userAgent
  });

  return { ok: true };
}
