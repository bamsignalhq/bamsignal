do $$
begin
  if to_regclass('public.payment_fulfillments') is not null then
    alter table public.payment_fulfillments
      add column if not exists processing_started_at timestamptz;

    create unique index if not exists payment_fulfillments_reference_unique_idx
      on public.payment_fulfillments (paystack_reference);
  end if;

  if to_regclass('public.app_users') is not null then
    create unique index if not exists app_users_paystack_reference_unique_idx
      on public.app_users (paystack_reference)
      where paystack_reference is not null and paystack_reference <> '';
  end if;

  if to_regclass('public.city_home_placements') is not null then
    create unique index if not exists city_home_placements_paystack_reference_unique_idx
      on public.city_home_placements (paystack_reference)
      where paystack_reference is not null and paystack_reference <> '';
  end if;
end $$;
