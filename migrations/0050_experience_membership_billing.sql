-- Phase 3A: Experience-based membership & commercial catalog
-- Live prices live in these tables (+ mirrored to platform_settings for back-compat).
-- Payment history tables are never deleted by this migration.

create table if not exists membership_products (
  id text primary key,
  experience_mode text not null check (experience_mode in ('discover', 'discreet', 'concierge')),
  name text not null,
  description text not null default '',
  active boolean not null default true,
  visibility text not null default 'public' check (visibility in ('public', 'hidden')),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists membership_plans (
  id text not null,
  product_id text not null references membership_products(id) on delete cascade,
  name text not null,
  interval_label text not null default 'monthly',
  price_kobo bigint not null check (price_kobo > 0),
  days integer not null check (days > 0),
  active boolean not null default true,
  visibility text not null default 'public' check (visibility in ('public', 'hidden')),
  highlight text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, id)
);

create index if not exists membership_plans_active_idx
  on membership_plans (product_id, active, sort_order);

create table if not exists concierge_packages (
  id text primary key,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  price_kobo bigint not null check (price_kobo > 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  benefits jsonb not null default '[]'::jsonb,
  regions jsonb not null default '[]'::jsonb,
  retired_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists concierge_packages_active_idx
  on concierge_packages (active, sort_order);

-- Future-ready stubs (empty until later phases)
create table if not exists pricing_promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  experience_mode text,
  discount_type text not null check (discount_type in ('percent', 'fixed_kobo')),
  discount_value bigint not null,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists member_experience_memberships (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  experience_mode text not null check (experience_mode in ('discover', 'discreet', 'concierge')),
  product_id text,
  plan_id text,
  package_id text,
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  source_payment_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_experience_memberships_member_idx
  on member_experience_memberships (member_id, status, ends_at desc);

create table if not exists concierge_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  journey_id text not null,
  member_id text not null,
  consultant_id text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'partially_paid', 'paid', 'cancelled', 'overdue')),
  currency text not null default 'NGN',
  total_kobo bigint not null check (total_kobo >= 0),
  amount_paid_kobo bigint not null default 0 check (amount_paid_kobo >= 0),
  due_at timestamptz,
  notes text,
  documents jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists concierge_invoices_journey_idx
  on concierge_invoices (journey_id, created_at desc);
create index if not exists concierge_invoices_member_idx
  on concierge_invoices (member_id, status);

create table if not exists concierge_invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references concierge_invoices(id) on delete cascade,
  label text not null,
  amount_kobo bigint not null check (amount_kobo >= 0),
  quantity integer not null default 1 check (quantity > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists payment_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  payment_ref text,
  member_id text,
  product_type text,
  score integer not null default 0,
  decision text not null check (decision in ('allow', 'review', 'block')),
  signals jsonb not null default '{}'::jsonb,
  reviewer_id text,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

create index if not exists payment_risk_assessments_decision_idx
  on payment_risk_assessments (decision, created_at desc);

-- Seed Discover Membership (weekly ₦999, monthly ₦2,999; quarterly retired for new sales)
insert into membership_products (id, experience_mode, name, description, active, visibility, sort_order)
values
  (
    'discover',
    'discover',
    'Discover Membership',
    'Self-directed dating — freedom to explore, Signal, and chat at your own pace.',
    true,
    'public',
    1
  ),
  (
    'discreet',
    'discreet',
    'Discreet Membership',
    'Full Discover power while remaining undiscoverable until you initiate contact.',
    true,
    'public',
    2
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into membership_plans (
  id, product_id, name, interval_label, price_kobo, days, active, visibility, highlight, sort_order
) values
  ('weekly', 'discover', 'Weekly Discover Membership', 'weekly', 99900, 7, true, 'public', '', 1),
  ('monthly', 'discover', 'Monthly Discover Membership', 'monthly', 299900, 30, true, 'public', 'Recommended', 2),
  ('quarterly', 'discover', '3 Months Discover Membership', 'quarterly', 1099900, 90, true, 'hidden', 'Legacy', 3),
  ('monthly', 'discreet', 'Monthly Discreet Membership', 'monthly', 999900, 30, true, 'public', '', 1)
on conflict (product_id, id) do update set
  name = excluded.name,
  price_kobo = excluded.price_kobo,
  days = excluded.days,
  active = excluded.active,
  visibility = excluded.visibility,
  highlight = excluded.highlight,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Seed Concierge packages (admin-editable; code constants become fallback only)
insert into concierge_packages (id, name, tagline, price_kobo, active, sort_order, benefits)
values
  (
    'essential',
    'Signal Concierge Essential™',
    'Thoughtfully Guided',
    10000000,
    true,
    1,
    '["Compatibility profile","Consultant review","Curated introductions","WhatsApp support"]'::jsonb
  ),
  (
    'signature',
    'Signal Concierge Signature™',
    'Personally Curated',
    30000000,
    true,
    2,
    '["Everything in Essential","Dedicated consultant","Three introductions monthly"]'::jsonb
  ),
  (
    'legacy',
    'Signal Concierge Legacy™',
    'White-Glove Matchmaking',
    60000000,
    true,
    3,
    '["Everything in Signature","Senior consultant","Family value alignment"]'::jsonb
  ),
  (
    'global',
    'Signal Concierge Global™',
    'Worldwide Introductions',
    100000000,
    true,
    4,
    '["Diaspora compatibility","Cross-border introductions","Senior consultants"]'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  price_kobo = excluded.price_kobo,
  benefits = excluded.benefits,
  updated_at = now();

-- Mirror Discover defaults into platform_settings for existing checkout path
insert into platform_settings (key, value, updated_at)
values (
  'premium_plans',
  '[
    {"id":"weekly","name":"Weekly Discover Membership","price":999,"days":7,"highlight":""},
    {"id":"monthly","name":"Monthly Discover Membership","price":2999,"days":30,"highlight":"Recommended"},
    {"id":"quarterly","name":"3 Months Discover Membership","price":10999,"days":90,"highlight":"Legacy","active":false}
  ]'::jsonb,
  now()
)
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

insert into platform_settings (key, value, updated_at)
values (
  'consultation_fee_ngn',
  '100000'::jsonb,
  now()
)
on conflict (key) do nothing;
