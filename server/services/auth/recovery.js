import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { recordAuthSecurityEvent } from "./securityEvents.js";

const TABLE = "member_auth_recovery_tokens";
const DEFAULT_RECOVERY_TTL_MS = 15 * 60 * 1000;

export const RECOVERY_KINDS = Object.freeze([
  "pin_reset",
  "forgot_username",
  "lost_device",
  "email_recovery",
  "admin_recovery"
]);

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(TABLE);
    return true;
  } catch {
    return false;
  }
}

function hashContact(value = "") {
  return crypto.createHash("sha256").update(String(value).trim().toLowerCase()).digest("hex");
}

function hashToken(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export async function createRecoveryToken(input = {}) {
  const kind = String(input.recoveryKind || "").trim();
  if (!RECOVERY_KINDS.includes(kind)) return { ok: false, error: "invalid_kind" };
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const tokenId = String(input.tokenId || crypto.randomUUID());
  const rawToken = String(input.rawToken || crypto.randomBytes(24).toString("hex"));
  const contactHash = hashContact(input.contact || input.email || input.phone || "");
  const expiresAt = new Date(
    Date.now() + (Number(input.ttlMs) > 0 ? Number(input.ttlMs) : DEFAULT_RECOVERY_TTL_MS)
  ).toISOString();

  try {
    await query(
      `insert into member_auth_recovery_tokens (
         token_id, recovery_kind, auth_user_id, profile_id,
         contact_hash, token_hash, expires_at, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)`,
      [
        tokenId,
        kind,
        input.authUserId || null,
        input.profileId || null,
        contactHash,
        hashToken(rawToken),
        expiresAt,
        JSON.stringify(input.metadata && typeof input.metadata === "object" ? input.metadata : {})
      ]
    );

    await recordAuthSecurityEvent({
      eventType: "recovery_requested",
      authUserId: input.authUserId || null,
      profileId: input.profileId || null,
      reasonCode: kind,
      summary: `Recovery requested (${kind})`,
      metadata: { tokenId }
    });

    return { ok: true, tokenId, rawToken, expiresAt };
  } catch (error) {
    console.warn("[auth:recovery] create failed", error?.message || error);
    return { ok: false, error: error?.message || "create_failed" };
  }
}

export async function completeRecoveryToken(input = {}) {
  const kind = String(input.recoveryKind || "").trim();
  const rawToken = String(input.rawToken || input.token || "").trim();
  if (!rawToken) return { ok: false, error: "missing_token" };
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const contactHash = hashContact(input.contact || input.email || input.phone || "");
  const tokenHash = hashToken(rawToken);

  const { rows } = await query(
    `select token_id, auth_user_id, profile_id, status, expires_at
     from member_auth_recovery_tokens
     where contact_hash = $1
       and ($2::text is null or recovery_kind = $2)
       and token_hash = $3
     order by created_at desc
     limit 1`,
    [contactHash, kind || null, tokenHash]
  );

  const row = rows[0];
  if (!row) return { ok: false, error: "invalid_token" };
  if (row.status !== "pending") return { ok: false, error: "token_not_pending" };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await query(
      `update member_auth_recovery_tokens set status = 'expired' where token_id = $1`,
      [row.token_id]
    );
    return { ok: false, error: "token_expired" };
  }

  await query(
    `update member_auth_recovery_tokens
     set status = 'completed', completed_at = now()
     where token_id = $1`,
    [row.token_id]
  );

  await recordAuthSecurityEvent({
    eventType: "recovery_completed",
    authUserId: row.auth_user_id,
    profileId: row.profile_id,
    reasonCode: kind || "recovery",
    summary: "Recovery completed",
    metadata: { tokenId: row.token_id }
  });

  return { ok: true, tokenId: row.token_id, profileId: row.profile_id };
}

export async function expireStaleRecoveryTokens() {
  if (!(await ensureTable())) return { expired: 0 };
  const result = await query(
    `update member_auth_recovery_tokens
     set status = 'expired'
     where status = 'pending' and expires_at <= now()
     returning token_id`
  );
  return { expired: result.rows.length };
}
