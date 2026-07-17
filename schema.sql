-- Paleiskite šitą Supabase projekto "SQL Editor" skiltyje (Supabase.com -> jūsų projektas -> SQL Editor -> New query)

create table if not exists clients (
  id bigint generated always as identity primary key,
  email text not null,
  name text,
  invoice_number text not null default '26000-01',
  due_date date,
  paid boolean not null default false,
  needs_reminder boolean not null default false,
  last_reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Leidžiam viešą (anon) prieigą per API raktą - saugumą užtikrina slaptažodis pačiame website'e,
-- o ne Supabase Row Level Security, nes tai vidinis vieno vartotojo įrankis.
alter table clients enable row level security;

create policy "allow all with anon key"
on clients
for all
using (true)
with check (true);
