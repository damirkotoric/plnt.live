import type { MapEvent } from '@/lib/usgs/types';
import type { FeatureCollection, Point } from 'geojson';

const PULSE_COUNT = 5;
const PULSE_MAX_AGE_MIN = 60;

export function getPulseEvents(events: MapEvent[]): MapEvent[] {
  const now = Date.now();
  return events
    .filter((e) => (now - new Date(e.time).getTime()) / 60000 < PULSE_MAX_AGE_MIN)
    .slice(0, PULSE_COUNT);
}

export function pulsesToGeoJSON(
  events: MapEvent[],
  t: number
): FeatureCollection<Point, { baseRadius: number; pulseScale: number; pulseOpacity: number }> {
  const scale = 1 + t * 2.5;
  const opacity = (1 - t) * 0.4;

  return {
    type: 'FeatureCollection',
    features: events.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.longitude, e.latitude] },
      properties: {
        baseRadius: Math.max(3, e.magnitude * 2),
        pulseScale: scale,
        pulseOpacity: opacity,
      },
    })),
  };
}
