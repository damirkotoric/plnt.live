import mbgl from '@maplibre/maplibre-gl-native';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = 50;
const WIDTH = 1200;
const HEIGHT = 630;
const RATIO = 2;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function fetchPending() {
  const { data, error } = await supabase
    .from('events')
    .select('id, latitude, longitude, magnitude, time, place')
    .is('og_image_url', null)
    .order('time', { ascending: false })
    .limit(BATCH_SIZE);
  if (error) throw error;
  return data ?? [];
}

async function fetchTile(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`tile fetch ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function makeMap() {
  return new mbgl.Map({
    request: (req: { url: string }, callback: (err: Error | null, res?: { data: Buffer }) => void) => {
      fetchTile(req.url)
        .then((data) => callback(null, { data }))
        .catch((err) => callback(err));
    },
    ratio: RATIO,
  });
}

async function renderEvent(event: {
  id: string;
  latitude: number;
  longitude: number;
  magnitude: number;
}): Promise<Buffer> {
  const stylePath = join(process.cwd(), 'lib/map/og-style.json');
  const style = JSON.parse(readFileSync(stylePath, 'utf-8'));

  const map = makeMap();
  map.load(style);

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    map.render(
      {
        zoom: 4,
        center: [event.longitude, event.latitude],
        width: WIDTH,
        height: HEIGHT,
      },
      (err: Error | null, buf: Uint8Array) => {
        if (err) return reject(err);
        resolve(Buffer.from(buf));
      }
    );
  });

  map.release();

  const w = WIDTH * RATIO;
  const h = HEIGHT * RATIO;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.max(20, event.magnitude * 12);

  const overlay = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${r * 1.6}" fill="hsl(10 90% 55% / 0.25)" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(10 90% 55%)" stroke="white" stroke-width="4" />
      <rect x="60" y="${h - 180}" width="320" height="120" rx="16" fill="rgba(0,0,0,0.7)" />
      <text x="90" y="${h - 110}" font-family="system-ui, sans-serif" font-size="72" font-weight="600" fill="white">M${event.magnitude.toFixed(1)}</text>
      <text x="90" y="${h - 70}" font-family="system-ui, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)">plnt.live</text>
    </svg>
  `);

  return sharp(buffer, { raw: { width: w, height: h, channels: 4 } })
    .composite([{ input: overlay }])
    .png()
    .toBuffer();
}

async function uploadAndUpdate(eventId: string, png: Buffer) {
  const path = `${eventId}.png`;
  const { error: uploadErr } = await supabase.storage
    .from('og-images')
    .upload(path, png, { contentType: 'image/png', upsert: true });
  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage.from('og-images').getPublicUrl(path);

  const { error: updateErr } = await supabase
    .from('events')
    .update({ og_image_url: urlData.publicUrl })
    .eq('id', eventId);
  if (updateErr) throw updateErr;
}

async function main() {
  const events = await fetchPending();
  console.log(`Rendering ${events.length} OG images`);

  for (const event of events) {
    try {
      const png = await renderEvent(event);
      await uploadAndUpdate(event.id, png);
      console.log(`✓ ${event.id}`);
    } catch (err) {
      console.error(`✗ ${event.id}:`, err instanceof Error ? err.message : err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
