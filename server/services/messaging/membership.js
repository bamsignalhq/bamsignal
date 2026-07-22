import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

export const MEMBERSHIP_STATUSES = Object.freeze([
  "joined",
  "left",
  "removed",
  "blocked",
  "muted",
  "hidden",
  "archived"
]);

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_conversation_membership");
    await assertSchemaTable("member_conversation_membership_log");
    return true;
  } catch {
    return false;
  }
}

export async function transitionMembershipStatus(input = {}) {
  const newStatus = String(input.newStatus || "").trim();
  if (!MEMBERSHIP_STATUSES.includes(newStatus)) {
    return { ok: false, error: "invalid_status" };
  }
  if (!(await ensureTables()) || !input.conversationId || !input.memberId) {
    return { ok: false, skipped: true };
  }

  const previousStatus = String(input.previousStatus || "unknown");
  const logId = String(input.logId || crypto.randomUUID());

  try {
    await query(
      `insert into member_conversation_membership_log (
         log_id, conversation_id, member_id, previous_status, new_status,
         reason_code, reason, actor, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       on conflict (log_id) do nothing`,
      [
        logId,
        input.conversationId,
        input.memberId,
        previousStatus,
        newStatus,
        String(input.reasonCode || "system"),
        String(input.reason || "").slice(0, 500),
        String(input.actor || "system"),
        JSON.stringify(input.metadata || {})
      ]
    );

    await query(
      `insert into member_conversation_membership (
         conversation_id, member_id, peer_member_id, member_status, metadata
       ) values ($1,$2,$3,$4,$5::jsonb)
       on conflict (conversation_id, member_id) do update set
         member_status = excluded.member_status,
         peer_member_id = coalesce(excluded.peer_member_id, member_conversation_membership.peer_member_id),
         metadata = member_conversation_membership.metadata || excluded.metadata,
         updated_at = now()`,
      [
        input.conversationId,
        input.memberId,
        input.peerMemberId || null,
        newStatus,
        JSON.stringify(input.metadata || {})
      ]
    );

    return { ok: true, logId, previousStatus, newStatus };
  } catch (error) {
    console.warn("[messaging:membership] transition failed", error?.message || error);
    return { ok: false, error: error?.message || "transition_failed" };
  }
}

export async function joinConversation(input = {}) {
  if (!input.conversationId || !input.memberId) return { ok: false, skipped: true };

  const existing = await getMembership(input.conversationId, input.memberId);
  const previousStatus = existing?.member_status || "unknown";

  return transitionMembershipStatus({
    conversationId: input.conversationId,
    memberId: input.memberId,
    peerMemberId: input.peerMemberId || null,
    previousStatus,
    newStatus: "joined",
    reasonCode: input.reasonCode || "member_joined",
    reason: input.reason || "Member joined conversation",
    actor: input.actor || "system",
    metadata: input.metadata || {}
  });
}

export async function getMembership(conversationId, memberId) {
  if (!(await ensureTables()) || !conversationId || !memberId) return null;
  const { rows } = await query(
    `select conversation_id, member_id, peer_member_id, member_status,
            unread_count, last_read_message_id, last_read_seq, last_read_at,
            notification_enabled, pinned, favourited, metadata, updated_at
     from member_conversation_membership
     where conversation_id = $1 and member_id = $2`,
    [conversationId, memberId]
  );
  return rows[0] || null;
}

export async function updateMembershipReadPointer(input = {}) {
  if (!(await ensureTables()) || !input.conversationId || !input.memberId) {
    return { ok: false, skipped: true };
  }

  await query(
    `insert into member_conversation_membership (
       conversation_id, member_id, last_read_message_id, last_read_seq, last_read_at, unread_count
     ) values ($1,$2,$3,$4,$5,0)
     on conflict (conversation_id, member_id) do update set
       last_read_message_id = coalesce(excluded.last_read_message_id, member_conversation_membership.last_read_message_id),
       last_read_seq = coalesce(excluded.last_read_seq, member_conversation_membership.last_read_seq),
       last_read_at = excluded.last_read_at,
       unread_count = 0,
       updated_at = now()`,
    [
      input.conversationId,
      input.memberId,
      input.messageId || null,
      input.sequenceNumber ?? null,
      input.readAt || new Date().toISOString()
    ]
  );

  return { ok: true };
}

export async function incrementMembershipUnread(conversationId, memberId, delta = 1) {
  if (!(await ensureTables()) || !conversationId || !memberId) return { ok: false };

  await query(
    `insert into member_conversation_membership (conversation_id, member_id, unread_count, member_status)
     values ($1,$2,$3,'joined')
     on conflict (conversation_id, member_id) do update set
       unread_count = member_conversation_membership.unread_count + excluded.unread_count,
       updated_at = now()`,
    [conversationId, memberId, Math.max(Number(delta) || 1, 1)]
  );

  return { ok: true };
}

export async function setMembershipNotificationPreference(conversationId, memberId, enabled = true) {
  if (!(await ensureTables()) || !conversationId || !memberId) return { ok: false };

  await query(
    `insert into member_conversation_membership (conversation_id, member_id, notification_enabled, member_status)
     values ($1,$2,$3,'joined')
     on conflict (conversation_id, member_id) do update set
       notification_enabled = excluded.notification_enabled,
       updated_at = now()`,
    [conversationId, memberId, Boolean(enabled)]
  );

  return { ok: true };
}

export async function getTotalMembershipUnread(memberId) {
  if (!(await ensureTables()) || !memberId) return 0;
  const { rows } = await query(
    `select coalesce(sum(unread_count), 0)::int as total
     from member_conversation_membership
     where member_id = $1 and member_status = 'joined'`,
    [memberId]
  );
  return Number(rows[0]?.total) || 0;
}

export async function listMembershipUnread(memberId) {
  if (!(await ensureTables()) || !memberId) return [];
  const { rows } = await query(
    `select conversation_id, unread_count, last_read_at, last_read_seq
     from member_conversation_membership
     where member_id = $1 and unread_count > 0 and member_status = 'joined'
     order by updated_at desc`,
    [memberId]
  );
  return rows;
}

export async function ensureMembershipPair(input = {}) {
  if (!input.conversationId || !input.memberIdA || !input.memberIdB) {
    return { ok: false, skipped: true };
  }
  await joinConversation({
    conversationId: input.conversationId,
    memberId: input.memberIdA,
    peerMemberId: input.memberIdB,
    metadata: input.metadata
  });
  await joinConversation({
    conversationId: input.conversationId,
    memberId: input.memberIdB,
    peerMemberId: input.memberIdA,
    metadata: input.metadata
  });
  return { ok: true };
}
