import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/standard/archive")({
  head: () => ({
    meta: [
      { title: "Independent Archive — The LITLE Standard" },
      {
        name: "description",
        content:
          "LITLE's commitment to preserving academic works beyond the lifetime of any single platform, with redundant off-site copies and quarterly manifests.",
      },
      { property: "og:title", content: "Independent Archive — LITLE" },
      { property: "og:url", content: "/standard/archive" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/standard/archive" }],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">LITLE</Link>
          <Link
            to="/standard"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            ← Standards Council
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          RFC-0009 · Preservation
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
          The Independent Archive.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10">
          A LITLE work must remain citable even if the LITLE organization no
          longer exists. The Independent Archive is our commitment to that
          durability — encoded in the standard, not in a marketing page.
        </p>

        <ol className="space-y-6 mb-12">
          <Guarantee
            n="I"
            t="Redundant copies"
            b="At least three independent copies across two jurisdictions."
          />
          <Guarantee
            n="II"
            t="Write-once media"
            b="One copy on write-once storage, refreshed on a documented 5-year cadence."
          />
          <Guarantee
            n="III"
            t="Public manifests"
            b="A signed list of preserved LITLE-IDs is published every quarter."
          />
          <Guarantee
            n="IV"
            t="Exit policy"
            b="If LITLE ceases to operate, manifests and bundles remain accessible under a permissive license."
          />
        </ol>

        <Link
          to="/standard/rfcs/$slug"
          params={{ slug: "0009-independent-archive" }}
          className="inline-flex rounded-sm border border-gilt/60 gilt-text px-4 py-2 text-sm"
        >
          Read RFC-0009 →
        </Link>
      </section>
    </main>
  );
}

function Guarantee({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <li className="grid grid-cols-[3rem_1fr] gap-6">
      <span className="font-mono text-xs text-gilt pt-1">{n}</span>
      <div>
        <div className="font-serif text-xl mb-1">{t}</div>
        <div className="text-sm text-muted-foreground">{b}</div>
      </div>
    </li>
  );
}
