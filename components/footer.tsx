import Link from 'next/link';

export function Footer() {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex justify-between items-end px-3 pb-3 text-[11px] text-muted-foreground">
        <div className="pointer-events-auto">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <span className="mx-2">·</span>
          <span>Data: USGS, EMSC</span>
        </div>
      </div>
    </footer>
  );
}
