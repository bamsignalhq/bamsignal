/**
 * Production E2E Certification™ — diagnostics read/peek/cleanup only.
 * Does not implement product flows; delegates mutations to existing engines when required.
 */
import crypto from "node:crypto";
import { createBoundedMemoryStore, isOtpMemoryEntryExpired } from "./boundedMemoryStore.js";
import { normalizeSignupEmail } from "./signupIdentity.js";
import { hashSignupCode } from "./signupProvisioning.js";
import { query, isDatabaseReady } from "../db.js";

const OTP_TTL_MS = 10 * 60 * 1000;

const otpPeekStore = createBoundedMemoryStore("certification_otp_peek", {
  isExpired: isOtpMemoryEntryExpired
});

export function certificationEmailDomain() {
  return String(process.env.CERTIFICATION_EMAIL_DOMAIN || "cert.bamsignal.com")
    .trim()
    .toLowerCase();
}

export function isCertificationEmail(email = "") {
  const domain = certificationEmailDomain();
  if (!domain) return false;
  return normalizeSignupEmail(email).endsWith(`@${domain}`);
}

export function assertCertificationEmail(email = "") {
  if (!isCertificationEmail(email)) {
    const error = new Error("Email is not a certification test address.");
    error.name = "CertificationE2eError";
    error.status = 403;
    error.code = "cert_email_required";
    throw error;
  }
}

export function storeCertificationOtpPeek(email, code) {
  if (!isCertificationEmail(email)) return;
  const normalized = normalizeSignupEmail(email);
  otpPeekStore.set(normalized, { code: String(code), expires: Date.now() + OTP_TTL_MS });
}

export function peekCertificationOtp(email) {
  assertCertificationEmail(email);
  const normalized = normalizeSignupEmail(email);
  const entry = otpPeekStore.get(normalized);
  if (!entry?.code) {
    const error = new Error("No certification OTP available for this email.");
    error.name = "CertificationE2eError";
    error.status = 404;
    error.code = "otp_not_found";
    throw error;
  }
  if (Date.now() > Number(entry.expires || 0)) {
    otpPeekStore.delete(normalized);
    const error = new Error("Certification OTP expired.");
    error.name = "CertificationE2eError";
    error.status = 410;
    error.code = "otp_expired";
    throw error;
  }
  return { email: normalized, code: entry.code, expiresAt: entry.expires };
}

/** Deterministic OTP for cert-domain emails — measurement only, not a product bypass. */
export async function seedCertificationSignupOtp(email, code = "246810") {
  assertCertificationEmail(email);
  if (!isDatabaseReady()) {
    const error = new Error("Database unavailable.");
    error.name = "CertificationE2eError";
    error.status = 503;
    throw error;
  }

  const normalized = normalizeSignupEmail(email);
  const cleaned = String(code).replace(/\D/g, "");
  if (cleaned.length !== 6) {
    const error = new Error("Certification OTP must be 6 digits.");
    error.name = "CertificationE2eError";
    error.status = 400;
    throw error;
  }

  const now = Date.now();
  await query(
    `insert into email_verification_codes (email, code_hash, attempts, last_sent_at, expires_at)
     values ($1, $2, 0, to_timestamp($3 / 1000.0), to_timestamp($4 / 1000.0))
     on conflict (email) do update set
       code_hash = excluded.code_hash,
       attempts = 0,
       last_sent_at = excluded.last_sent_at,
       expires_at = excluded.expires_at`,
    [normalized, hashSignupCode(cleaned), now, now + OTP_TTL_MS]
  );

  storeCertificationOtpPeek(normalized, cleaned);
  return { ok: true, email: normalized, code: cleaned, expiresAt: now + OTP_TTL_MS };
}

/** Read-only allowlist for post-flow persistence checks. */
const QUERY_ALLOWLIST = {
  "member-by-email": {
    sql: `select m.id, m.user_key, m.username, m.onboarding_complete, m.discoverable, m.profile
          from app_member_profiles m
          join app_users u on u.user_key = m.user_key
          where lower(u.email) = lower($1)
          limit 1`,
    params: 1
  },
  "saved-profiles": {
    sql: `select count(*)::int as count from saved_profiles where member_id = $1::uuid`,
    params: 1
  },
  "signals-for-user": {
    sql: `select id, status, user_key, target_profile_id, signal_type, created_at
          from app_signals where user_key = $1 order by created_at desc limit 20`,
    params: 1
  },
  "messages-for-thread": {
    sql: `select id, thread_id, user_key, body, from_side, created_at, payload
          from app_messages where thread_id = $1 order by created_at asc limit 50`,
    params: 1
  },
  "premium-status": {
    sql: `select is_premium, premium_until from app_users where user_key = $1 limit 1`,
    params: 1
  },
  "verification-submission": {
    sql: `select id, status, submitted_at, reviewed_at
          from verification_submissions where user_key = $1
          order by submitted_at desc limit 1`,
    params: 1
  },
  "concierge-persistence-status": {
    sql: `select
            (select count(*)::int from concierge_members) as member_count,
            (select count(*)::int from concierge_consultants) as consultant_count`,
    params: 0
  },
  "concierge-member": {
    sql: `select id, journey_id, status, current_consultant_id, timeline
          from concierge_members where id = $1 limit 1`,
    params: 1
  },
  "report-queue": {
    sql: `select id, profile_id, reason, created_at
          from app_reports where reporter_email = $1 order by created_at desc limit 5`,
    params: 1
  },
  "audit-logs": {
    sql: `select action, created_at, details from audit_logs
          where user_id = $1::uuid or target_user_id = $1::uuid
          order by created_at desc limit 20`,
    params: 1
  },
  "safety-events": {
    sql: `select action, created_at, details from moderation_audit_log
          where target_profile_id = $1::uuid order by created_at desc limit 10`,
    params: 1
  }
};

export async function runCertificationQuery(name, params = []) {
  const spec = QUERY_ALLOWLIST[String(name || "").trim()];
  if (!spec) {
    const error = new Error("Query not allowed.");
    error.name = "CertificationE2eError";
    error.status = 400;
    throw error;
  }
  if (!isDatabaseReady()) {
    const error = new Error("Database unavailable.");
    error.name = "CertificationE2eError";
    error.status = 503;
    throw error;
  }
  const bound = Array.isArray(params) ? params.slice(0, spec.params) : [];
  while (bound.length < spec.params) bound.push(null);
  const result = await query(spec.sql, bound);
  return { ok: true, rows: result.rows, count: result.rows.length };
}

/** Existing whatsappVerification.markPhoneVerified — cert-domain emails only. */
export async function setCertificationPhoneVerified({ email, phone }) {
  assertCertificationEmail(email);
  const { markPhoneVerified } = await import("./whatsappVerification.js");
  const localPhone = String(phone || "").replace(/\D/g, "").replace(/^234/, "0") || "08012345678";
  await markPhoneVerified(localPhone, { email });
  return { ok: true, phone: localPhone };
}

/** Existing verificationQueue.reviewVerificationSubmission — cert-domain emails only. */
export async function approveCertificationVerification({ email, phone }) {
  assertCertificationEmail(email);
  const { reviewVerificationSubmission } = await import("./verificationQueue.js");
  const { normalizeUserKey } = await import("../db.js");
  const userKey = normalizeUserKey({ email, phone });
  const pending = await query(
    `select id from verification_submissions where user_key = $1 order by submitted_at desc limit 1`,
    [userKey]
  );
  const submissionId = pending.rows[0]?.id;
  if (!submissionId) {
    const error = new Error("No verification submission found.");
    error.name = "CertificationE2eError";
    error.status = 404;
    throw error;
  }
  const row = await reviewVerificationSubmission(submissionId, { status: "approved" });
  return { ok: Boolean(row), submission: row };
}

export async function cleanupCertificationMember(email) {
  assertCertificationEmail(email);
  const { purgeMemberCompletely } = await import("./adminMemberPurge.js");
  const result = await purgeMemberCompletely({ email });
  otpPeekStore.delete(normalizeSignupEmail(email));
  return result;
}
