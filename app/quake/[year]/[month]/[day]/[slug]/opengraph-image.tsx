import { ImageResponse } from 'next/og';
import { fetchEventById } from '@/lib/events/fetch';
import { parseEventParam } from '@/lib/events/slug';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default async function OgImage({
  params,
}: {
  params: Promise<{ year: string; month: string; day: string; slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseEventParam(slug);
  if (!parsed) return new Response('Not found', { status: 404 });

  const event = await fetchEventById(parsed.id);
  if (!event) return new Response('Not found', { status: 404 });

  const date = new Date(event.time).toUTCString();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${Math.max(60, event.magnitude * 24)}px`,
            height: `${Math.max(60, event.magnitude * 24)}px`,
            borderRadius: '50%',
            background: 'hsl(10 90% 55% / 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: `${Math.max(30, event.magnitude * 12)}px`,
              height: `${Math.max(30, event.magnitude * 12)}px`,
              borderRadius: '50%',
              background: 'hsl(10 90% 55%)',
              border: '3px solid rgba(255,255,255,0.5)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '96px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1,
            }}
          >
            M{event.magnitude.toFixed(1)}
          </div>
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.3,
            }}
          >
            {event.place ?? 'Unknown location'}
          </div>
          <div
            style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '4px',
            }}
          >
            {date} · Depth: {event.depth_km?.toFixed(1) ?? '?'} km
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '60px',
            fontSize: '24px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          plnt.live
        </div>
      </div>
    ),
    { ...size }
  );
}
