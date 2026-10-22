-- Zet alle bestaande spellingen van motormerk en -type recht naar de vaste lijst.
-- Voer dit uit in Supabase → SQL Editor → New query → plakken → Run
--
-- Enkel hoofdletters, spaties, streepjes en punten worden gelijkgetrokken:
--   'iame' → 'IAME', 'x30 senior' / 'X30-Senior' / 'x30senior' → 'X30 Senior'
-- Waarden die niet in de lijst staan blijven ongewijzigd.
-- Het resultaat onderaan toont exact wat er aangepast is.
--
-- Houd deze lijst gelijk met MOTOR_TYPES in motortypes.js.

begin;

create temp table mk_merk(naam text) on commit drop;
insert into mk_merk values ('Honda'), ('IAME'), ('TM');

create temp table mk_type(naam text) on commit drop;
insert into mk_type values
  ('Cadet'), ('Junior'), ('Senior'),                                              -- Honda
  ('X30 Mini'), ('X30 Junior'), ('X30 Senior'), ('Super Shifter'), ('S125'),      -- IAME
  ('KZ');                                                                         -- TM

create temp table mk_wijzigingen(tabel text, kolom text, oud text, nieuw text, aantal int);

-- Overzicht van wat er zal veranderen (wordt onderaan getoond)
insert into mk_wijzigingen
  select 'motoren', 'motor_merk', t.motor_merk, l.naam, count(*) from motoren t join mk_merk l
    on lower(regexp_replace(t.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g'))
    where t.motor_merk <> l.naam group by 1, 2, 3, 4
  union all
  select 'motoren', 'motor_type', t.motor_type, l.naam, count(*) from motoren t join mk_type l
    on lower(regexp_replace(t.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g'))
    where t.motor_type <> l.naam group by 1, 2, 3, 4
  union all
  select 'sessies', 'motor_merk', t.motor_merk, l.naam, count(*) from sessies t join mk_merk l
    on lower(regexp_replace(t.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g'))
    where t.motor_merk <> l.naam group by 1, 2, 3, 4
  union all
  select 'sessies', 'motor_type', t.motor_type, l.naam, count(*) from sessies t join mk_type l
    on lower(regexp_replace(t.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g'))
    where t.motor_type <> l.naam group by 1, 2, 3, 4
  union all
  select 'revisies', 'motor_merk', t.motor_merk, l.naam, count(*) from revisies t join mk_merk l
    on lower(regexp_replace(t.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g'))
    where t.motor_merk <> l.naam group by 1, 2, 3, 4
  union all
  select 'revisies', 'motor_type', t.motor_type, l.naam, count(*) from revisies t join mk_type l
    on lower(regexp_replace(t.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g'))
    where t.motor_type <> l.naam group by 1, 2, 3, 4;

-- Aanpassingen
update motoren t set motor_merk = l.naam from mk_merk l
  where lower(regexp_replace(t.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g')) and t.motor_merk <> l.naam;
update motoren t set motor_type = l.naam from mk_type l
  where lower(regexp_replace(t.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g')) and t.motor_type <> l.naam;

update sessies t set motor_merk = l.naam from mk_merk l
  where lower(regexp_replace(t.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g')) and t.motor_merk <> l.naam;
update sessies t set motor_type = l.naam from mk_type l
  where lower(regexp_replace(t.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g')) and t.motor_type <> l.naam;

update revisies t set motor_merk = l.naam from mk_merk l
  where lower(regexp_replace(t.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g')) and t.motor_merk <> l.naam;
update revisies t set motor_type = l.naam from mk_type l
  where lower(regexp_replace(t.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(l.naam, '[[:space:]_.-]', '', 'g')) and t.motor_type <> l.naam;

commit;

-- Resultaat: wat is er aangepast (leeg = alles stond al goed)
select tabel, kolom, oud, nieuw, aantal from mk_wijzigingen order by tabel, kolom, nieuw, oud;
