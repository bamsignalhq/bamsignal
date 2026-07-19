-- Phase 3D: Membership commerce events (immutable audit of commercial actions).
-- Payment does not grant access directly — events + activation do.

create table if not exists membership_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null
    check (event_type in (
      'PAYMENT_COMPLETED',
      'MEMBERSHIP_GRANTED',
      'MEMBERSHIP_RENEWED',
      'MEMBERSHIP_EXPIRED',
      'MEMBERSHIP_REVOKED',
      'ADMIN_GRANTED',
      'ADMIN_REVOKED',
      'REFUND_APPLIED'
    )),
  member_id text,
  user_key text,
  experience_mode text
    check (experience_mode is null or experience_mode in ('discover', 'discreet', 'concierge')),
  product_id text,
  plan_id text,
  source_payment_ref text,
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists membership_events_member_idx
  on membership_events (member_id, created_at desc);

create index if not exists membership_events_payment_idx
  on membership_events (source_payment_ref, event_type)
  where source_payment_ref is not null and source_payment_ref <> '';

-- One grant/renew per payment reference (idempotent activation).
create unique index if not exists membership_events_payment_activation_uidx
  on membership_events (source_payment_ref, event_type)
  where source_payment_ref is not null
    and source_payment_ref <> ''
    and event_type in ('MEMBERSHIP_GRANTED', 'MEMBERSHIP_RENEWED');
