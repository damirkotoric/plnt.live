'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something broke</h1>
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load earthquake data. The planet is still spinning, just not on our screen.
        </p>
        <Button onClick={reset} variant="outline">Try again</Button>
      </div>
    </main>
  );
}
