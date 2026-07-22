import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_conversation_sequence");
    await assertSchemaTable("member_message_state");
    return true;
  } catch {
    return false;
  }
}

/**
 * Allocate monotonically increasing sequence number within a conversation.
 */
export async function allocateMessageSequence(conversationId) {
  if (!(await ensureTables()) || !conversationId) {
    return { ok: false, skipped: true, sequenceNumber: null };
  }

  try {
    const result = await query(
      `insert into member_conversation_sequence (conversation_id, next_seq)
       values ($1, 1)
       on conflict (conversation_id) do update set
         next_seq = member_conversation_sequence.next_seq + 1,
         updated_at = now()
       returning next_seq as sequence_number`,
      [conversationId]
    );

    const sequenceNumber = Number(result.rows[0]?.sequence_number) || null;
    return { ok: Boolean(sequenceNumber), sequenceNumber };
  } catch (error) {
    console.warn("[messaging:sequences] allocate failed", error?.message || error);
    return { ok: false, error: error?.message || "allocate_failed", sequenceNumber: null };
  }
}

export async function getConversationHighSequence(conversationId) {
  if (!(await ensureTables()) || !conversationId) return 0;
  const { rows } = await query(
    `select coalesce(max(sequence_number), 0)::bigint as high_seq
     from member_message_state where conversation_id = $1`,
    [conversationId]
  );
  return Number(rows[0]?.high_seq) || 0;
}

export async function listMessagesFromSequence(conversationId, afterSeq = 0, options = {}) {
  if (!(await ensureTables()) || !conversationId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select message_id, conversation_id, sequence_number, status, body_preview, created_at
     from member_message_state
     where conversation_id = $1 and sequence_number > $2
     order by sequence_number asc
     limit $3`,
    [conversationId, Number(afterSeq) || 0, limit]
  );
  return rows;
}

/** Detect missing sequence numbers between low and high inclusive */
export async function detectSequenceGaps(conversationId, options = {}) {
  if (!(await ensureTables()) || !conversationId) return { ok: true, gaps: [], skipped: true };

  const low = Number(options.afterSeq) || 0;
  const high = options.upToSeq != null ? Number(options.upToSeq) : await getConversationHighSequence(conversationId);
  if (high <= low) return { ok: true, gaps: [], low, high };

  const { rows } = await query(
    `select sequence_number from member_message_state
     where conversation_id = $1 and sequence_number > $2 and sequence_number <= $3
     order by sequence_number asc`,
    [conversationId, low, high]
  );

  const present = new Set(rows.map((r) => Number(r.sequence_number)));
  const gaps = [];
  for (let seq = low + 1; seq <= high; seq += 1) {
    if (!present.has(seq)) gaps.push(seq);
  }

  return { ok: true, gaps, low, high, present: present.size };
}

export async function resolveSequenceConflict(input = {}) {
  const conversationId = String(input.conversationId || "").trim();
  const clientSeq = Number(input.sequenceNumber);
  if (!conversationId || !Number.isFinite(clientSeq)) {
    return { ok: false, resolution: "invalid" };
  }

  const { rows } = await query(
    `select message_id, sequence_number, status from member_message_state
     where conversation_id = $1 and sequence_number = $2 limit 1`,
    [conversationId, clientSeq]
  );

  if (rows[0]) {
    return { ok: true, resolution: "keep_server", state: rows[0] };
  }

  const high = await getConversationHighSequence(conversationId);
  if (clientSeq <= high) {
    const gapCheck = await detectSequenceGaps(conversationId, { afterSeq: clientSeq - 1, upToSeq: clientSeq });
    return { ok: true, resolution: "gap_detected", gaps: gapCheck.gaps };
  }

  return { ok: true, resolution: "accept_client", conversationId, sequenceNumber: clientSeq };
}
