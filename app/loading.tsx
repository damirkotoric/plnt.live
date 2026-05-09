export default function Loading() {
  return (
    <main className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Loading planet…</p>
      </div>
    </main>
  );
}
