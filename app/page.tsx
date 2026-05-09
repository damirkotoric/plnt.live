import { getSupabasePublic } from '@/lib/supabase/public';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getSupabasePublic();

  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  const { data: latest } = await supabase
    .from('events')
    .select('time, magnitude, place')
    .order('time', { ascending: false })
    .limit(1)
    .single();

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>plnt.live</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-semibold">
            {count?.toLocaleString() ?? 0} earthquakes tracked
          </p>
          {latest && (
            <p className="text-sm text-muted-foreground">
              Latest: M{latest.magnitude} — {latest.place}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
