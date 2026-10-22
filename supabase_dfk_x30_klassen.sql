-- DFK X30-motoren: type van de motor wordt 'X30', de klasse (Junior/Senior) hoort bij elke sessie.
-- Voer dit uit in Supabase → SQL Editor → New query → plakken → Run
--
-- 1. Sessies van die motoren zonder type krijgen het huidige type van de motor (X30 Junior/Senior),
--    zodat geen enkele test zijn klasse verliest.
-- 2. De DFK-motoren met type X30 Junior of X30 Senior krijgen type 'X30'.
-- Klantmotoren blijven ongewijzigd. Eén enkele opdracht: alles wordt aangepast, of (bij een fout) niets.
-- Het resultaat toont wat er aangepast is (leeg = er was niets aan te passen).

with dfk as (
  select motor_nummer,
         case lower(regexp_replace(motor_type, '[[:space:]_.-]', '', 'g'))
           when 'x30junior' then 'X30 Junior' else 'X30 Senior' end as klasse
  from motoren
  where (klant is null or trim(klant) = '' or lower(trim(klant)) = 'dfk')
    and lower(regexp_replace(motor_type, '[[:space:]_.-]', '', 'g')) in ('x30junior', 'x30senior')
),
se as (
  update sessies s set motor_type = d.klasse
  from dfk d
  where s.motor_nummer = d.motor_nummer and coalesce(trim(s.motor_type), '') = ''
  returning 'sessies (klasse ingevuld)'::text as wat, s.motor_nummer, d.klasse as nieuw
),
mo as (
  update motoren m set motor_type = 'X30'
  from dfk d
  where m.motor_nummer = d.motor_nummer
  returning 'motoren (type → X30)'::text as wat, m.motor_nummer, d.klasse as was
)
select wat, motor_nummer, nieuw as klasse, count(*) as aantal from se group by wat, motor_nummer, nieuw
union all
select wat, motor_nummer, 'was ' || was, 1 from mo
order by wat, motor_nummer;
