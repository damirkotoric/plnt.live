import { usgsFeedSchema, UsgsFeature, EventRow } from './types';

const FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

export async function fetchUsgsDay(): Promise<EventRow[]> {
  const res = await fetch(FEED_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`USGS fetch failed: ${res.status}`);
  const json = await res.json();
  const parsed = usgsFeedSchema.parse(json);
  return parsed.features
    .filter((f) => f.properties.type === 'earthquake' && f.properties.mag !== null)
    .map(toEventRow);
}

function toEventRow(f: UsgsFeature): EventRow {
  const [lng, lat, depth] = f.geometry.coordinates;
  return {
    id: f.id,
    time: new Date(f.properties.time).toISOString(),
    magnitude: f.properties.mag as number,
    depth_km: depth ?? null,
    latitude: lat,
    longitude: lng,
    place: f.properties.place,
    type: f.properties.type,
    status: f.properties.status,
    tsunami: f.properties.tsunami === 1,
    felt_count: f.properties.felt,
    raw: f,
  };
}
