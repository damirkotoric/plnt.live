import type { MapEvent } from '@/lib/usgs/types';
import type { FeatureCollection, Point } from 'geojson';

export function eventsToGeoJSON(
  events: MapEvent[]
): FeatureCollection<Point, MapEvent & { ageMinutes: number }> {
  const now = Date.now();
  return {
    type: 'FeatureCollection',
    features: events.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.longitude, e.latitude] },
      properties: {
        ...e,
        ageMinutes: Math.floor((now - new Date(e.time).getTime()) / 60000),
      },
    })),
  };
}
