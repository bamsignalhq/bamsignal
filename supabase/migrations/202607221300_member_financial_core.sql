-- Sprint 3 — Financial Core (immutable ledger, lifecycle, wallet, refunds, reconciliation).
-- Extends existing Paystack fulfillment; does not replace payment_fulfillments or payment_events.

-- Append-only immutable financial ledger
create table if not exists member_financial_ledger (
  id uuid primary key default gen_random_uuid(),
  entry_id text not null,
  idempotency_key text not null,
  transaction_id text not null,
  reference text null,
  gateway_reference text null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  auth_user_id uuid null,
  user_key text null,
  amount_kobo bigint not null,
  currency text not null default 'NGN',
  tax_kobo bigint not null default 0,
  fee_kobo bigint not null default 0,
  net_kobo bigint not null,
  product_type text null,
  product_id text null,
  purpose text not null default 'purchase',
  source text not null default 'paystack',
  destination text not null default 'bamsignal',
  entry_type text not null default 'credit'
    check (entry_type in ('credit', 'debit', 'adjustment')),
  lifecycle_status text not null default 'initialized',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint member_financial_ledger_entry_id_key unique (entry_id),
  constraint member_financial_ledger_idempotency_key unique (idempotency_key)
);

create index if not exists member_financial_ledger_tx_idx
  on member_financial_ledger (transaction_id, created_at desc);
create index if not exists member_financial_ledger_ref_idx
  on member_financial_ledger (reference, created_at desc);
create index if not exists member_financial_ledger_member_idx
  on member_financial_ledger (member_id, created_at desc);
create index if not exists member_financial_ledger_status_idx
  on member_financial_ledger (lifecycle_status, created_at desc);

create index if not exists member_financial_ledger_idempotency_idx
  on member_financial_ledger (idempotency_key);

-- Financial event bus (internal publisher — append-only)
create table if not exists member_financial_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  idempotency_key text null,
  transaction_id text null,
  reference text null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_financial_events_event_id_key unique (event_id)
);

create index if not exists member_financial_events_type_idx
  on member_financial_events (event_type, occurred_at desc);
create index if not exists member_financial_events_ref_idx
  on member_financial_events (reference, occurred_at desc);

-- Subscription lifecycle state machine
create table if not exists member_subscription_state (
  member_id uuid primary key references app_member_profiles(id) on delete cascade,
  status text not null default 'active'
    check (status in (
      'trial', 'active', 'grace_period', 'payment_pending', 'expired', 'cancelled', 'suspended'
    )),
  product_id text null,
  plan_id text null,
  source_payment_ref text null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists member_subscription_lifecycle_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  previous_status text not null,
  new_status text not null,
  reason_code text not null default 'system',
  reason text not null default '',
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_subscription_lifecycle_log_log_id_key unique (log_id)
);

create index if not exists member_subscription_lifecycle_log_member_idx
  on member_subscription_lifecycle_log (member_id, occurred_at desc);

drop trigger if exists member_subscription_state_touch on member_subscription_state;
create trigger member_subscription_state_touch
  before update on member_subscription_state
  for each row execute function passport_touch_updated_at();

-- Transaction lifecycle transitions (append-only)
create table if not exists member_financial_lifecycle_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  transaction_id text not null,
  reference text null,
  previous_status text not null,
  new_status text not null,
  reason_code text not null default 'system',
  reason text not null default '',
  actor text not null default 'system',
  actor_role text not null default 'system'
    check (actor_role in ('member', 'admin', 'system', 'gateway')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_financial_lifecycle_log_log_id_key unique (log_id)
);

create index if not exists member_financial_lifecycle_log_tx_idx
  on member_financial_lifecycle_log (transaction_id, occurred_at desc);

-- Refund records (no automatic refunds)
create table if not exists member_refund_records (
  id uuid primary key default gen_random_uuid(),
  refund_id text not null,
  idempotency_key text not null,
  transaction_id text not null,
  reference text null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  amount_kobo bigint not null,
  currency text not null default 'NGN',
  refund_kind text not null default 'manual'
    check (refund_kind in ('manual', 'gateway', 'partial', 'full')),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reason text not null default '',
  requested_by text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz null,
  constraint member_refund_records_refund_id_key unique (refund_id),
  constraint member_refund_records_idempotency_key unique (idempotency_key)
);

create index if not exists member_refund_records_tx_idx
  on member_refund_records (transaction_id, created_at desc);
create index if not exists member_refund_records_status_idx
  on member_refund_records (status, created_at desc);

-- Reconciliation runs (reports only — never auto-modify ledger)
create table if not exists member_financial_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  run_id text not null,
  status text not null default 'completed'
    check (status in ('running', 'completed', 'failed')),
  summary jsonb not null default '{}'::jsonb,
  discrepancies jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint member_financial_reconciliation_runs_run_id_key unique (run_id)
);

create index if not exists member_financial_reconciliation_runs_started_idx
  on member_financial_reconciliation_runs (started_at desc);

drop trigger if exists member_refund_records_touch on member_refund_records;
create trigger member_refund_records_touch
  before update on member_refund_records
  for each row execute function passport_touch_updated_at();

alter table member_financial_ledger enable row level security;
alter table member_financial_events enable row level security;
alter table member_subscription_state enable row level security;
alter table member_subscription_lifecycle_log enable row level security;
alter table member_financial_lifecycle_log enable row level security;
alter table member_refund_records enable row level security;
alter table member_financial_reconciliation_runs enable row level security;
