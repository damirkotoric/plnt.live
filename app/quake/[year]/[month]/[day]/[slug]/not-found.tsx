import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-semibold">Earthquake not found</h1>
        <p className="text-sm text-muted-foreground">
          This event isn&apos;t in our records. It may have been retracted by USGS, or the link is wrong.
        </p>
        <Link href="/" className="block text-sm underline-offset-4 hover:underline">
          ← Back to map
        </Link>
      </div>
    </main>
  );
}
