import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/standard/trust-fabric")({
  head: () => ({
    meta: [
      { title: "LITLE Trust Fabric — Kernel + Adapters" },
      {
        name: "description",
        content:
          "The LITLE Trust Fabric decouples identity, evidence and governance from any single storage or observability backend.",
      },
      { property: "og:title", content: "LITLE Trust Fabric" },
      {
        property: "og:description",
        content:
          "One kernel: LITLE-ID + Evidence DAG + Federated Governance. Many adapters: Postgres, MySQL, Elasticsearch, S3, IPFS, CloudWatch.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/standard/trust-fabric" },
    ],
    links: [{ rel: "canonical", href: "/standard/trust-fabric" }],
  }),
  component: TrustFabricPage,
});

function TrustFabricPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">LITLE</Link>
          <Link
            to="/standard"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            ← Standards Council
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
          RFC-0012 · Interop
        </div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-8">
          The Trust Fabric
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          LITLE is a kernel plus a set of adapters. The kernel defines what a
          preserved work <em>is</em>. The adapters decide only where its bytes
          happen to live today.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border">
          <Cell
            head="Kernel"
            title="Identity, Evidence, Governance"
            body="LITLE-ID (RFC-0001), Evidence DAG (RFC-0008) and the 7-Federation model (RFC-0010) are the only normative pieces."
          />
          <Cell
            head="Adapters"
            title="Storage is swappable"
            body="PostgreSQL, MySQL, Elasticsearch, S3, MinIO and IPFS are wired through typed adapters. No vendor semantics leak into evidence."
          />
          <Cell
            head="Observability"
            title="Grafana as viewer"
            body="Grafana, PMM, Zabbix and CloudWatch visualise the fabric, but the source of truth remains the LITLE-ID and its DAG."
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-10">
        <Block heading="1. Why decouple">
          Cryptographic profiles age. Cloud providers change terms. Databases
          get migrated. A preserved work must survive all of these events
          without losing its identity or its lineage.
        </Block>
        <Block heading="2. Canonicalization">
          Every evidence payload is canonicalized per RFC 8785 (JCS) before
          hashing. Merkle-DAG nodes accept multiple parents to model
          corrections, retractions and merges without rewriting history.
        </Block>
        <Block heading="3. Cryptographic erasure">
          Personal data can be tombstoned by rotating a per-node key. The DAG
          topology and root hash remain valid; the payload simply becomes
          unreadable. Right-to-be-forgotten does not break provenance.
        </Block>
        <Block heading="4. Non-goals">
          The Fabric does not mandate a database engine, a cloud, a container
          runtime or a specific PQC suite. It mandates the contract: an ID
          that outlives its anchor, and a chain that outlives its host.
        </Block>

        <div className="pt-4 flex flex-wrap gap-3 text-sm">
          <Link
            to="/standard/rfcs/$slug"
            params={{ slug: "0012-trust-fabric" }}
            className="rounded-sm bg-primary text-primary-foreground px-4 py-2"
          >
            Read RFC-0012
          </Link>
          <Link
            to="/standard/observability"
            className="rounded-sm border border-border px-4 py-2 hover:bg-accent/30"
          >
            Observability Fabric →
          </Link>
        </div>
      </section>
    </main>
  );
}

function Cell({ head, title, body }: { head: string; title: string; body: string }) {
  return (
    <div className="bg-background p-8">
      <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
        {head}
      </div>
      <h3 className="font-serif text-2xl mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl mb-3">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}