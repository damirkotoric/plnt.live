import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'plnt.live is a living atlas of planet Earth. Real-time earthquake activity, beautifully rendered. Built as the first chapter of a larger atlas of planetary systems.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-base sm:text-sm text-muted-foreground hover:text-foreground">← Back to map</Link>

      <article className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
        <h1>About plnt.live</h1>

        <p className="lead">
          A living atlas of planet Earth. The first chapter is earthquakes — every M2.5+ event globally, in near real-time, beautifully rendered.
        </p>

        <h2>Why this exists</h2>
        <p>
          Most public data about our planet is locked inside ugly government dashboards or technical APIs. plnt.live takes that data and presents it the way it deserves to be seen — as a coherent picture of a single, living world.
        </p>

        <h2>How it works</h2>
        <p>
          Earthquake data comes from two sources: the United States Geological Survey (USGS), which maintains the most complete global seismic record, and the European-Mediterranean Seismological Centre (EMSC), which pushes events via WebSocket within seconds of detection.
        </p>
        <p>
          The map is built on MapLibre GL with tiles from OpenFreeMap. Tectonic plate boundaries follow the PB2002 model. Active faults are sourced from the GEM Global Active Faults Database.
        </p>

        <h2>What&apos;s next</h2>
        <p>
          Earthquakes are the opening act. Future layers in development:
        </p>
        <ul>
          <li>Wildfires and burn perimeters</li>
          <li>Storms, cyclones, and extreme weather</li>
          <li>Volcanic activity</li>
          <li>Shipping and maritime traffic</li>
          <li>More — the atlas grows</li>
        </ul>

        <h2>Data sources</h2>
        <ul>
          <li><a href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS Earthquake Hazards Program</a></li>
          <li><a href="https://www.seismicportal.eu" target="_blank" rel="noreferrer">EMSC Seismic Portal</a></li>
          <li><a href="https://github.com/fraxen/tectonicplates" target="_blank" rel="noreferrer">PB2002 Tectonic Plates</a></li>
          <li><a href="https://github.com/GEMScienceTools/gem-global-active-faults" target="_blank" rel="noreferrer">GEM Global Active Faults</a></li>
        </ul>

        <h2>Contact</h2>
        <p>
          Built by <a href="https://damirkotoric.com" target="_blank" rel="noreferrer">Damir Kotorić</a>. Feedback, corrections, ideas welcome.
        </p>
      </article>
    </main>
  );
}
