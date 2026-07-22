import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { publishRealtimeEvent } from "./eventBus.js";
import { incrementMessagingMetric } from "./observability.js";

const TYPING_TIMEOUT_MS = 5000;
const inMemoryTyping = new Map();

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_typing_state");
    return true;
  } catch {
    return false;
  }
}

function typingKey(conversationId, memberId) {
  return `${conversationId}:${memberId}`;
}

export async function startTyping(input = {}) {
  if (!input.conversationId || !input.memberId) return { ok: false, skipped: true };

  const key = typingKey(input.conversationId, input.memberId);
  const existing = inMemoryTyping.get(key);
  if (existing && Date.now() - existing < TYPING_TIMEOUT_MS) {
    return { ok: true, duplicate: true };
  }

  inMemoryTyping.set(key, Date.now());
  const expiresAt = new Date(Date.now() + TYPING_TIMEOUT_MS).toISOString();

  if (await ensureTable()) {
    try {
      await query(
        `insert into member_typing_state (conversation_id, member_id, started_at, expires_at)
         values ($1,$2,now(),$3)
         on conflict (conversation_id, member_id) do update set
           started_at = now(), expires_at = excluded.expires_at`,
        [input.conversationId, input.memberId, expiresAt]
      );
    } catch {
      /* DB optional for typing */
    }
  }

  incrementMessagingMetric("typingEvents");
  await publishRealtimeEvent({
    eventType: "typing.started",
    typingStarted: true,
    conversationId: input.conversationId,
    memberId: input.memberId,
    idempotencyKey: `${input.conversationId}:${input.memberId}:typing`
  });

  return { ok: true, expiresAt };
}

export async function stopTyping(input = {}) {
  if (!input.conversationId || !input.memberId) return { ok: false, skipped: true };

  const key = typingKey(input.conversationId, input.memberId);
  inMemoryTyping.delete(key);

  if (await ensureTable()) {
    try {
      await query(
        `delete from member_typing_state where conversation_id = $1 and member_id = $2`,
        [input.conversationId, input.memberId]
      );
    } catch {
      /* DB optional */
    }
  }

  await publishRealtimeEvent({
    eventType: "typing.stopped",
    typingStopped: true,
    conversationId: input.conversationId,
    memberId: input.memberId,
    idempotencyKey: `${input.conversationId}:${input.memberId}:stopped`
  });

  return { ok: true };
}

export async function getActiveTypers(conversationId) {
  if (!conversationId) return [];

  const now = Date.now();
  const active = [];
  for (const [key, started] of inMemoryTyping.entries()) {
    if (!key.startsWith(`${conversationId}:`)) continue;
    if (now - started > TYPING_TIMEOUT_MS) {
      inMemoryTyping.delete(key);
      continue;
    }
    const memberId = key.split(":").slice(1).join(":");
    active.push({ memberId, startedAt: new Date(started).toISOString() });
  }

  if (await ensureTable()) {
    try {
      const { rows } = await query(
        `select member_id, started_at, expires_at
         from member_typing_state
         where conversation_id = $1 and expires_at > now()`,
        [conversationId]
      );
      for (const row of rows) {
        if (!active.some((a) => a.memberId === row.member_id)) {
          active.push({ memberId: row.member_id, startedAt: row.started_at });
        }
      }
    } catch {
      /* ignore */
    }
  }

  return active;
}

export async function expireStaleTyping() {
  const now = Date.now();
  for (const [key, started] of inMemoryTyping.entries()) {
    if (now - started > TYPING_TIMEOUT_MS) inMemoryTyping.delete(key);
  }
  if (await ensureTable()) {
    await query(`delete from member_typing_state where expires_at <= now()`);
  }
}
