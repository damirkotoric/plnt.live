import { MapCanvas } from '@/components/map/map-canvas';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { fetchRecentEvents } from '@/lib/events/fetch';

export const revalidate = 60;

export default async function HomePage() {
  const initialEvents = await fetchRecentEvents();

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapCanvas initialEvents={initialEvents} />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </main>
  );
}
