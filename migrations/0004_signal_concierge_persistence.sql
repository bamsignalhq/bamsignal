-- Signal Concierge™ — permanent Supabase/Postgres persistence (no deletion).

create table if not exists concierge_consultants (
  id text primary key,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists concierge_members (
  id text primary key,
  journey_id text not null,
  status text not null default 'applied',
  preferred_tier text,
  application jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  trusted_member boolean not null default false,
  ownership text not null default 'bamsignal',
  current_consultant_id text,
  assigned_by text,
  assigned_at timestamptz,
  stewardship_history jsonb not null default '[]'::jsonb,
  communication_journal jsonb not null default '[]'::jsonb,
  flags jsonb not null default '[]'::jsonb,
  private_notes jsonb not null default '[]'::jsonb,
  consultant_summary jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_members_journey_id_format check (journey_id ~ '^BS-JR-\d{4}-\d{4}$')
);

create unique index if not exists concierge_members_journey_id_idx on concierge_members (journey_id);

create table if not exists concierge_consultation_payments (
  payment_id text primary key,
  member_id text not null references concierge_members (id),
  journey_id text not null,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_consultation_payments_payment_id_format check (payment_id ~ '^BS-PAY-\d{4}-\d{4}$')
);

create index if not exists concierge_consultation_payments_member_idx
  on concierge_consultation_payments (member_id, created_at desc);

create table if not exists concierge_consultations (
  id text primary key,
  member_id text not null references concierge_members (id),
  journey_id text not null,
  consultant_id text,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists concierge_consultations_member_idx
  on concierge_consultations (member_id, created_at desc);

create table if not exists concierge_meeting_notes (
  id text primary key,
  note_id text not null,
  member_id text not null references concierge_members (id),
  journey_id text,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_meeting_notes_note_id_format check (note_id ~ '^BS-MN-\d{4}-\d{4}$')
);

create unique index if not exists concierge_meeting_notes_note_id_idx on concierge_meeting_notes (note_id);
create index if not exists concierge_meeting_notes_member_idx on concierge_meeting_notes (member_id, created_at desc);

create table if not exists concierge_introductions (
  id text primary key,
  introduction_id text not null,
  member_id text not null references concierge_members (id),
  journey_id text not null,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_introductions_introduction_id_nonempty check (char_length(introduction_id) > 0)
);

create unique index if not exists concierge_introductions_introduction_id_idx on concierge_introductions (introduction_id);
create index if not exists concierge_introductions_member_idx on concierge_introductions (member_id, created_at desc);

create table if not exists concierge_followups (
  id text primary key,
  member_id text not null references concierge_members (id),
  journey_id text,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists concierge_followups_member_idx on concierge_followups (member_id, created_at desc);

create table if not exists concierge_archives (
  journey_id text primary key,
  member_id text not null references concierge_members (id),
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists concierge_legacy_profiles (
  journey_id text primary key,
  member_id text not null references concierge_members (id),
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists concierge_success_story_consents (
  id text primary key,
  journey_id text not null unique,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists concierge_notifications (
  id text primary key,
  notification_id text not null,
  member_id text not null references concierge_members (id),
  journey_id text,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_notifications_notification_id_format check (notification_id ~ '^BS-NTF-\d{4}-\d{4}$')
);

create unique index if not exists concierge_notifications_notification_id_idx
  on concierge_notifications (notification_id);

create table if not exists concierge_relationship_health_alerts (
  id text primary key,
  journey_id text not null,
  introduction_id text,
  record jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists concierge_relationship_health_alerts_journey_idx
  on concierge_relationship_health_alerts (journey_id, created_at desc);

-- Immutability guards
create or replace function concierge_prevent_journey_id_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.journey_id is distinct from new.journey_id then
    raise exception 'journey_id is immutable';
  end if;
  return new;
end;
$$;

create or replace function concierge_prevent_introduction_id_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.introduction_id is distinct from new.introduction_id then
    raise exception 'introduction_id is immutable';
  end if;
  return new;
end;
$$;

create or replace function concierge_prevent_payment_id_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.payment_id is distinct from new.payment_id then
    raise exception 'payment_id is immutable';
  end if;
  return new;
end;
$$;

create or replace function concierge_prevent_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Signal Concierge records cannot be deleted';
end;
$$;

drop trigger if exists concierge_members_journey_id_immutable on concierge_members;
create trigger concierge_members_journey_id_immutable
  before update on concierge_members
  for each row execute function concierge_prevent_journey_id_update();

drop trigger if exists concierge_introductions_introduction_id_immutable on concierge_introductions;
create trigger concierge_introductions_introduction_id_immutable
  before update on concierge_introductions
  for each row execute function concierge_prevent_introduction_id_update();

drop trigger if exists concierge_consultation_payments_payment_id_immutable on concierge_consultation_payments;
create trigger concierge_consultation_payments_payment_id_immutable
  before update on concierge_consultation_payments
  for each row execute function concierge_prevent_payment_id_update();

-- No deletion on concierge tables
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'concierge_consultants',
    'concierge_members',
    'concierge_consultation_payments',
    'concierge_consultations',
    'concierge_meeting_notes',
    'concierge_introductions',
    'concierge_followups',
    'concierge_archives',
    'concierge_legacy_profiles',
    'concierge_success_story_consents',
    'concierge_notifications',
    'concierge_relationship_health_alerts'
  ]
  loop
    execute format('drop trigger if exists concierge_no_delete on %I', table_name);
    execute format(
      'create trigger concierge_no_delete before delete on %I for each row execute function concierge_prevent_delete()',
      table_name
    );
  end loop;
end;
$$;
