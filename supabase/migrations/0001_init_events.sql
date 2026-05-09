create extension if not exists postgis;

create table events (
  id text primary key,
  time timestamptz not null,
  magnitude numeric not null,
  depth_km numeric,
  latitude numeric not null,
  longitude numeric not null,
  place text,
  type text not null default 'earthquake',
  status text,
  tsunami boolean default false,
  felt_count integer,
  geom geography(point, 4326),
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_time_idx on events (time desc);
create index events_magnitude_idx on events (magnitude desc);
create index events_geom_idx on events using gist (geom);
create index events_type_time_idx on events (type, time desc);

alter table events enable row level security;

create policy "events are publicly readable"
  on events for select
  using (true);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();
