-- Zet alle bestaande spellingen van motormerk en -type recht naar de vaste lijst.
-- Voer dit uit in Supabase → SQL Editor → New query → plakken → Run
--
-- Enkel hoofdletters, spaties, streepjes, underscores en punten worden gelijkgetrokken:
--   'iame' → 'IAME', 'x30 senior' / 'X30-Senior' / 'x30senior' → 'X30 Senior'
-- Waarden die niet in de lijst staan blijven ongewijzigd.
-- Het is één enkele opdracht: alles wordt aangepast, of (bij een fout) niets.
-- Het resultaat toont exact wat er aangepast is (leeg = alles stond al goed).
--
-- Houd deze lijst gelijk met MOTOR_TYPES in motortypes.js.

with merken(naam) as (values
  ('Honda'), ('IAME'), ('TM')
),
types(naam) as (values
  ('Cadet'), ('Junior'), ('Senior'),                                              -- Honda
  ('X30 Mini'), ('X30'), ('X30 Junior'), ('X30 Senior'), ('Super Shifter'), ('S125'), ('KA100'), -- IAME
  ('KZ')                                                                          -- TM
),
mo as (
  update motoren t set motor_merk = x.nieuw_merk, motor_type = x.nieuw_type
  from (
    select r.ctid as rid, r.motor_merk as oud_merk, r.motor_type as oud_type,
           coalesce(lm.naam, r.motor_merk) as nieuw_merk, coalesce(lt.naam, r.motor_type) as nieuw_type
    from motoren r
    left join merken lm on lower(regexp_replace(r.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(lm.naam, '[[:space:]_.-]', '', 'g'))
    left join types  lt on lower(regexp_replace(r.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(lt.naam, '[[:space:]_.-]', '', 'g'))
  ) x
  where t.ctid = x.rid and (x.nieuw_merk is distinct from x.oud_merk or x.nieuw_type is distinct from x.oud_type)
  returning 'motoren'::text as tabel, x.oud_merk, x.nieuw_merk, x.oud_type, x.nieuw_type
),
se as (
  update sessies t set motor_merk = x.nieuw_merk, motor_type = x.nieuw_type
  from (
    select r.ctid as rid, r.motor_merk as oud_merk, r.motor_type as oud_type,
           coalesce(lm.naam, r.motor_merk) as nieuw_merk, coalesce(lt.naam, r.motor_type) as nieuw_type
    from sessies r
    left join merken lm on lower(regexp_replace(r.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(lm.naam, '[[:space:]_.-]', '', 'g'))
    left join types  lt on lower(regexp_replace(r.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(lt.naam, '[[:space:]_.-]', '', 'g'))
  ) x
  where t.ctid = x.rid and (x.nieuw_merk is distinct from x.oud_merk or x.nieuw_type is distinct from x.oud_type)
  returning 'sessies'::text as tabel, x.oud_merk, x.nieuw_merk, x.oud_type, x.nieuw_type
),
re as (
  update revisies t set motor_merk = x.nieuw_merk, motor_type = x.nieuw_type
  from (
    select r.ctid as rid, r.motor_merk as oud_merk, r.motor_type as oud_type,
           coalesce(lm.naam, r.motor_merk) as nieuw_merk, coalesce(lt.naam, r.motor_type) as nieuw_type
    from revisies r
    left join merken lm on lower(regexp_replace(r.motor_merk, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(lm.naam, '[[:space:]_.-]', '', 'g'))
    left join types  lt on lower(regexp_replace(r.motor_type, '[[:space:]_.-]', '', 'g')) = lower(regexp_replace(lt.naam, '[[:space:]_.-]', '', 'g'))
  ) x
  where t.ctid = x.rid and (x.nieuw_merk is distinct from x.oud_merk or x.nieuw_type is distinct from x.oud_type)
  returning 'revisies'::text as tabel, x.oud_merk, x.nieuw_merk, x.oud_type, x.nieuw_type
)
select tabel, oud_merk, nieuw_merk, oud_type, nieuw_type, count(*) as aantal
from (select * from mo union all select * from se union all select * from re) w
group by tabel, oud_merk, nieuw_merk, oud_type, nieuw_type
order by tabel, nieuw_merk, nieuw_type;
