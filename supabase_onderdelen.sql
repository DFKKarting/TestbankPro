-- DFK Logistics — Onderdelen catalogus
-- Voer uit in Supabase → SQL Editor → New query → Run

create table if not exists onderdelen (
  id uuid primary key default gen_random_uuid(),
  naam text not null unique,
  actief boolean default true,
  created_at timestamptz default now()
);
alter table onderdelen enable row level security;
create policy "auth" on onderdelen for all
  using (auth.role()='authenticated')
  with check (auth.role()='authenticated');
