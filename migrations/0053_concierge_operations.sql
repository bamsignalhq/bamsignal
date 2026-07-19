-- Phase 3E: Concierge Operations — case workflow events + ops status.
-- Eligibility remains entitlements. Invoices request payment; they do not grant membership.

alter table concierge_members
  add column if not exists ops_status text;

alter table concierge_members
  drop constraint if exists concierge_members_ops_status_check;

alter table concierge_members
  add constraint concierge_members_ops_status_check
  check (
    ops_status is null
    or ops_status in (
      'applied',
      'under_review',
      'accepted',
      'rejected',
      'assigned',
      'in_progress',
      'completed',
      'closed'
    )
  );

create index if not exists concierge_members_ops_status_idx
  on concierge_members (ops_status, updated_at desc);

-- Backfill ops_status from legacy member status where missing.
update concierge_members
set ops_status = case
  when status = 'applied' then 'applied'
  when status in ('under-review', 'consultation-scheduled', 'waitlisted') then 'under_review'
  when status = 'accepted' then 'accepted'
  when status in ('active-search', 'introductions-in-progress', 'relationship', 'exclusive', 'engaged', 'paused')
    then 'in_progress'
  when status in ('matched', 'married', 'legacy-archive') then 'completed'
  when status = 'closed' then 'closed'
  else 'applied'
end
where ops_status is null;

alter table concierge_invoices
  add column if not exists payment_ref text;

alter table concierge_invoices
  add column if not exists paid_at timestamptz;

create index if not exists concierge_invoices_payment_ref_idx
  on concierge_invoices (payment_ref)
  where payment_ref is not null and payment_ref <> '';

create table if not exists concierge_case_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null
    check (event_type in (
      'APPLICATION_SUBMITTED',
      'REVIEW_STARTED',
      'APPLICATION_ACCEPTED',
      'APPLICATION_REJECTED',
      'CONSULTANT_ASSIGNED',
      'CONSULTANT_TRANSFERRED',
      'NOTE_ADDED',
      'INVOICE_CREATED',
      'INVOICE_SENT',
      'INVOICE_PAID',
      'INVOICE_CANCELLED',
      'PROGRESS_RECORDED',
      'CASE_COMPLETED',
      'CASE_REOPENED',
      'CASE_CLOSED',
      'STATUS_CHANGED'
    )),
  case_member_id text not null references concierge_members (id),
  journey_id text not null,
  from_status text,
  to_status text,
  consultant_id text,
  invoice_id uuid,
  actor text not null default 'system',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists concierge_case_events_member_idx
  on concierge_case_events (case_member_id, created_at desc);

create index if not exists concierge_case_events_journey_idx
  on concierge_case_events (journey_id, created_at desc);

create index if not exists concierge_case_events_type_idx
  on concierge_case_events (event_type, created_at desc);
