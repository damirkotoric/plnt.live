import type { MetadataRoute } from 'next';
import { getSupabasePublic } from '@/lib/supabase/public';
import { eventPath } from '@/lib/events/slug';

export const revalidate = 3600;

const SITE_URL = 'https://plnt.live';
const MAX_URLS = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabasePublic();
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('events')
    .select('id, time, magnitude, place, updated_at')
    .gte('time', since)
    .order('time', { ascending: false })
    .limit(MAX_URLS);

  const events = data ?? [];

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    ...events.map((e) => ({
      url: `${SITE_URL}${eventPath(e)}`,
      lastModified: new Date(e.updated_at ?? e.time),
      changeFrequency: 'weekly' as const,
      priority: e.magnitude >= 5 ? 0.8 : 0.5,
    })),
  ];
}
