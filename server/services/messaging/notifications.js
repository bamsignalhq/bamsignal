import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { resolveNotificationIdempotencyKey } from "./idempotency.js";
import {
  publishNotificationEvent,
  NOTIFICATION_EVENT_TYPES
} from "./notificationEventBus.js";
import { incrementMessagingMetric } from "./observability.js";

export {
  NOTIFICATION_EVENT_TYPES,
  publishNotificationEvent,
  subscribeNotificationEvents,
  listNotificationEvents,
  createNotificationEventId
} from "./notificationEventBus.js";

export const NOTIFICATION_CATEGORIES = Object.freeze([
  "message",
  "match",
  "subscription",
  "payment",
  "safety",
  "moderation",
  "system",
  "referral"
]);

export const NOTIFICATION_CHANNELS = Object.freeze(["in_app", "push", "email", "sms"]);

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_notification_outbox");
    await assertSchemaTable("member_notification_preferences");
    return true;
  } catch {
    return false;
  }
}

async function isCategoryEnabled(memberId, category, channel = "in_app") {
  if (!(await ensureTables()) || !memberId) return true;

  const { rows } = await query(
    `select enabled from member_notification_preferences
     where member_id = $1 and category = $2 and channel = $3`,
    [memberId, category, channel]
  );
  if (!rows[0]) return true;
  return Boolean(rows[0].enabled);
}

export async function isNotificationEnabled(memberId, category, channel = "in_app") {
  return isCategoryEnabled(memberId, category, channel);
}

export async function setNotificationPreference(memberId, category, channel, enabled = true) {
  if (!(await ensureTables()) || !memberId) return { ok: false };
  await query(
    `insert into member_notification_preferences (member_id, category, channel, enabled)
     values ($1,$2,$3,$4)
     on conflict (member_id, category, channel) do update set enabled = excluded.enabled, updated_at = now()`,
    [memberId, category, channel, Boolean(enabled)]
  );
  return { ok: true };
}

export async function createMemberNotification(input = {}) {
  if (!(await ensureTables()) || !input.memberId) return { ok: false, skipped: true };

  const category = NOTIFICATION_CATEGORIES.includes(input.category) ? input.category : "system";
  const channel = NOTIFICATION_CHANNELS.includes(input.channel) ? input.channel : "in_app";

  if (!(await isCategoryEnabled(input.memberId, category, channel))) {
    return { ok: true, skipped: true, reason: "preference_disabled" };
  }

  const notificationId = String(input.notificationId || crypto.randomUUID());
  const idempotencyKey = resolveNotificationIdempotencyKey(
    input.idempotencyKey || notificationId
  );

  try {
    const result = await query(
      `insert into member_notification_outbox (
         notification_id, member_id, category, channel, status,
         idempotency_key, title, body, payload
       ) values ($1,$2,$3,$4,'queued',$5,$6,$7,$8::jsonb)
       on conflict (idempotency_key) do nothing
       returning notification_id`,
      [
        notificationId,
        input.memberId,
        category,
        channel,
        idempotencyKey,
        String(input.title || "").slice(0, 200),
        String(input.body || "").slice(0, 500),
        JSON.stringify(input.payload || {})
      ]
    );

    if (!result.rows[0]) {
      return { ok: true, duplicate: true, notificationId, idempotencyKey };
    }

    incrementMessagingMetric("notificationQueueDepth", 1);

    await publishNotificationEvent({
      eventType: "notification.created",
      notificationCreated: true,
      notificationId,
      memberId: input.memberId,
      category,
      channel,
      idempotencyKey,
      payload: { title: input.title, body: input.body }
    });

    await publishNotificationEvent({
      eventType: "notification.queued",
      notificationQueued: true,
      notificationId,
      memberId: input.memberId,
      category,
      channel,
      idempotencyKey: `${notificationId}:queued`,
      payload: { channel }
    });

    if (channel === "in_app") {
      await markNotificationSent(notificationId);
    }

    return { ok: true, notificationId, idempotencyKey, status: channel === "in_app" ? "sent" : "queued" };
  } catch (error) {
    console.warn("[messaging:notifications] create failed", error?.message || error);
    return { ok: false, error: error?.message || "create_failed" };
  }
}

export async function markNotificationSent(notificationId) {
  if (!(await ensureTables()) || !notificationId) return { ok: false };

  const result = await query(
    `update member_notification_outbox
     set status = 'sent', sent_at = now()
     where notification_id = $1 and status = 'queued'
     returning notification_id, member_id, category, channel`,
    [notificationId]
  );

  const row = result.rows[0];
  if (row) {
    incrementMessagingMetric("notificationsSent");
    await publishNotificationEvent({
      eventType: "notification.sent",
      notificationSent: true,
      notificationId,
      memberId: row.member_id,
      category: row.category,
      channel: row.channel,
      idempotencyKey: `${notificationId}:sent`
    });
  }

  return { ok: Boolean(row) };
}

export async function markNotificationFailed(notificationId, reason = "send_failed") {
  if (!(await ensureTables()) || !notificationId) return { ok: false };

  const result = await query(
    `update member_notification_outbox set status = 'failed',
       payload = payload || $2::jsonb
     where notification_id = $1 and status = 'queued'
     returning notification_id, member_id`,
    [notificationId, JSON.stringify({ failureReason: reason })]
  );

  const row = result.rows[0];
  if (row) {
    incrementMessagingMetric("notificationFailures");
    await publishNotificationEvent({
      eventType: "notification.failed",
      notificationFailed: true,
      notificationId,
      memberId: row.member_id,
      idempotencyKey: `${notificationId}:failed`,
      payload: { reason }
    });
  }

  return { ok: Boolean(row) };
}

export async function markNotificationRead(notificationId, memberId) {
  if (!(await ensureTables()) || !notificationId) return { ok: false };

  const result = await query(
    `update member_notification_outbox
     set payload = payload || $3::jsonb
     where notification_id = $1 and member_id = $2
     returning notification_id, member_id`,
    [notificationId, memberId, JSON.stringify({ readAt: new Date().toISOString() })]
  );

  const row = result.rows[0];
  if (row) {
    await publishNotificationEvent({
      eventType: "notification.read",
      notificationRead: true,
      notificationId,
      memberId: row.member_id,
      idempotencyKey: `${notificationId}:read`
    });
  }

  return { ok: Boolean(row) };
}

export async function dismissNotification(notificationId, memberId) {
  if (!(await ensureTables()) || !notificationId) return { ok: false };

  const result = await query(
    `update member_notification_outbox
     set payload = payload || $3::jsonb
     where notification_id = $1 and member_id = $2
     returning notification_id, member_id`,
    [notificationId, memberId, JSON.stringify({ dismissedAt: new Date().toISOString() })]
  );

  const row = result.rows[0];
  if (row) {
    await publishNotificationEvent({
      eventType: "notification.dismissed",
      notificationDismissed: true,
      notificationId,
      memberId: row.member_id,
      idempotencyKey: `${notificationId}:dismissed`
    });
  }

  return { ok: Boolean(row) };
}

export async function listMemberNotifications(memberId, options = {}) {
  if (!(await ensureTables()) || !memberId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select notification_id, category, channel, status, title, body, payload, created_at, sent_at
     from member_notification_outbox
     where member_id = $1
     order by created_at desc
     limit $2`,
    [memberId, limit]
  );
  return rows;
}

export async function listNotificationPreferences(memberId) {
  if (!(await ensureTables()) || !memberId) return [];
  const { rows } = await query(
    `select category, channel, enabled, updated_at
     from member_notification_preferences where member_id = $1`,
    [memberId]
  );
  return rows;
}

export async function notifyNewMessage(input = {}) {
  const membership = input.conversationId && input.recipientMemberId
    ? await query(
        `select notification_enabled from member_conversation_membership
         where conversation_id = $1 and member_id = $2 limit 1`,
        [input.conversationId, input.recipientMemberId]
      ).then((r) => r.rows[0])
    : null;

  if (membership && membership.notification_enabled === false) {
    return { ok: true, skipped: true, reason: "membership_notification_disabled" };
  }

  return createMemberNotification({
    memberId: input.recipientMemberId,
    category: "message",
    channel: "in_app",
    title: input.title || "New message",
    body: input.bodyPreview || "You have a new message",
    idempotencyKey: `msg-notify:${input.messageId}:${input.recipientMemberId}`,
    payload: {
      conversationId: input.conversationId,
      messageId: input.messageId,
      sequenceNumber: input.sequenceNumber ?? null,
      senderMemberId: input.senderMemberId || null
    }
  });
}
