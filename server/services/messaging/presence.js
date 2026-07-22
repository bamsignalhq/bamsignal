import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { publishRealtimeEvent } from "./eventBus.js";
import { incrementMessagingMetric } from "./observability.js";

export const PRESENCE_STATUSES = Object.freeze(["online", "offline", "invisible"]);

const PRESENCE_TIMEOUT_MS = 90_000;

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_presence_state");
    return true;
  } catch {
    return false;
  }
}

export function isPresenceStale(heartbeatAt, now = Date.now()) {
  if (!heartbeatAt) return true;
  const ts = new Date(heartbeatAt).getTime();
  return now - ts > PRESENCE_TIMEOUT_MS;
}

export async function updatePresenceHeartbeat(input = {}) {
  if (!(await ensureTable()) || !input.memberId) return { ok: false, skipped: true };

  const status = PRESENCE_STATUSES.includes(input.status) ? input.status : "online";
  const now = new Date().toISOString();
  const previous = await getPresenceState(input.memberId);
  const wasOnline = previous?.status === "online" && !isPresenceStale(previous?.heartbeat_at);

  try {
    await query(
      `insert into member_presence_state (
         member_id, status, last_seen_at, active_device_id, last_activity_at, heartbeat_at, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7::jsonb)
       on conflict (member_id) do update set
         status = excluded.status,
         last_seen_at = case when excluded.status = 'offline' then now() else member_presence_state.last_seen_at end,
         active_device_id = coalesce(excluded.active_device_id, member_presence_state.active_device_id),
         last_activity_at = excluded.last_activity_at,
         heartbeat_at = excluded.heartbeat_at,
         metadata = member_presence_state.metadata || excluded.metadata,
         updated_at = now()`,
      [
        input.memberId,
        status,
        status === "offline" ? now : previous?.last_seen_at || null,
        input.deviceId || null,
        now,
        now,
        JSON.stringify(input.metadata || {})
      ]
    );

    incrementMessagingMetric("presenceUpdates");

    if (status === "online" && !wasOnline) {
      await publishRealtimeEvent({
        eventType: "presence.online",
        presenceOnline: true,
        memberId: input.memberId,
        idempotencyKey: `${input.memberId}:online:${now}`
      });
    }
    if (status === "offline" && wasOnline) {
      await publishRealtimeEvent({
        eventType: "presence.offline",
        presenceOffline: true,
        memberId: input.memberId,
        idempotencyKey: `${input.memberId}:offline:${now}`
      });
    }

    return { ok: true, status, heartbeatAt: now };
  } catch (error) {
    console.warn("[messaging:presence] heartbeat failed", error?.message || error);
    return { ok: false, error: error?.message || "heartbeat_failed" };
  }
}

export async function markPresenceOffline(memberId) {
  return updatePresenceHeartbeat({ memberId, status: "offline" });
}

export async function getPresenceState(memberId) {
  if (!(await ensureTable()) || !memberId) return null;
  const { rows } = await query(
    `select member_id, status, last_seen_at, active_device_id, last_activity_at, heartbeat_at, updated_at
     from member_presence_state where member_id = $1`,
    [memberId]
  );
  const row = rows[0] || null;
  if (row && row.status === "online" && isPresenceStale(row.heartbeat_at)) {
    return { ...row, status: "offline", stale: true };
  }
  return row;
}

export async function resolveEffectivePresence(memberId) {
  const state = await getPresenceState(memberId);
  if (!state) return { status: "offline", lastSeenAt: null };
  return {
    status: state.status === "invisible" ? "offline" : state.status,
    lastSeenAt: state.last_seen_at || state.heartbeat_at || null,
    invisible: state.status === "invisible"
  };
}

export async function expireStalePresence() {
  if (!(await ensureTable())) return { expired: 0 };
  const staleBefore = new Date(Date.now() - PRESENCE_TIMEOUT_MS).toISOString();
  const result = await query(
    `update member_presence_state
     set status = 'offline', last_seen_at = coalesce(last_seen_at, now()), updated_at = now()
     where status = 'online' and heartbeat_at < $1
     returning member_id`,
    [staleBefore]
  );
  return { expired: result.rowCount || 0 };
}
