-- Carburatoren tabel (migratie van localStorage naar Supabase)
create table if not exists carburatoren (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  motor_type text default '',
  merk text default '',
  model text default '',
  baan_hoog text default '',
  baan_laag text default '',
  test_hoog text default '',
  test_laag text default '',
  opmerkingen text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table carburatoren enable row level security;

create policy "Authenticated read" on carburatoren
  for select using (auth.role() = 'authenticated');

create policy "Authenticated insert" on carburatoren
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated update" on carburatoren
  for update using (auth.role() = 'authenticated');

create policy "Authenticated delete" on carburatoren
  for delete using (auth.role() = 'authenticated');
