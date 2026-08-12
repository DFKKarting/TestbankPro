-- DFK Sales — Voer uit in Supabase → SQL Editor → New query → Run

-- Circuits
create table if not exists circuits (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  actief boolean default true,
  volgorde int default 0,
  created_at timestamptz default now()
);
alter table circuits enable row level security;
create policy "auth" on circuits for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Klanten (DFK Sales — apart van DFK Engines testbank-klanten)
create table if not exists verkoop_klanten (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  team text,
  email text,
  telefoon text,
  btw_nummer text,
  actief boolean default true,
  created_at timestamptz default now()
);
alter table verkoop_klanten enable row level security;
create policy "auth" on verkoop_klanten for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Producten catalogus
create table if not exists producten (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  artikelnummer text,
  categorie text default 'Algemeen',
  eenheid text default 'stuk',
  verkoopprijs numeric(10,2) default 0,
  btw_pct numeric(4,1) default 21,
  actief boolean default true,
  created_at timestamptz default now()
);
alter table producten enable row level security;
create policy "auth" on producten for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Verkopen
create table if not exists verkopen (
  id uuid primary key default gen_random_uuid(),
  nummer text not null,
  klant_id uuid references verkoop_klanten(id),
  klant_naam text not null,
  circuit_id uuid references circuits(id),
  circuit_naam text,
  datum date not null default current_date,
  referentie text,
  status text not null default 'open' check (status in ('open','klaar','gefactureerd')),
  totaal_excl numeric(10,2) default 0,
  totaal_btw numeric(10,2) default 0,
  totaal_incl numeric(10,2) default 0,
  aangemaakt_door text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table verkopen enable row level security;
create policy "auth" on verkopen for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Verkoop-items (prijssnapshot bij aankoop)
create table if not exists verkoop_items (
  id uuid primary key default gen_random_uuid(),
  verkoop_id uuid references verkopen(id) on delete cascade,
  product_id uuid references producten(id),
  product_naam text not null,
  artikelnummer text,
  categorie text,
  aantal int not null default 1,
  stukprijs numeric(10,2) not null default 0,
  btw_pct numeric(4,1) not null default 21,
  totaal numeric(10,2) not null default 0,
  toegevoegd_door text,
  created_at timestamptz default now()
);
alter table verkoop_items enable row level security;
create policy "auth" on verkoop_items for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Audit log
create table if not exists verkoop_log (
  id uuid primary key default gen_random_uuid(),
  verkoop_id uuid references verkopen(id) on delete cascade,
  actie text not null,
  details text,
  door text,
  created_at timestamptz default now()
);
alter table verkoop_log enable row level security;
create policy "auth" on verkoop_log for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Rol dfk-sales toevoegen aan constraint
alter table user_roles drop constraint if exists user_roles_rol_check;
alter table user_roles add constraint user_roles_rol_check
  check (rol in ('admin','dfk-engines','dfk-logistics','dfk-sales'));

-- Paar standaard circuits toevoegen
insert into circuits (naam, volgorde) values
  ('Genk', 0), ('Mariembourg', 1), ('Spa-Francorchamps', 2),
  ('Zolder', 3), ('Signa', 4), ('Kerpen', 5)
on conflict do nothing;
