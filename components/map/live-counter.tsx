'use client';

import type { MapEvent } from '@/lib/usgs/types';

type Props = { events: MapEvent[] };

export function LiveCounter({ events }: Props) {
  const count = events.length;
  return (
    <div className="rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-sm font-medium border border-border">
      <span className="inline-block size-2 rounded-full bg-[hsl(var(--quake-fresh))] mr-2 animate-pulse" />
      {count.toLocaleString()} quakes · 24h
    </div>
  );
}
