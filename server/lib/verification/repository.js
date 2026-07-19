import { query, isDatabaseReady } from "../../db.js";

let ensured = false;

export async function ensureNationalVerificationTables() {
  if (!isDatabaseReady() || ensured) return;
  await query(`
    create table if not exists verification_sessions (
      id uuid primary key default gen_random_uuid(),
      user_key text not null,
      auth_user_id text,
      email text,
      phone text,
      status text not null default 'started',
      provider text,
      model_version text,
      device_fingerprint text,
      challenge_id text,
      selfie_bucket text,
      selfie_path text,
      trust_score numeric(5,2),
      match_confidence numeric(5,2),
      decision text,
      reason_codes jsonb not null default '[]'::jsonb,
      metadata_enc text,
      embedding_fingerprint text,
      messaging_unlocked boolean not null default false,
      expires_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await query(`
    create table if not exists verification_events (
      id uuid primary key default gen_random_uuid(),
      session_id uuid not null references verification_sessions(id) on delete cascade,
      event_type text not null,
      actor text,
      payload jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    )
  `);
  await query(`
    create table if not exists verification_results (
      id uuid primary key default gen_random_uuid(),
      session_id uuid not null references verification_sessions(id) on delete cascade,
      provider text not null,
      model_version text,
      liveness_passed boolean,
      liveness_score numeric(5,2),
      match_confidence numeric(5,2),
      trust_score numeric(5,2),
      decision text not null,
      reason_codes jsonb not null default '[]'::jsonb,
      risk_breakdown jsonb not null default '{}'::jsonb,
      metadata_enc text,
      created_at timestamptz not null default now(),
      unique (session_id)
    )
  `);
  await query(`
    create table if not exists verification_audit_logs (
      id uuid primary key default gen_random_uuid(),
      session_id uuid,
      user_key text,
      action text not null,
      actor text,
      details jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    )
  `);
  ensured = true;
}

export async function insertVerificationSession(row) {
  await ensureNationalVerificationTables();
  const result = await query(
    `insert into verification_sessions (
       user_key, auth_user_id, email, phone, status, provider, model_version,
       device_fingerprint, challenge_id, expires_at
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning *`,
    [
      row.userKey,
      row.authUserId || null,
      row.email || null,
      row.phone || null,
      row.status || "started",
      row.provider || null,
      row.modelVersion || null,
      row.deviceFingerprint || null,
      row.challengeId || null,
      row.expiresAt || null
    ]
  );
  return result.rows[0] || null;
}

export async function getVerificationSession(sessionId, userKey) {
  await ensureNationalVerificationTables();
  const result = await query(
    `select * from verification_sessions
     where id = $1 and ($2::text is null or user_key = $2)
     limit 1`,
    [sessionId, userKey || null]
  );
  return result.rows[0] || null;
}

export async function getLatestVerificationSession(userKey) {
  await ensureNationalVerificationTables();
  const result = await query(
    `select * from verification_sessions
     where user_key = $1
     order by created_at desc
     limit 1`,
    [userKey]
  );
  return result.rows[0] || null;
}

export async function updateVerificationSession(sessionId, patch) {
  await ensureNationalVerificationTables();
  const result = await query(
    `update verification_sessions set
       status = coalesce($2, status),
       provider = coalesce($3, provider),
       model_version = coalesce($4, model_version),
       selfie_bucket = coalesce($5, selfie_bucket),
       selfie_path = coalesce($6, selfie_path),
       trust_score = coalesce($7, trust_score),
       match_confidence = coalesce($8, match_confidence),
       decision = coalesce($9, decision),
       reason_codes = coalesce($10, reason_codes),
       metadata_enc = coalesce($11, metadata_enc),
       embedding_fingerprint = coalesce($12, embedding_fingerprint),
       messaging_unlocked = coalesce($13, messaging_unlocked),
       updated_at = now()
     where id = $1
     returning *`,
    [
      sessionId,
      patch.status ?? null,
      patch.provider ?? null,
      patch.modelVersion ?? null,
      patch.selfieBucket ?? null,
      patch.selfiePath ?? null,
      patch.trustScore ?? null,
      patch.matchConfidence ?? null,
      patch.decision ?? null,
      patch.reasonCodes ? JSON.stringify(patch.reasonCodes) : null,
      patch.metadataEnc ?? null,
      patch.embeddingFingerprint ?? null,
      typeof patch.messagingUnlocked === "boolean" ? patch.messagingUnlocked : null
    ]
  );
  return result.rows[0] || null;
}

export async function addVerificationEvent(sessionId, eventType, payload = {}, actor = "system") {
  await ensureNationalVerificationTables();
  await query(
    `insert into verification_events (session_id, event_type, actor, payload)
     values ($1, $2, $3, $4)`,
    [sessionId, eventType, actor, JSON.stringify(payload || {})]
  );
}

export async function upsertVerificationResult(row) {
  await ensureNationalVerificationTables();
  const result = await query(
    `insert into verification_results (
       session_id, provider, model_version, liveness_passed, liveness_score,
       match_confidence, trust_score, decision, reason_codes, risk_breakdown, metadata_enc
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     on conflict (session_id) do update set
       provider = excluded.provider,
       model_version = excluded.model_version,
       liveness_passed = excluded.liveness_passed,
       liveness_score = excluded.liveness_score,
       match_confidence = excluded.match_confidence,
       trust_score = excluded.trust_score,
       decision = excluded.decision,
       reason_codes = excluded.reason_codes,
       risk_breakdown = excluded.risk_breakdown,
       metadata_enc = excluded.metadata_enc
     returning *`,
    [
      row.sessionId,
      row.provider,
      row.modelVersion || null,
      row.livenessPassed ?? null,
      row.livenessScore ?? null,
      row.matchConfidence ?? null,
      row.trustScore ?? null,
      row.decision,
      JSON.stringify(row.reasonCodes || []),
      JSON.stringify(row.riskBreakdown || {}),
      row.metadataEnc || null
    ]
  );
  return result.rows[0] || null;
}

export async function writeVerificationAudit({ sessionId, userKey, action, actor, details }) {
  await ensureNationalVerificationTables();
  await query(
    `insert into verification_audit_logs (session_id, user_key, action, actor, details)
     values ($1, $2, $3, $4, $5)`,
    [sessionId || null, userKey || null, action, actor || "system", JSON.stringify(details || {})]
  );
}

export async function countDuplicateFaceFingerprint(fingerprint, excludeSessionId) {
  if (!fingerprint) return 0;
  await ensureNationalVerificationTables();
  const result = await query(
    `select count(*)::int as count
     from verification_sessions
     where embedding_fingerprint = $1
       and messaging_unlocked = true
       and ($2::uuid is null or id <> $2)`,
    [fingerprint, excludeSessionId || null]
  );
  return Number(result.rows[0]?.count) || 0;
}

export async function listVerificationQueue({ status = "manual_review", limit = 50 } = {}) {
  await ensureNationalVerificationTables();
  const result = await query(
    `select s.*, r.match_confidence as result_match_confidence, r.trust_score as result_trust_score
     from verification_sessions s
     left join verification_results r on r.session_id = s.id
     where ($1::text is null or s.status = $1)
     order by s.updated_at desc
     limit $2`,
    [status || null, Math.min(200, Math.max(1, Number(limit) || 50))]
  );
  return result.rows;
}

export async function countReportsForUserKey(userKey) {
  if (!userKey || !isDatabaseReady()) return 0;
  try {
    const result = await query(
      `select count(*)::int as count from app_reports where user_key = $1`,
      [userKey]
    );
    return Number(result.rows[0]?.count) || 0;
  } catch {
    return 0;
  }
}

export async function countDuplicatePhone(phone, excludeUserKey) {
  if (!phone || !isDatabaseReady()) return 0;
  try {
    const result = await query(
      `select count(*)::int as count from app_users
       where phone = $1 and ($2::text is null or user_key <> $2)`,
      [phone, excludeUserKey || null]
    );
    return Number(result.rows[0]?.count) || 0;
  } catch {
    return 0;
  }
}

export async function accountAgeDaysForUserKey(userKey) {
  if (!userKey || !isDatabaseReady()) return 0;
  try {
    const result = await query(
      `select extract(epoch from (now() - created_at)) / 86400 as days
       from app_users where user_key = $1 limit 1`,
      [userKey]
    );
    return Math.max(0, Math.floor(Number(result.rows[0]?.days) || 0));
  } catch {
    return 0;
  }
}
