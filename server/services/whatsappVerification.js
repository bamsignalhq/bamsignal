import { query } from "../db.js";
import { assertSchemaTable } from "./schemaVerification.js";
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
import { logWhatsappVerification } from "./verificationLog.js";
import {
  mapSendchampConfirmError,
  mapSendchampStartError,
  VERIFICATION_ERROR_CODES,
  WhatsappVerificationError
} from "./whatsappVerificationErrors.js";

export { WhatsappVerificationError, VERIFICATION_ERROR_CODES };

const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 8;
const OTP_EXPIRATION_MS = 30 * 60 * 1000;

async function ensureWhatsappVerificationTable() {
  await assertSchemaTable("whatsapp_verification_codes");
}

async function readStored(phone) {
  const { rows } = await query(
    `select verification_reference, attempts, delivery_status,
            extract(epoch from expires_at) * 1000 as expires,
            extract(epoch from last_sent_at) * 1000 as last_sent
     from whatsapp_verification_codes where phone = $1`,
    [phone]
  );
  return rows[0] || null;
}

async function writeStored(phone, reference, expiresAt, { userEmail, deliveryStatus = "sent" } = {}) {
  await query(
    `insert into whatsapp_verification_codes (
       phone, verification_reference, attempts, last_sent_at, expires_at, delivery_status, user_email
     )
     values ($1, $2, 0, now(), $3, $4, $5)
     on conflict (phone) do update set
       verification_reference = excluded.verification_reference,
       attempts = 0,
       last_sent_at = excluded.last_sent_at,
       expires_at = excluded.expires_at,
       delivery_status = excluded.delivery_status,
       user_email = coalesce(excluded.user_email, whatsapp_verification_codes.user_email)`,
    [phone, reference, expiresAt, deliveryStatus, userEmail || null]
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

function buildLogContext({ requestId, memberId, phone, normalizedPhone }) {
  return {
    requestId: requestId || null,
    memberId: memberId || null,
    phone: phone || null,
    normalizedPhone: normalizedPhone || null,
    provider: "sendchamp"
  };
}

export async function startWhatsappVerification(rawPhone, { email, requestId, memberId } = {}) {
  await ensureWhatsappVerificationTable();

  const logContext = buildLogContext({
    requestId,
    memberId: memberId || email,
    phone: rawPhone,
    normalizedPhone: null
  });

  if (!isValidNigerianPhone(rawPhone)) {
    logWhatsappVerification(
      "start_rejected",
      { ...logContext, failureReason: "invalid_phone" },
      "warn"
    );
    throw new WhatsappVerificationError(
      400,
      "Invalid phone number.",
      VERIFICATION_ERROR_CODES.INVALID_PHONE
    );
  }

  const localPhone = normalizeNigerianPhoneLocal(rawPhone);
  const sendchampPhone = toSendchampPhone(rawPhone);
  logContext.normalizedPhone = sendchampPhone;

  const existing = await readStored(localPhone);
  const now = Date.now();

  if (existing?.last_sent && now - Number(existing.last_sent) < RESEND_COOLDOWN_MS) {
    logWhatsappVerification(
      "start_rejected",
      { ...logContext, failureReason: "rate_limited" },
      "warn"
    );
    throw new WhatsappVerificationError(
      429,
      "Please wait a minute before requesting another code.",
      VERIFICATION_ERROR_CODES.RATE_LIMITED
    );
  }

  const started = Date.now();
  let result;

  try {
    result = await sendWhatsAppVerificationOtp({ phone: sendchampPhone, logContext });
  } catch (error) {
    logWhatsappVerification(
      "start_failed",
      {
        ...logContext,
        durationMs: Date.now() - started,
        failureReason: error instanceof SendchampError ? error.code : "unexpected_error"
      },
      "error"
    );
    throw mapSendchampStartError(error);
  }

  const reference = result?.reference;
  if (!reference) {
    logWhatsappVerification(
      "start_failed",
      {
        ...logContext,
        durationMs: Date.now() - started,
        failureReason: "missing_reference"
      },
      "error"
    );
    throw new WhatsappVerificationError(
      502,
      "Unable to contact WhatsApp service.",
      VERIFICATION_ERROR_CODES.DELIVERY_FAILED
    );
  }

  const expiresAt = new Date(now + OTP_EXPIRATION_MS);
  await writeStored(localPhone, reference, expiresAt, {
    userEmail: email ? String(email).trim().toLowerCase() : null,
    deliveryStatus: result?.status || "sent"
  });

  logWhatsappVerification("start_success", {
    ...logContext,
    durationMs: Date.now() - started,
    deliveryRequested: true,
    deliveryConfirmed: true,
    otpGenerated: true,
    providerStatus: result?.status || "sent"
  });

  return { ok: true, message: "Code sent on WhatsApp.", phone: localPhone };
}

export async function confirmWhatsappVerification(rawPhone, code, { email, requestId, memberId } = {}) {
  await ensureWhatsappVerificationTable();

  const logContext = buildLogContext({
    requestId,
    memberId: memberId || email,
    phone: rawPhone,
    normalizedPhone: isValidNigerianPhone(rawPhone) ? toSendchampPhone(rawPhone) : null
  });

  if (!isValidNigerianPhone(rawPhone)) {
    throw new WhatsappVerificationError(
      400,
      "Invalid phone number.",
      VERIFICATION_ERROR_CODES.INVALID_PHONE
    );
  }

  const localPhone = normalizeNigerianPhoneLocal(rawPhone);
  const stored = await readStored(localPhone);

  if (!stored?.verification_reference) {
    throw new WhatsappVerificationError(
      400,
      "Request a new code and try again.",
      VERIFICATION_ERROR_CODES.NO_ACTIVE_SESSION
    );
  }

  if (Date.now() > Number(stored.expires || 0)) {
    await clearStored(localPhone);
    throw new WhatsappVerificationError(
      400,
      "That code has expired. Request a new one.",
      VERIFICATION_ERROR_CODES.CODE_EXPIRED
    );
  }

  if (Number(stored.attempts) >= MAX_ATTEMPTS) {
    throw new WhatsappVerificationError(
      429,
      "Too many attempts. Request a new code.",
      VERIFICATION_ERROR_CODES.TOO_MANY_ATTEMPTS
    );
  }

  const started = Date.now();

  try {
    await confirmWhatsAppVerificationOtp({
      reference: stored.verification_reference,
      code,
      logContext
    });
  } catch (error) {
    await bumpAttempts(localPhone);
    logWhatsappVerification(
      "confirm_failed",
      {
        ...logContext,
        durationMs: Date.now() - started,
        failureReason: error instanceof SendchampError ? error.code : "unexpected_error"
      },
      "warn"
    );
    throw mapSendchampConfirmError(error);
  }

  await clearStored(localPhone);
  await markPhoneVerified(localPhone, { email: email || stored.user_email });

  logWhatsappVerification("confirm_success", {
    ...logContext,
    durationMs: Date.now() - started
  });

  return {
    ok: true,
    phone: localPhone,
    phoneVerified: true,
    verifiedPhone: localPhone,
    message: "Phone verified successfully."
  };
}

export async function markPhoneVerified(localPhone, { email } = {}) {
  await assertSchemaTable("app_users");

  await query(
    `update app_users
     set phone = coalesce(phone, $1),
         verified_phone = $1,
         phone_verified = true,
         phone_verified_at = now(),
         updated_at = now()
     where phone = $1 or ($2::text is not null and lower(email) = lower($2::text))`,
    [localPhone, email || null]
  );
}

export async function handleWhatsappVerificationWebhook(body = {}) {
  await ensureWhatsappVerificationTable();

  const reference = String(body.reference || body.verification_reference || body.sms_uid || "").trim();
  const status = String(body.status || "").trim().toLowerCase();
  const allowed = new Set(["sent", "delivered", "failed"]);

  if (!reference) {
    return { ok: false, invalid: true };
  }

  if (!allowed.has(status)) {
    return { ok: true, ignored: true };
  }

  const phoneFromWebhook = body.phone_number
    ? normalizeNigerianPhoneLocal(String(body.phone_number))
    : null;

  if (phoneFromWebhook) {
    await query(
      `update whatsapp_verification_codes
       set delivery_status = $1
       where verification_reference = $2 and phone = $3`,
      [status, reference, phoneFromWebhook]
    );
  } else {
    await query(
      `update whatsapp_verification_codes
       set delivery_status = $1
       where verification_reference = $2`,
      [status, reference]
    );
  }

  return { ok: true };
}

export async function getPhoneVerifiedStatus({ email, phone }) {
  await assertSchemaTable("app_users");
  const localPhone = phone ? normalizeNigerianPhoneLocal(phone) : "";
  const { rows } = await query(
    `select phone_verified, phone, verified_phone from app_users
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     limit 1`,
    [email || null, localPhone || null]
  );
  return Boolean(rows[0]?.phone_verified);
}
