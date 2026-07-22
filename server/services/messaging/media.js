import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { resolveMessageIdempotencyKey } from "./idempotency.js";

const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/jpg", "image/webp", "image/png"]);

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_message_media_uploads");
    return true;
  } catch {
    return false;
  }
}

export async function registerMediaUpload(input = {}) {
  if (!(await ensureTable()) || !input.memberId) return { ok: false, skipped: true };

  const uploadId = String(input.uploadId || crypto.randomUUID());
  const idempotencyKey = resolveMessageIdempotencyKey({
    idempotencyKey: input.idempotencyKey,
    messageId: uploadId,
    conversationId: input.conversationId || "media"
  });

  const contentType = String(input.contentType || "").toLowerCase();
  if (contentType && !ALLOWED_CONTENT_TYPES.has(contentType)) {
    return { ok: false, error: "invalid_content_type" };
  }

  try {
    const result = await query(
      `insert into member_message_media_uploads (
         upload_id, message_id, member_id, storage_path, content_type,
         status, idempotency_key, metadata
       ) values ($1,$2,$3,$4,$5,'pending',$6,$7::jsonb)
       on conflict (idempotency_key) do nothing
       returning upload_id`,
      [
        uploadId,
        input.messageId || null,
        input.memberId,
        input.storagePath || null,
        contentType || null,
        idempotencyKey,
        JSON.stringify(input.metadata || {})
      ]
    );

    if (!result.rows[0]) {
      return { ok: true, duplicate: true, uploadId, idempotencyKey };
    }

    return { ok: true, uploadId, idempotencyKey, status: "pending" };
  } catch (error) {
    console.warn("[messaging:media] register failed", error?.message || error);
    return { ok: false, error: error?.message || "register_failed" };
  }
}

export async function markMediaUploadVerified(uploadId, input = {}) {
  if (!(await ensureTable()) || !uploadId) return { ok: false };

  const result = await query(
    `update member_message_media_uploads
     set status = 'verified', storage_path = coalesce($2, storage_path),
         verified_at = now(), metadata = metadata || $3::jsonb
     where upload_id = $1 and status in ('pending', 'uploading')
     returning *`,
    [uploadId, input.storagePath || null, JSON.stringify(input.metadata || {})]
  );

  return { ok: Boolean(result.rows[0]), upload: result.rows[0] || null };
}

export async function markMediaUploadFailed(uploadId, reason = "upload_failed") {
  if (!(await ensureTable()) || !uploadId) return { ok: false };

  const existing = await query(
    `select upload_id, retry_count from member_message_media_uploads where upload_id = $1`,
    [uploadId]
  );
  const row = existing.rows[0];
  if (!row) return { ok: false };

  const retryCount = Number(row.retry_count) + 1;
  const status = retryCount >= 3 ? "failed" : "pending";

  await query(
    `update member_message_media_uploads
     set status = $2, retry_count = $3,
         metadata = metadata || $4::jsonb
     where upload_id = $1`,
    [uploadId, status, retryCount, JSON.stringify({ lastFailure: reason })]
  );

  return { ok: true, retryCount, status };
}

export async function listPendingMediaUploads(memberId, options = {}) {
  if (!(await ensureTable()) || !memberId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
  const { rows } = await query(
    `select upload_id, message_id, storage_path, content_type, status, retry_count, created_at
     from member_message_media_uploads
     where member_id = $1 and status in ('pending', 'uploading')
     order by created_at asc
     limit $2`,
    [memberId, limit]
  );
  return rows;
}
