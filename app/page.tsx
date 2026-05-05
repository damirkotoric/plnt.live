import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold">plnt.live</h1>
        <p className="text-muted-foreground">Real-time earthquake map</p>
        <ThemeToggle />
      </div>
    </main>
  );
}
