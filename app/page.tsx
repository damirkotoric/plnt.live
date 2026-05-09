import { headers } from 'next/headers';
import { MapCanvas } from '@/components/map/map-canvas';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { fetchRecentEvents } from '@/lib/events/fetch';
import { parseFilters } from '@/lib/filters';

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ hours?: string; mag?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const initialEvents = await fetchRecentEvents(filters.hours, filters.minMag);

  const h = await headers();
  const lat = parseFloat(h.get('x-vercel-ip-latitude') ?? '');
  const lng = parseFloat(h.get('x-vercel-ip-longitude') ?? '');
  const initialCenter: [number, number] = !isNaN(lat) && !isNaN(lng)
    ? [lng, lat]
    : [0, 20];

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapCanvas initialEvents={initialEvents} initialFilters={filters} initialCenter={initialCenter} />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </main>
  );
}
