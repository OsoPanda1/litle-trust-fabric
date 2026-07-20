import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/standard/rfcs")({
  component: () => (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">
            LITLE
          </Link>
          <Link
            to="/standard"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            ← Standards Council
          </Link>
        </div>
      </header>
      <Outlet />
    </main>
  ),
});
