'use client';

import { cn } from '@/lib/utils';
import type { MapEvent } from '@/lib/usgs/types';

type Props = { events: MapEvent[]; connected: boolean };

export function LiveCounter({ events, connected }: Props) {
  const count = events.length;
  return (
    <div className="rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-sm font-medium border border-border">
      <span className={cn(
        'inline-block size-2 rounded-full mr-2',
        connected
          ? 'bg-[hsl(var(--quake-fresh))] animate-pulse'
          : 'bg-muted-foreground'
      )} />
      {count.toLocaleString()} quakes · 24h
    </div>
  );
}
