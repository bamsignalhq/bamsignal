-- Enterprise Search Center™ — saved queries, recent searches, and index snapshots.

create table if not exists public.search_index_snapshots (
  id uuid primary key default gen_random_uuid(),
  index_size integer not null default 0,
  entity_counts jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.search_saved_queries (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  query text not null,
  entity text not null default 'all',
  use_count integer not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_recent_queries (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  entity text not null default 'all',
  result_count integer not null default 0,
  searched_by text,
  searched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists search_saved_queries_created_by_idx on public.search_saved_queries (created_by);
create index if not exists search_recent_queries_searched_at_idx on public.search_recent_queries (searched_at desc);
