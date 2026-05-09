import type { MapEvent } from '@/lib/usgs/types';

export function eventSlug(event: Pick<MapEvent, 'magnitude' | 'place'>): string {
  const mag = event.magnitude.toFixed(1).replace('.', '-');
  const place = (event.place ?? 'unknown')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `m${mag}-${place}`;
}

export function eventPath(event: Pick<MapEvent, 'id' | 'time' | 'magnitude' | 'place'>): string {
  const d = new Date(event.time);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `/quake/${yyyy}/${mm}/${dd}/${eventSlug(event)}-${event.id}`;
}

export function parseEventParam(param: string): { id: string; slug: string } | null {
  const lastDash = param.lastIndexOf('-');
  if (lastDash === -1) return null;
  const slug = param.slice(0, lastDash);
  const id = param.slice(lastDash + 1);
  if (!id) return null;
  return { id, slug };
}
