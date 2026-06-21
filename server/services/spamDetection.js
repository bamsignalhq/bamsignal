import { createHash } from "node:crypto";
import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { createModerationFlag } from "../memberTrust.js";
import { assertSchemaTable } from "./schemaVerification.js";

const SPAM_PATTERNS = [
  /hi dear/i,
  /hello beautiful/i,
  /send whatsapp/i,
  /chat me on whatsapp/i,
  /add me on/i
];

const DUPLICATE_THRESHOLD = 5;
const DUPLICATE_WINDOW_HOURS = 24;

function hashMessage(text = "") {
  return createHash("sha256").update(String(text).trim().toLowerCase()).digest("hex").slice(0, 32);
}

export async function ensureSpamDetectionSchema() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("spam_message_fingerprints");
}

function patternSeverity(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return null;
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(normalized)) return "medium";
  }
  return null;
}

export async function analyzeOutgoingMessage({ email, phone, text, recipientProfileId, profileId }) {
  if (!isDatabaseReady() || !text?.trim()) return { ok: true };
  await ensureSpamDetectionSchema();

  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return { ok: true };

  const messageHash = hashMessage(text);
  const patternHit = patternSeverity(text);

  await query(
    `insert into spam_message_fingerprints (user_key, message_hash, recipient_profile_id)
     values ($1, $2, $3)`,
    [userKey, messageHash, recipientProfileId || null]
  );

  const since = new Date(Date.now() - DUPLICATE_WINDOW_HOURS * 3600000).toISOString();
  const dupResult = await query(
    `select count(distinct recipient_profile_id)::int as count
     from spam_message_fingerprints
     where user_key = $1 and message_hash = $2 and created_at >= $3`,
    [userKey, messageHash, since]
  );
  const dupCount = Number(dupResult.rows[0]?.count || 0);

  let severity = null;
  let reason = null;
  if (dupCount >= DUPLICATE_THRESHOLD) {
    severity = dupCount >= DUPLICATE_THRESHOLD + 3 ? "high" : "medium";
    reason = "spamSuspected";
  } else if (patternHit) {
    severity = patternHit;
    reason = "spamSuspected";
  }

  if (reason) {
    await createModerationFlag({
      userKey,
      profileId: profileId || null,
      reason,
      severity,
      metadata: { messageHash, count: dupCount, pattern: Boolean(patternHit) }
    });
  }

  return { ok: true, flagged: Boolean(reason), reason, messageHash, count: dupCount };
}

export async function listSpamSuspects({ limit = 50 } = {}) {
  if (!isDatabaseReady()) return [];
  await ensureSpamDetectionSchema();
  const result = await query(
    `select f.user_key, f.message_hash, count(*)::int as count, max(f.created_at) as last_at,
            p.name, p.username, p.id as profile_id
     from spam_message_fingerprints f
     left join app_member_profiles p on p.user_key = f.user_key
     where f.created_at >= now() - interval '7 days'
     group by f.user_key, f.message_hash, p.name, p.username, p.id
     having count(*) >= $1
     order by count desc, last_at desc
     limit $2`,
    [DUPLICATE_THRESHOLD, Math.min(100, Math.max(1, limit))]
  );
  return result.rows.map((row) => ({
    userKey: row.user_key,
    profileId: row.profile_id,
    name: row.name || row.username || row.user_key,
    messageHash: row.message_hash,
    count: row.count,
    lastAt: row.last_at,
    severity: row.count >= DUPLICATE_THRESHOLD + 3 ? "high" : row.count >= DUPLICATE_THRESHOLD ? "medium" : "low"
  }));
}
