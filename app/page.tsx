import { MapCanvas } from '@/components/map/map-canvas';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapCanvas />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </main>
  );
}
