-- Consultant Quality, Standards & Certification™ — institutional consultant excellence layer.

create table if not exists consultant_reviews (
  id uuid primary key default gen_random_uuid(),
  review_ref text not null unique,
  consultant_ref text not null,
  reviewer_email text not null,
  review_type text not null,
  journey_ref text,
  overall_score numeric(5, 2) not null,
  summary text not null,
  standard_ratings jsonb not null default '[]'::jsonb,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists consultant_reviews_consultant_idx
  on consultant_reviews (consultant_ref, reviewed_at desc);

create table if not exists consultant_certifications (
  id uuid primary key default gen_random_uuid(),
  consultant_ref text not null,
  certification_level text not null,
  status text not null default 'active',
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  issued_by text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create unique index if not exists consultant_certifications_active_idx
  on consultant_certifications (consultant_ref, certification_level);

create table if not exists quality_assessments (
  id uuid primary key default gen_random_uuid(),
  assessment_ref text not null unique,
  consultant_ref text not null,
  assessor_email text not null,
  assessment_type text not null,
  overall_score numeric(5, 2) not null,
  standard_scores jsonb not null default '{}'::jsonb,
  assessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quality_assessments_consultant_idx
  on quality_assessments (consultant_ref, assessed_at desc);

create table if not exists consultation_reviews (
  id uuid primary key default gen_random_uuid(),
  review_ref text not null unique,
  consultant_ref text not null,
  journey_ref text not null,
  reviewer_email text not null,
  review_type text not null,
  score numeric(5, 2) not null,
  notes text,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consultation_reviews_journey_idx on consultation_reviews (journey_ref);

create table if not exists coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  session_ref text not null unique,
  consultant_ref text not null,
  coach_email text not null,
  topic text not null,
  status text not null default 'scheduled',
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coaching_sessions_consultant_idx on coaching_sessions (consultant_ref, scheduled_at desc);

create table if not exists improvement_plans (
  id uuid primary key default gen_random_uuid(),
  plan_ref text not null unique,
  consultant_ref text not null,
  review_ref text,
  status text not null default 'active',
  actions jsonb not null default '[]'::jsonb,
  follow_up_review_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists improvement_plans_consultant_idx on improvement_plans (consultant_ref, status);
