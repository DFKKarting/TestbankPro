-- RLS inschakelen op alle tabellen die het nog missen
-- Voer dit uit in het Supabase SQL-editor dashboard

-- motoren
alter table if exists motoren enable row level security;
drop policy if exists "auth" on motoren;
create policy "auth" on motoren for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- revisies
alter table if exists revisies enable row level security;
drop policy if exists "auth" on revisies;
create policy "auth" on revisies for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- sessie_screenshots
alter table if exists sessie_screenshots enable row level security;
drop policy if exists "auth" on sessie_screenshots;
create policy "auth" on sessie_screenshots for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- analyses
alter table if exists analyses enable row level security;
drop policy if exists "auth" on analyses;
create policy "auth" on analyses for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- aanvragen
alter table if exists aanvragen enable row level security;
drop policy if exists "auth" on aanvragen;
create policy "auth" on aanvragen for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- status_history
alter table if exists status_history enable row level security;
drop policy if exists "auth" on status_history;
create policy "auth" on status_history for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- trucks
alter table if exists trucks enable row level security;
drop policy if exists "auth" on trucks;
create policy "auth" on trucks for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- profiles: iedereen mag zijn eigen profiel lezen, alleen authenticated mag schrijven
alter table if exists profiles enable row level security;
drop policy if exists "auth read" on profiles;
drop policy if exists "auth write" on profiles;
create policy "auth read" on profiles for select
  using (auth.role() = 'authenticated');
create policy "auth write" on profiles for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- user_roles: alleen lezen voor authenticated (rollen worden beheerd door admin)
alter table if exists user_roles enable row level security;
drop policy if exists "auth read" on user_roles;
create policy "auth read" on user_roles for select
  using (auth.role() = 'authenticated');
