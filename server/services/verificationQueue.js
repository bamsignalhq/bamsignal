import { query, normalizeUserKey, isDatabaseReady } from "../db.js";
import { normalizeNigerianPhoneLocal } from "../utils/nigerianPhone.js";
import { assertSchemaTable } from "./schemaVerification.js";

export async function ensureVerificationSubmissionsTable() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("verification_submissions");
}

export async function submitVerificationSelfie({
  email,
  phone,
  name,
  profilePhoto,
  verificationSelfie,
  phoneVerified = false
}) {
  await ensureVerificationSubmissionsTable();
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey || !verificationSelfie) return null;

  const localPhone = phone ? normalizeNigerianPhoneLocal(phone) : null;

  const pending = await query(
    `select id from verification_submissions
     where user_key = $1 and status = 'pending'
     limit 1`,
    [userKey]
  );
  if (pending.rows[0]?.id) {
    const updated = await query(
      `update verification_submissions
       set profile_photo = coalesce($2, profile_photo),
           verification_selfie = $3,
           phone_verified = $4,
           user_name = coalesce($5, user_name),
           submitted_at = now()
       where id = $1
       returning *`,
      [
        pending.rows[0].id,
        profilePhoto || null,
        verificationSelfie,
        Boolean(phoneVerified),
        name || null
      ]
    );
    return updated.rows[0] || null;
  }

  const result = await query(
    `insert into verification_submissions (
       user_key, email, phone, user_name, profile_photo, verification_selfie, phone_verified, status
     ) values ($1, $2, $3, $4, $5, $6, $7, 'pending')
     returning *`,
    [
      userKey,
      email || null,
      localPhone,
      name || null,
      profilePhoto || null,
      verificationSelfie,
      Boolean(phoneVerified)
    ]
  );
  return result.rows[0] || null;
}

export async function listVerificationSubmissions({ status } = {}) {
  await ensureVerificationSubmissionsTable();
  const filter = status ? "where status = $1" : "";
  const params = status ? [status] : [];
  const result = await query(
    `select * from verification_submissions ${filter} order by submitted_at desc limit 200`,
    params
  );
  return result.rows;
}

export async function reviewVerificationSubmission(id, { status, rejectReason } = {}) {
  await ensureVerificationSubmissionsTable();
  if (!["approved", "rejected"].includes(status)) return null;

  const result = await query(
    `update verification_submissions
     set status = $2,
         reject_reason = $3,
         reviewed_at = now()
     where id = $1 and status = 'pending'
     returning *`,
    [id, status, rejectReason || null]
  );
  const row = result.rows[0];
  if (!row || status !== "approved") return row;

  await query(
    `update app_member_profiles
     set profile = jsonb_set(coalesce(profile, '{}'::jsonb), '{verified}', 'true'::jsonb, true),
         updated_at = now()
     where user_key = $1`,
    [row.user_key]
  );

  return row;
}

export async function verificationQueueStats() {
  await ensureVerificationSubmissionsTable();
  const result = await query(`
    select
      count(*) filter (where status = 'pending') as pending,
      count(*) filter (where status = 'approved') as approved,
      count(*) filter (where status = 'rejected') as rejected
    from verification_submissions
  `);
  return result.rows[0] || { pending: 0, approved: 0, rejected: 0 };
}
