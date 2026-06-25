-- Institutional Policy & Documentation Center™ — living documentation layer.

create table if not exists document_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  hint text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_slug text not null,
  status text not null default 'draft',
  current_version text not null default '1.0',
  author text not null,
  owner text not null,
  summary text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  related_slugs text[] not null default '{}',
  view_count integer not null default 0,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists documents_category_idx on documents (category_slug, status);
create index if not exists documents_status_idx on documents (status, updated_at desc);

create table if not exists document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  version text not null,
  author text not null,
  note text,
  body text not null default '',
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create index if not exists document_versions_doc_idx on document_versions (document_id, created_at desc);

create table if not exists policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_slug text not null,
  version text not null,
  title text not null,
  body text not null default '',
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (policy_slug, version)
);

create index if not exists policy_versions_slug_idx on policy_versions (policy_slug, published_at desc);

create table if not exists document_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  employee_email text not null,
  version text not null,
  read_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  unique (document_id, employee_email, version)
);

create index if not exists document_acknowledgements_doc_idx
  on document_acknowledgements (document_id, acknowledged_at desc);

create table if not exists knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_slug text not null,
  status text not null default 'draft',
  current_version text not null default '1.0',
  body_markdown text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  search_text text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists knowledge_articles_search_idx on knowledge_articles (status, updated_at desc);
