import { query } from "../db.js";
import {
  confirmWhatsAppVerificationOtp,
  sendWhatsAppVerificationOtp,
  SendchampError
} from "./sendchamp.js";
import {
  isValidNigerianPhone,
  normalizeNigerianPhoneLocal,
  toSendchampPhone
} from "../utils/nigerianPhone.js";

const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 8;

export class WhatsappVerificationError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "WhatsappVerificationError";
    this.status = status;
  }
}

async function ensureWhatsappVerificationTable() {
  await query(`
    create table if not exists whatsapp_verification_codes (
      phone text primary key,
      verification_reference text not null,
      attempts int not null default 0,
      last_sent_at timestamptz not null default now(),
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `);
}

async function readStored(phone) {
  const { rows } = await query(
    `select verification_reference, attempts,
            extract(epoch from expires_at) * 1000 as expires,
            extract(epoch from last_sent_at) * 1000 as last_sent
     from whatsapp_verification_codes where phone = $1`,
    [phone]
  );
  return rows[0] || null;
}

async function writeStored(phone, reference, expiresAt) {
  await query(
    `insert into whatsapp_verification_codes (phone, verification_reference, attempts, last_sent_at, expires_at)
     values ($1, $2, 0, now(), $3)
     on conflict (phone) do update set
       verification_reference = excluded.verification_reference,
       attempts = 0,
       last_sent_at = excluded.last_sent_at,
       expires_at = excluded.expires_at`,
    [phone, reference, expiresAt]
  );
}

async function bumpAttempts(phone) {
  const { rows } = await query(
    `update whatsapp_verification_codes set attempts = attempts + 1 where phone = $1 returning attempts`,
    [phone]
  );
  return Number(rows[0]?.attempts) || 0;
}

async function clearStored(phone) {
  await query(`delete from whatsapp_verification_codes where phone = $1`, [phone]);
}

export async function startWhatsappVerification(rawPhone) {
  await ensureWhatsappVerificationTable();

  if (!isValidNigerianPhone(rawPhone)) {
    throw new WhatsappVerificationError(400, "Enter a valid Nigerian phone number.");
  }

  const localPhone = normalizeNigerianPhoneLocal(rawPhone);
  const sendchampPhone = toSendchampPhone(rawPhone);
  const existing = await readStored(localPhone);
  const now = Date.now();

  if (existing?.last_sent && now - Number(existing.last_sent) < RESEND_COOLDOWN_MS) {
    throw new WhatsappVerificationError(
      429,
      "Please wait a minute before requesting another code."
    );
  }

  const result = await sendWhatsAppVerificationOtp({ phone: sendchampPhone });
  const reference =
    result?.reference ||
    result?.verification_reference ||
    result?.data?.reference ||
    result?.data?.verification_reference;

  if (!reference) {
    throw new WhatsappVerificationError(502, "We couldn't send the code right now. Please try again.");
  }

  const expiresAt = new Date(now + 10 * 60 * 1000);
  await writeStored(localPhone, reference, expiresAt);

  return { ok: true, message: "Verification code sent.", phone: localPhone };
}

export async function confirmWhatsappVerification(rawPhone, code) {
  await ensureWhatsappVerificationTable();

  if (!isValidNigerianPhone(rawPhone)) {
    throw new WhatsappVerificationError(400, "Enter a valid Nigerian phone number.");
  }

  const localPhone = normalizeNigerianPhoneLocal(rawPhone);
  const stored = await readStored(localPhone);

  if (!stored?.verification_reference) {
    throw new WhatsappVerificationError(400, "Request a new code and try again.");
  }

  if (Date.now() > Number(stored.expires || 0)) {
    await clearStored(localPhone);
    throw new WhatsappVerificationError(400, "That code has expired. Request a new one.");
  }

  if (Number(stored.attempts) >= MAX_ATTEMPTS) {
    throw new WhatsappVerificationError(429, "Too many attempts. Request a new code.");
  }

  try {
    await confirmWhatsAppVerificationOtp({
      reference: stored.verification_reference,
      code
    });
  } catch (error) {
    await bumpAttempts(localPhone);
    if (error instanceof SendchampError) {
      throw new WhatsappVerificationError(
        error.status >= 500 ? 502 : 400,
        "That code is not correct. Please check and try again."
      );
    }
    throw error;
  }

  await clearStored(localPhone);
  await markPhoneVerified(localPhone);

  return { ok: true, phone: localPhone, phoneVerified: true };
}

export async function markPhoneVerified(localPhone, { email } = {}) {
  await query("alter table app_users add column if not exists phone_verified boolean not null default false");
  await query("alter table app_users add column if not exists phone_verified_at timestamptz");

  await query(
    `update app_users
     set phone = coalesce(phone, $1),
         phone_verified = true,
         phone_verified_at = now(),
         updated_at = now()
     where phone = $1 or ($2::text is not null and lower(email) = lower($2::text))`,
    [localPhone, email || null]
  );
}

export async function getPhoneVerifiedStatus({ email, phone }) {
  await query("alter table app_users add column if not exists phone_verified boolean not null default false");
  const localPhone = phone ? normalizeNigerianPhoneLocal(phone) : "";
  const { rows } = await query(
    `select phone_verified, phone from app_users
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     limit 1`,
    [email || null, localPhone || null]
  );
  return Boolean(rows[0]?.phone_verified);
}
