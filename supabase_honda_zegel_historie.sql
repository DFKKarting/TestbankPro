-- Voeg zegel_historie kolom toe aan honda_motoren
-- zegel_historie: JSONB array van {zegel, datum, reden}
alter table honda_motoren
  add column if not exists zegel_historie jsonb default '[]'::jsonb;

-- Voeg klasse kolom toe (Junior/Senior voor GX200)
alter table honda_motoren
  add column if not exists klasse text default '';
