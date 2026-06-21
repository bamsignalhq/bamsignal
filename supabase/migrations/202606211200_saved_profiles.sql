-- Private saved profiles — member-only bookmarks, never exposed to saved targets.
create table if not exists saved_profiles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  saved_member_id uuid not null,
  created_at timestamptz not null default now(),
  unique (member_id, saved_member_id)
);

create index if not exists saved_profiles_member_id_idx
  on saved_profiles (member_id, created_at desc);

create index if not exists saved_profiles_saved_member_id_idx
  on saved_profiles (saved_member_id);
