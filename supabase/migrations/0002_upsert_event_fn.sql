create or replace function upsert_event(payload jsonb)
returns void
language plpgsql
as $$
begin
  insert into events (
    id, time, magnitude, depth_km, latitude, longitude,
    place, type, status, tsunami, felt_count, geom, raw
  )
  values (
    payload->>'id',
    (payload->>'time')::timestamptz,
    (payload->>'magnitude')::numeric,
    nullif(payload->>'depth_km','')::numeric,
    (payload->>'latitude')::numeric,
    (payload->>'longitude')::numeric,
    payload->>'place',
    coalesce(payload->>'type','earthquake'),
    payload->>'status',
    coalesce((payload->>'tsunami')::boolean, false),
    nullif(payload->>'felt_count','')::integer,
    st_setsrid(st_makepoint(
      (payload->>'longitude')::numeric,
      (payload->>'latitude')::numeric
    ), 4326)::geography,
    payload->'raw'
  )
  on conflict (id) do update set
    time = excluded.time,
    magnitude = excluded.magnitude,
    depth_km = excluded.depth_km,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    place = excluded.place,
    type = excluded.type,
    status = excluded.status,
    tsunami = excluded.tsunami,
    felt_count = excluded.felt_count,
    geom = excluded.geom,
    raw = excluded.raw;
end;
$$;
