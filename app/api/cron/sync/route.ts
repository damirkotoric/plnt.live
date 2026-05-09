import { NextResponse } from 'next/server';
import { fetchUsgsDay } from '@/lib/usgs/feed';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const start = Date.now();

  try {
    const rows = await fetchUsgsDay();
    const supabase = getSupabaseAdmin();

    let upserted = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const { error } = await supabase.rpc('upsert_event', { payload: row });
      if (error) {
        errors.push(`${row.id}: ${error.message}`);
      } else {
        upserted++;
      }
    }

    return NextResponse.json({
      ok: true,
      fetched: rows.length,
      upserted,
      errorCount: errors.length,
      errors: errors.slice(0, 5),
      durationMs: Date.now() - start,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json(
      { ok: false, error: message, durationMs: Date.now() - start },
      { status: 500 }
    );
  }
}
