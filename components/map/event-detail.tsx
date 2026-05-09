'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { timeAgo } from '@/lib/time/relative';
import { eventPath } from '@/lib/events/slug';
import type { MapEvent } from '@/lib/usgs/types';

type Props = {
  event: MapEvent | null;
  onClose: () => void;
};

export function EventDetail({ event, onClose }: Props) {
  return (
    <Sheet open={!!event} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {event && (
          <>
            <SheetHeader>
              <SheetTitle className="text-3xl font-semibold">
                M{event.magnitude.toFixed(1)}
              </SheetTitle>
              <SheetDescription>{event.place ?? 'Unknown location'}</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <Stat label="Time" value={`${timeAgo(event.time)} · ${new Date(event.time).toUTCString()}`} />
              <Stat label="Depth" value={event.depth_km !== null ? `${event.depth_km.toFixed(1)} km` : 'Unknown'} />
              <Stat label="Coordinates" value={`${event.latitude.toFixed(3)}, ${event.longitude.toFixed(3)}`} />
              <a
                href={`https://earthquake.usgs.gov/earthquakes/eventpage/${event.id}`}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                View on USGS →
              </a>
              <Link
                href={eventPath(event)}
                className="block text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Permanent link →
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  );
}
