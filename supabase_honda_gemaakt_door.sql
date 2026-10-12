-- Voeg gemaakt_door kolom toe aan honda_motoren
alter table honda_motoren
  add column if not exists gemaakt_door text default '';
