-- Phase 3B: Discreet Membership visibility (privacy mode, not a Premium toggle).
-- Denormalized on app_member_profiles for fail-closed listing SQL.
-- Source of truth for purchases remains member_experience_memberships (0050).

alter table app_member_profiles
  add column if not exists privacy_mode text not null default 'discover';

alter table app_member_profiles
  add column if not exists discreet_until timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_member_profiles_privacy_mode_check'
  ) then
    alter table app_member_profiles
      add constraint app_member_profiles_privacy_mode_check
      check (privacy_mode in ('discover', 'discreet'));
  end if;
end $$;

create index if not exists app_member_profiles_discreet_active_idx
  on app_member_profiles (privacy_mode, discreet_until)
  where privacy_mode = 'discreet';

-- Harden experience membership uniqueness for active discreet rows per member.
create unique index if not exists member_experience_memberships_active_discreet_uidx
  on member_experience_memberships (member_id)
  where experience_mode = 'discreet' and status = 'active';
