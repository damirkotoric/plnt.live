import { getSupabasePublic } from '@/lib/supabase/public';
import type { MapEvent } from '@/lib/usgs/types';

export async function fetchRecentEvents(hours = 24, minMag = 2.5): Promise<MapEvent[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from('events')
    .select('id, time, magnitude, depth_km, latitude, longitude, place')
    .gte('time', since)
    .gte('magnitude', minMag)
    .order('time', { ascending: false });

  if (error) throw new Error(`fetchRecentEvents: ${error.message}`);
  return data ?? [];
}
