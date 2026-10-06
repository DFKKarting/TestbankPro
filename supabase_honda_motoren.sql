create table if not exists honda_motoren (
  id uuid primary key default gen_random_uuid(),
  motor_nummer text not null,
  type text not null default 'GX160',
  zegel_nummer text default '',
  klant text default '',
  datum_gebouwd date,
  opmerkingen text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table honda_motoren enable row level security;

create policy "Authenticated read" on honda_motoren
  for select using (auth.role() = 'authenticated');

create policy "Authenticated insert" on honda_motoren
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated update" on honda_motoren
  for update using (auth.role() = 'authenticated');

create policy "Authenticated delete" on honda_motoren
  for delete using (auth.role() = 'authenticated');
