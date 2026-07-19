import { query } from "../db.js";
import { config } from "../config.js";
import { assertSchemaTable } from "./schemaVerification.js";
import {
  confirmSmsVerificationOtp,
  isSendchampConfigured,
  sendSmsVerificationOtp,
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
  SmsVerificationError
} from "./smsVerificationErrors.js";
import { resolveIdentityFromUserId } from "./onboardingRepair.js";

export { SmsVerificationError, VERIFICATION_ERROR_CODES };

function otpPolicy() {
  const v = config.verification || {};
  return {
    resendMs: Math.max(15, Number(v.otpResendSeconds) || 60) * 1000,
    maxAttempts: Math.max(1, Number(v.otpMaxAttempts) || 5),
    expiryMs: Math.max(1, Number(v.otpExpiryMinutes) || 30) * 60 * 1000
  };
}

async function ensureVerificationCodesTable() {
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
    provider: config.verification?.smsProvider || "sendchamp",
    channel: "sms"
  };
}

export async function startSmsVerification(rawPhone, { email, requestId, memberId, authUserId } = {}) {
  await ensureVerificationCodesTable();

  const logContext = buildLogContext({
    requestId,
    memberId: memberId || email,
    phone: rawPhone,
    normalizedPhone: null
  });

  if (!isSendchampConfigured()) {
    throw new SmsVerificationError(
      503,
      "Verification temporarily unavailable.",
      VERIFICATION_ERROR_CODES.NOT_CONFIGURED
    );
  }

  if (!isValidNigerianPhone(rawPhone)) {
    logWhatsappVerification(
      "start_rejected",
      { ...logContext, failureReason: "invalid_phone" },
      "warn"
    );
    throw new SmsVerificationError(
      400,
      "Invalid phone number.",
      VERIFICATION_ERROR_CODES.INVALID_PHONE
    );
  }

  const localPhone = normalizeNigerianPhoneLocal(rawPhone);
  const sendchampPhone = toSendchampPhone(rawPhone);
  logContext.normalizedPhone = sendchampPhone;

  const policy = otpPolicy();
  const existing = await readStored(localPhone);
  const now = Date.now();

  if (existing?.last_sent && now - Number(existing.last_sent) < policy.resendMs) {
    logWhatsappVerification(
      "start_rejected",
      { ...logContext, failureReason: "rate_limited" },
      "warn"
    );
    throw new SmsVerificationError(
      429,
      "Please wait a minute before requesting another code.",
      VERIFICATION_ERROR_CODES.RATE_LIMITED
    );
  }

  const started = Date.now();
  let result;

  try {
    result = await sendSmsVerificationOtp({ phone: sendchampPhone, logContext });
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
    throw new SmsVerificationError(
      502,
      "Unable to send SMS right now.",
      VERIFICATION_ERROR_CODES.DELIVERY_FAILED
    );
  }

  const expiresAt = new Date(now + policy.expiryMs);
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
    authUserId: authUserId || null,
    providerStatus: result?.status || "sent"
  });

  return { ok: true, message: "Code sent by SMS.", phone: localPhone };
}

export async function confirmSmsVerification(
  rawPhone,
  code,
  { email, requestId, memberId, authUserId } = {}
) {
  await ensureVerificationCodesTable();

  const policy = otpPolicy();
  const logContext = buildLogContext({
    requestId,
    memberId: memberId || email,
    phone: rawPhone,
    normalizedPhone: isValidNigerianPhone(rawPhone) ? toSendchampPhone(rawPhone) : null
  });

  if (!isValidNigerianPhone(rawPhone)) {
    throw new SmsVerificationError(
      400,
      "Invalid phone number.",
      VERIFICATION_ERROR_CODES.INVALID_PHONE
    );
  }

  const localPhone = normalizeNigerianPhoneLocal(rawPhone);
  const stored = await readStored(localPhone);

  if (!stored?.verification_reference) {
    throw new SmsVerificationError(
      400,
      "Request a new code and try again.",
      VERIFICATION_ERROR_CODES.NO_ACTIVE_SESSION
    );
  }

  if (Date.now() > Number(stored.expires || 0)) {
    await clearStored(localPhone);
    throw new SmsVerificationError(
      400,
      "That code has expired. Request a new one.",
      VERIFICATION_ERROR_CODES.CODE_EXPIRED
    );
  }

  if (Number(stored.attempts) >= policy.maxAttempts) {
    throw new SmsVerificationError(
      429,
      "Too many attempts. Request a new code.",
      VERIFICATION_ERROR_CODES.TOO_MANY_ATTEMPTS
    );
  }

  const started = Date.now();

  try {
    await confirmSmsVerificationOtp({
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
  await markPhoneVerified(localPhone, {
    email: email || stored.user_email,
    authUserId
  });

  logWhatsappVerification("confirm_success", {
    ...logContext,
    durationMs: Date.now() - started,
    authUserId: authUserId || null
  });

  return {
    ok: true,
    phone: localPhone,
    phoneVerified: true,
    verifiedPhone: localPhone,
    message: "Phone verified successfully."
  };
}

export async function markPhoneVerified(localPhone, { email, authUserId } = {}) {
  await assertSchemaTable("app_users");

  let resolvedEmail = email ? String(email).trim().toLowerCase() : null;
  if (authUserId) {
    const identity = await resolveIdentityFromUserId(authUserId, {
      email: resolvedEmail || undefined
    });
    const fromAuth =
      identity?.resolvedEmail || identity?.appUser?.email || identity?.member?.email || null;
    if (fromAuth) resolvedEmail = String(fromAuth).trim().toLowerCase();
  }

  await query(
    `update app_users
     set phone = coalesce(phone, $1),
         verified_phone = $1,
         phone_verified = true,
         phone_verified_at = now(),
         updated_at = now()
     where phone = $1
        or ($2::text is not null and lower(email) = lower($2::text))`,
    [localPhone, resolvedEmail || null]
  );
}

export async function handleSmsVerificationWebhook(body = {}) {
  await ensureVerificationCodesTable();

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

export async function getPhoneVerifiedStatus({ email, phone, authUserId }) {
  await assertSchemaTable("app_users");
  let resolvedEmail = email ? String(email).trim().toLowerCase() : null;
  if (authUserId && !resolvedEmail) {
    const identity = await resolveIdentityFromUserId(authUserId, {});
    const fromAuth = identity?.resolvedEmail || identity?.appUser?.email || null;
    if (fromAuth) resolvedEmail = String(fromAuth).trim().toLowerCase();
  }
  const localPhone = phone ? normalizeNigerianPhoneLocal(phone) : "";
  const { rows } = await query(
    `select phone_verified, phone, verified_phone from app_users
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     limit 1`,
    [resolvedEmail || null, localPhone || null]
  );
  return Boolean(rows[0]?.phone_verified);
}

/** @deprecated Use startSmsVerification */
export const startWhatsappVerification = startSmsVerification;
/** @deprecated Use confirmSmsVerification */
export const confirmWhatsappVerification = confirmSmsVerification;
/** @deprecated Use handleSmsVerificationWebhook */
export const handleWhatsappVerificationWebhook = handleSmsVerificationWebhook;
