import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchEventById } from '@/lib/events/fetch';
import { eventPath, parseEventParam, eventSlug } from '@/lib/events/slug';
import { timeAgo } from '@/lib/time/relative';

type Params = Promise<{ year: string; month: string; day: string; slug: string }>;

async function loadEvent(params: Awaited<Params>) {
  const parsed = parseEventParam(params.slug);
  if (!parsed) return null;
  const event = await fetchEventById(parsed.id);
  if (!event) return null;

  // Verify date in URL matches event
  const d = new Date(event.time);
  const yyyy = String(d.getUTCFullYear());
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  if (params.year !== yyyy || params.month !== mm || params.day !== dd) {
    return { event, redirectTo: eventPath(event) };
  }

  // Verify slug matches; redirect to canonical if not
  const expectedSlug = eventSlug(event);
  if (parsed.slug !== expectedSlug) {
    return { event, redirectTo: eventPath(event) };
  }

  return { event, redirectTo: null };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const result = await loadEvent(await params);
  if (!result) return { title: 'Earthquake not found' };
  const { event } = result;
  const date = new Date(event.time).toUTCString();
  const title = `M${event.magnitude.toFixed(1)} Earthquake — ${event.place ?? 'Unknown'} | plnt.live`;
  const description = `A magnitude ${event.magnitude.toFixed(1)} earthquake struck ${event.place ?? 'an unknown location'} at ${date}. Depth: ${event.depth_km?.toFixed(1) ?? 'unknown'} km.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: eventPath(event) },
  };
}

export const revalidate = 3600;

export default async function QuakePage({ params }: { params: Params }) {
  const result = await loadEvent(await params);
  if (!result) notFound();
  if (result.redirectTo) redirect(result.redirectTo);

  const { event } = result;
  const date = new Date(event.time);

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to map
      </a>
      <header className="mt-8">
        <h1 className="text-5xl font-semibold tracking-tight">
          M{event.magnitude.toFixed(1)} Earthquake
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          {event.place ?? 'Unknown location'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {timeAgo(event.time)} · {date.toUTCString()}
        </p>
      </header>

      <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <Stat label="Magnitude" value={event.magnitude.toFixed(1)} />
        <Stat label="Depth" value={event.depth_km !== null ? `${event.depth_km.toFixed(1)} km` : '—'} />
        <Stat label="Latitude" value={event.latitude.toFixed(3)} />
        <Stat label="Longitude" value={event.longitude.toFixed(3)} />
      </section>

      <section className="mt-12 prose prose-neutral dark:prose-invert">
        <p>
          This event was recorded at {date.toUTCString()} and is currently being monitored.
          Data sourced from USGS and EMSC.
        </p>
        <p>
          <a
            href={`https://earthquake.usgs.gov/earthquakes/eventpage/${event.id}`}
            target="_blank"
            rel="noreferrer"
          >
            View official USGS event page →
          </a>
        </p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-medium mt-1">{value}</div>
    </div>
  );
}
