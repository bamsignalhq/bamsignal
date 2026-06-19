import { createHash } from "node:crypto";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import {
  CONTACT_LEAK_BLOCK_MESSAGE,
  scanProfilePayloadForContactLeak,
  scanTextForContactLeak,
  scanTextForProfanity,
  VULGAR_CONTENT_BLOCK_MESSAGE
} from "../../shared/contactGuardCore.mjs";
import { createModerationFlag } from "../memberTrust.js";

export { CONTACT_LEAK_BLOCK_MESSAGE, VULGAR_CONTENT_BLOCK_MESSAGE };

export function hashContactLeakText(text = "") {
  return createHash("sha256").update(String(text).trim().toLowerCase()).digest("hex").slice(0, 16);
}

export async function ensureContactLeakSchema() {
  if (!isDatabaseReady()) return;
  await query(`
    create table if not exists contact_leak_attempts (
      id uuid primary key default gen_random_uuid(),
      user_key text not null,
      profile_id uuid,
      field text not null,
      text_hash text not null,
      created_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists contact_leak_attempts_created_idx on contact_leak_attempts (created_at desc)"
  );
}

export async function logContactLeakAttempt({
  email,
  phone,
  field,
  text,
  profileId = null
}) {
  if (!isDatabaseReady() || !field) return null;
  await ensureContactLeakSchema();

  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return null;

  let resolvedProfileId = profileId;
  if (!resolvedProfileId) {
    const member = await findMemberProfileByUserKey(email, phone);
    resolvedProfileId = member?.id || null;
  }

  const textHash = hashContactLeakText(text);
  const result = await query(
    `insert into contact_leak_attempts (user_key, profile_id, field, text_hash)
     values ($1, $2, $3, $4)
     returning *`,
    [userKey, resolvedProfileId, String(field), textHash]
  );

  await createModerationFlag({
    userKey,
    profileId: resolvedProfileId,
    reason: "contact_leak",
    severity: "medium",
    metadata: { field, text_hash: textHash }
  });

  return result.rows[0] || null;
}

export async function listContactLeakAttempts({ limit = 50 } = {}) {
  if (!isDatabaseReady()) return [];
  await ensureContactLeakSchema();

  const result = await query(
    `select c.id, c.user_key, c.profile_id, c.field, c.text_hash, c.created_at,
            p.name, p.username, p.email
     from contact_leak_attempts c
     left join app_member_profiles p on p.id = c.profile_id
     order by c.created_at desc
     limit $1`,
    [Math.min(200, Math.max(1, limit))]
  );
  return result.rows;
}

export async function assertTextSafeForContactLeak({
  email,
  phone,
  text,
  field,
  allowContactExchange = false
}) {
  const value = String(text || "").trim();
  if (!value) return { ok: true };

  const scan = scanTextForContactLeak(value, { allowContactExchange });
  if (scan.blocked) {
    await logContactLeakAttempt({ email, phone, field, text: value });
    return { ok: false, error: CONTACT_LEAK_BLOCK_MESSAGE };
  }

  if (scanTextForProfanity(value).blocked) {
    await logContactLeakAttempt({ email, phone, field, text: value });
    return { ok: false, error: VULGAR_CONTENT_BLOCK_MESSAGE };
  }

  return { ok: true };
}

export async function assertProfileSafeForContactLeak({ email, phone, name, username, profile = {} }) {
  const scan = scanProfilePayloadForContactLeak({
    name,
    username,
    bio: profile.bio,
    profilePrompts: profile.profilePrompts,
    voiceIntroTranscript: profile.voiceIntroTranscript,
    occupations: profile.occupations,
    occupation: profile.occupation,
    interests: profile.interests
  });

  if (!scan.blocked) return { ok: true };

  const field = scan.field || "profile";
  const sample =
    field === "display_name"
      ? name
      : field === "username"
        ? username
        : field === "bio"
          ? profile.bio
          : "";

  await logContactLeakAttempt({ email, phone, field, text: String(sample || profile.bio || "") });
  const error =
    scan.reason === "profanity" ? VULGAR_CONTENT_BLOCK_MESSAGE : CONTACT_LEAK_BLOCK_MESSAGE;
  return { ok: false, error, field };
}
