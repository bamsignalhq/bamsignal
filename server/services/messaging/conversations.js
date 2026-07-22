import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { publishRealtimeEvent } from "./eventBus.js";

export const CONVERSATION_STATUSES = Object.freeze([
  "pending",
  "active",
  "archived",
  "muted",
  "blocked",
  "reported",
  "closed",
  "deleted"
]);

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_conversation_state");
    await assertSchemaTable("member_conversation_lifecycle_log");
    return true;
  } catch {
    return false;
  }
}

export async function transitionConversationLifecycle(input = {}) {
  const newStatus = String(input.newStatus || "").trim();
  if (!CONVERSATION_STATUSES.includes(newStatus)) {
    return { ok: false, error: "invalid_status" };
  }
  if (!(await ensureTables()) || !input.conversationId || !input.memberId) {
    return { ok: false, skipped: true };
  }

  const previousStatus = String(input.previousStatus || "unknown");
  const logId = String(input.logId || crypto.randomUUID());

  try {
    await query(
      `insert into member_conversation_lifecycle_log (
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
      `insert into member_conversation_state (
         conversation_id, member_id, peer_member_id, status, metadata
       ) values ($1,$2,$3,$4,$5::jsonb)
       on conflict (conversation_id, member_id) do update set
         status = excluded.status,
         peer_member_id = coalesce(excluded.peer_member_id, member_conversation_state.peer_member_id),
         metadata = member_conversation_state.metadata || excluded.metadata,
         updated_at = now()`,
      [
        input.conversationId,
        input.memberId,
        input.peerMemberId || null,
        newStatus,
        JSON.stringify(input.metadata || {})
      ]
    );

    if (newStatus === "archived") {
      await publishRealtimeEvent({
        eventType: "conversation.archived",
        conversationArchived: true,
        conversationId: input.conversationId,
        memberId: input.memberId,
        idempotencyKey: `${input.conversationId}:${input.memberId}:archived`
      });
    }

    return { ok: true, logId, previousStatus, newStatus };
  } catch (error) {
    console.warn("[messaging:conversations] transition failed", error?.message || error);
    return { ok: false, error: error?.message || "transition_failed" };
  }
}

export async function getConversationState(conversationId, memberId) {
  if (!(await ensureTables()) || !conversationId || !memberId) return null;
  const { rows } = await query(
    `select conversation_id, member_id, peer_member_id, status, metadata, updated_at
     from member_conversation_state
     where conversation_id = $1 and member_id = $2`,
    [conversationId, memberId]
  );
  return rows[0] || null;
}

export async function listConversationTransitions(conversationId, options = {}) {
  if (!(await ensureTables()) || !conversationId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, member_id, previous_status, new_status, reason_code, reason, actor, occurred_at
     from member_conversation_lifecycle_log
     where conversation_id = $1
     order by occurred_at desc
     limit $2`,
    [conversationId, limit]
  );
  return rows;
}

/** Hook when a match/conversation is created (e.g. signal acceptance) */
export async function recordConversationCreated(input = {}) {
  if (!input.conversationId || !input.memberId) return { ok: false, skipped: true };

  const previous = (await getConversationState(input.conversationId, input.memberId))?.status || null;
  const initialStatus = input.pending ? "pending" : "active";

  const result = await transitionConversationLifecycle({
    conversationId: input.conversationId,
    memberId: input.memberId,
    peerMemberId: input.peerMemberId || null,
    previousStatus: previous || "unknown",
    newStatus: initialStatus,
    reasonCode: input.reasonCode || "conversation_created",
    reason: input.reason || "Conversation created",
    actor: input.actor || "system",
    metadata: input.metadata || {}
  });

  if (result.ok) {
    await publishRealtimeEvent({
      eventType: "conversation.created",
      conversationCreated: true,
      conversationId: input.conversationId,
      memberId: input.memberId,
      peerMemberId: input.peerMemberId || null,
      idempotencyKey: `${input.conversationId}:${input.memberId}:created`
    });
  }

  return result;
}

export async function ensureConversationPair(input = {}) {
  if (!input.conversationId || !input.memberIdA || !input.memberIdB) {
    return { ok: false, skipped: true };
  }
  await recordConversationCreated({
    conversationId: input.conversationId,
    memberId: input.memberIdA,
    peerMemberId: input.memberIdB,
    pending: input.pending,
    metadata: input.metadata
  });
  await recordConversationCreated({
    conversationId: input.conversationId,
    memberId: input.memberIdB,
    peerMemberId: input.memberIdA,
    pending: input.pending,
    metadata: input.metadata
  });

  try {
    const { ensureMembershipPair } = await import("./membership.js");
    await ensureMembershipPair({
      conversationId: input.conversationId,
      memberIdA: input.memberIdA,
      memberIdB: input.memberIdB,
      metadata: input.metadata
    });
  } catch {
    /* membership must not block conversation creation */
  }

  return { ok: true };
}
