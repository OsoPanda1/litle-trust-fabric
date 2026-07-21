import { createFileRoute, Link } from "@tanstack/react-router";
import { RFCS } from "@/content/rfcs";

export const Route = createFileRoute("/standard/")({
  head: () => ({
    meta: [
      { title: "The LITLE Standard — Preserving Knowledge, Verifying Legacy" },
      {
        name: "description",
        content:
          "The LITLE Standard is the open specification suite for preserving academic knowledge, verifying its lineage, and outliving the platforms that host it.",
      },
      { property: "og:title", content: "The LITLE Standard" },
      {
        property: "og:description",
        content:
          "Open specifications for durable identity, evidence chains and independent preservation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/standard" },
    ],
    links: [{ rel: "canonical", href: "/standard" }],
  }),
  component: StandardIndex,
});

function StandardIndex() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">
            LITLE
          </Link>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Standards Council
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
          The Standard
        </div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-8">
          The Standard for Preserving Knowledge.
          <br />
          <span className="gilt-text italic">Verifying Legacy.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
          LITLE is not a single product. It is an open standard for durable
          identifiers, evidence chains and independent preservation of academic
          work. Every material decision lives in a public RFC.
        </p>
        <div className="flex gap-3">
          <Link
            to="/standard/rfcs"
            className="rounded-sm bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium"
          >
            Browse RFCs
          </Link>
          <Link
            to="/standard/archive"
            className="rounded-sm border border-gilt/60 gilt-text px-5 py-2.5 text-sm"
          >
            Independent Archive
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border">
          <Pillar
            id="RFC-0001"
            title="LITLE-ID"
            body="A durable, self-describing identifier that outlives any single cryptographic profile."
          />
          <Pillar
            id="RFC-0008"
            title="Evidence Chain"
            body="Standardized provenance for sources, prompts, model seeds and revisions."
          />
          <Pillar
            id="RFC-0009"
            title="Independent Archive"
            body="Redundant off-platform preservation, refreshed on a public cadence."
          />
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-3">
          <Link
            to="/standard/trust-fabric"
            className="crystal-glass p-6 hover:bg-accent/20 transition block"
          >
            <div className="font-mono text-xs text-muted-foreground mb-2">RFC-0012 · Interop</div>
            <div className="font-serif text-xl mb-1">Trust Fabric →</div>
            <p className="text-sm text-muted-foreground">Kernel + adapters. One identity, many backends.</p>
          </Link>
          <Link
            to="/standard/observability"
            className="crystal-glass p-6 hover:bg-accent/20 transition block"
          >
            <div className="font-mono text-xs text-muted-foreground mb-2">RFC-0013 · Observability</div>
            <div className="font-serif text-xl mb-1">Observability Fabric →</div>
            <p className="text-sm text-muted-foreground">Grafana as the official viewer. LITLE-ID first.</p>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Latest RFCs
        </div>
        <ul className="divide-y divide-border/60 border border-border">
          {RFCS.map((r) => (
            <li key={r.id}>
              <Link
                to="/standard/rfcs/$slug"
                params={{ slug: r.slug }}
                className="grid grid-cols-[7rem_1fr_9rem_6rem] gap-4 items-center p-5 hover:bg-accent/20 transition"
              >
                <span className="font-mono text-xs text-gilt">{r.id}</span>
                <span className="font-serif text-lg">{r.title}</span>
                <span className="text-xs text-muted-foreground">{r.category}</span>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground text-right">
                  {r.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Pillar({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <div className="bg-background p-8">
      <div className="font-mono text-xs text-gilt mb-3">{id}</div>
      <h3 className="font-serif text-2xl mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
