-- Financial Operations Center™ — institutional finance governance layer.

create table if not exists financial_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_ref text not null unique,
  category text not null,
  status text not null default 'pending',
  amount_ngn numeric(14, 2) not null,
  currency text not null default 'NGN',
  member_ref text,
  consultant_ref text,
  journey_ref text,
  paystack_reference text,
  chargeback_flag boolean not null default false,
  audit_ref text,
  description text not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists financial_transactions_category_idx
  on financial_transactions (category, recorded_at desc);

create table if not exists refund_requests (
  id uuid primary key default gen_random_uuid(),
  refund_ref text not null unique,
  transaction_id uuid references financial_transactions(id),
  requested_by_email text not null,
  amount_ngn numeric(14, 2) not null,
  reason text not null,
  status text not null default 'pending',
  member_ref text,
  journey_ref text,
  paystack_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists refund_requests_status_idx on refund_requests (status, created_at desc);

create table if not exists refund_approvals (
  id uuid primary key default gen_random_uuid(),
  refund_request_id uuid not null references refund_requests(id),
  approver_email text not null,
  decision text not null,
  note text,
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists refund_approvals_request_idx on refund_approvals (refund_request_id);

create table if not exists consultant_payouts (
  id uuid primary key default gen_random_uuid(),
  payout_ref text not null unique,
  consultant_ref text not null,
  amount_ngn numeric(14, 2) not null,
  status text not null default 'pending',
  period_label text not null,
  consultations_count integer not null default 0,
  scheduled_at timestamptz,
  paid_at timestamptz,
  audit_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists consultant_payouts_status_idx on consultant_payouts (status, scheduled_at desc);

create table if not exists operating_expenses (
  id uuid primary key default gen_random_uuid(),
  expense_ref text not null unique,
  category text not null,
  amount_ngn numeric(14, 2) not null,
  vendor text,
  status text not null default 'recorded',
  incurred_at timestamptz not null default now(),
  description text not null,
  audit_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists operating_expenses_incurred_idx on operating_expenses (incurred_at desc);

create table if not exists financial_reports (
  id uuid primary key default gen_random_uuid(),
  report_ref text not null unique,
  period_type text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  total_revenue_ngn numeric(14, 2) not null default 0,
  total_expenses_ngn numeric(14, 2) not null default 0,
  total_refunds_ngn numeric(14, 2) not null default 0,
  net_position_ngn numeric(14, 2) not null default 0,
  generated_at timestamptz not null default now(),
  export_formats text[] not null default '{csv,pdf}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists financial_reports_period_idx on financial_reports (period_type, period_end desc);

create table if not exists reconciliation_logs (
  id uuid primary key default gen_random_uuid(),
  reconciliation_ref text not null unique,
  reconciliation_type text not null,
  status text not null default 'pending',
  paystack_total_ngn numeric(14, 2),
  internal_total_ngn numeric(14, 2),
  variance_ngn numeric(14, 2),
  reconciled_at timestamptz,
  notes text,
  audit_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists reconciliation_logs_type_idx on reconciliation_logs (reconciliation_type, reconciled_at desc);
