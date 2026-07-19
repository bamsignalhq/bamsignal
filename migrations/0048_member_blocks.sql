-- Member-initiated blocks for messaging / social enforcement.
create table if not exists member_blocks (
  blocker_user_key text not null,
  blocked_profile_id uuid not null,
  blocked_user_key text,
  created_at timestamptz not null default now(),
  primary key (blocker_user_key, blocked_profile_id)
);

create index if not exists member_blocks_blocked_profile_idx
  on member_blocks (blocked_profile_id);

create index if not exists member_blocks_blocked_user_key_idx
  on member_blocks (blocked_user_key)
  where blocked_user_key is not null;
