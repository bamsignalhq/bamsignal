import { query, isDatabaseReady } from "../db.js";

let ensured = false;

export async function ensureMemberBlocksTable() {
  if (!isDatabaseReady() || ensured) return;
  await query(`
    create table if not exists member_blocks (
      blocker_user_key text not null,
      blocked_profile_id uuid not null,
      blocked_user_key text,
      created_at timestamptz not null default now(),
      primary key (blocker_user_key, blocked_profile_id)
    )
  `);
  await query(`
    create index if not exists member_blocks_blocked_profile_idx
      on member_blocks (blocked_profile_id)
  `);
  await query(`
    create index if not exists member_blocks_blocked_user_key_idx
      on member_blocks (blocked_user_key)
      where blocked_user_key is not null
  `);
  ensured = true;
}

export async function persistMemberBlock({
  blockerUserKey,
  blockedProfileId,
  blockedUserKey = null
}) {
  if (!isDatabaseReady() || !blockerUserKey || !blockedProfileId) return false;
  await ensureMemberBlocksTable();
  await query(
    `insert into member_blocks (blocker_user_key, blocked_profile_id, blocked_user_key)
     values ($1, $2, $3)
     on conflict (blocker_user_key, blocked_profile_id)
     do update set blocked_user_key = coalesce(excluded.blocked_user_key, member_blocks.blocked_user_key)`,
    [blockerUserKey, blockedProfileId, blockedUserKey || null]
  );
  return true;
}

export async function isEitherSideBlocked({ userKeyA, userKeyB, profileIdA, profileIdB }) {
  if (!isDatabaseReady()) return false;
  if (!userKeyA && !userKeyB) return false;
  await ensureMemberBlocksTable();

  const { rows } = await query(
    `select 1
     from member_blocks
     where
       ($1::text is not null and blocker_user_key = $1 and (
          ($4::uuid is not null and blocked_profile_id = $4)
          or ($2::text is not null and blocked_user_key = $2)
       ))
       or
       ($2::text is not null and blocker_user_key = $2 and (
          ($3::uuid is not null and blocked_profile_id = $3)
          or ($1::text is not null and blocked_user_key = $1)
       ))
     limit 1`,
    [userKeyA || null, userKeyB || null, profileIdA || null, profileIdB || null]
  );
  return Boolean(rows[0]);
}

export async function unmatchBothSides({ matchId, userKey }) {
  if (!isDatabaseReady() || !matchId || !userKey) return false;

  const peer = await query(
    `select user_key from app_matches where id = $1 and user_key <> $2 limit 1`,
    [matchId, userKey]
  );
  const peerKey = peer.rows[0]?.user_key || null;

  await query(`delete from app_messages where thread_id = $1`, [matchId]);
  await query(`delete from app_chat_threads where match_id = $1`, [matchId]);
  await query(`delete from app_matches where id = $1`, [matchId]);

  return { ok: true, peerUserKey: peerKey };
}
