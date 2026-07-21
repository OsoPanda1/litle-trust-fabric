import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/standard/observability")({
  head: () => ({
    meta: [
      { title: "Observability Fabric — LITLE-ID First" },
      {
        name: "description",
        content:
          "How Grafana, Kubernetes operators and multi-DB dashboards are unified under LITLE-ID as the primary axis of every panel.",
      },
      { property: "og:title", content: "Observability Fabric — LITLE" },
      {
        property: "og:description",
        content:
          "Grafana as the official viewer of the LITLE Trust Fabric. Every institutional dashboard exposes LITLE-ID first.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/standard/observability" },
    ],
    links: [{ rel: "canonical", href: "/standard/observability" }],
  }),
  component: ObservabilityPage,
});

function ObservabilityPage() {
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

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
          RFC-0013 · Observability
        </div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-6">
          Observability Fabric
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Grafana is the official viewer of the LITLE Trust Fabric, not its
          source of truth. Every institutional dashboard exposes LITLE-ID as
          its first column or first panel.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Reference data sources
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border">
          {DATASOURCES.map((d) => (
            <div key={d.name} className="bg-background p-6">
              <div className="font-mono text-xs text-muted-foreground mb-2">{d.type}</div>
              <div className="font-serif text-lg mb-1">{d.name}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16 space-y-10">
        <Block heading="1. Dashboard rule">
          Every institutional dashboard MUST expose <code className="font-mono text-sm">LITLE-ID</code>
          {" "}as its first column or first panel. Any metric, log or alert
          without a LITLE-ID reference is informational only — it cannot be
          cited as evidence.
        </Block>
        <Block heading="2. Deployment (reference)">
          <span className="font-mono text-sm">grafana-operator</span> is
          installed via Helm in the <span className="font-mono text-sm">observability</span> namespace.
          Data sources and dashboards are declared as CRDs
          (<span className="font-mono text-sm">GrafanaDatasource</span>,
          {" "}<span className="font-mono text-sm">GrafanaDashboard</span>) so the fabric is
          reproducible from Git. Kustomize overlays separate dev / prod without
          divergence.
        </Block>
        <Block heading="3. Governance">
          FED-3 (Infrastructure & Mesh) owns the Grafana operators, PMM,
          Zabbix and CloudWatch integrations. No dashboard reaches Stable
          without a 5-of-7 quorum under RFC-0010.
        </Block>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <pre className="crystal-glass p-6 text-xs font-mono overflow-x-auto leading-relaxed">
{`# Reference: LITLE Core dashboard (excerpt)
SELECT
  litle_id,           -- first column, always
  work_type,
  status,
  federation_owner,
  created_at
FROM public.evidence_records
ORDER BY created_at DESC
LIMIT 200;`}
        </pre>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            to="/standard/rfcs/$slug"
            params={{ slug: "0013-observability-fabric" }}
            className="rounded-sm bg-primary text-primary-foreground px-4 py-2"
          >
            Read RFC-0013
          </Link>
          <Link
            to="/standard/trust-fabric"
            className="rounded-sm border border-border px-4 py-2 hover:bg-accent/30"
          >
            ← Trust Fabric
          </Link>
        </div>
      </section>
    </main>
  );
}

const DATASOURCES = [
  { name: "LITLE-Core Postgres", type: "postgres", body: "Authoritative store for evidence_records and evidence_nodes." },
  { name: "Legacy MySQL", type: "mysql", body: "Read-only bridge for pre-Fabric systems undergoing migration." },
  { name: "Elasticsearch", type: "elasticsearch", body: "Full-text search over logs and long-form evidence payloads." },
  { name: "AWS CloudWatch", type: "cloudwatch", body: "Infrastructure metrics for workloads anchored to LITLE-IDs." },
  { name: "Percona PMM", type: "prometheus", body: "Query analytics for MySQL / Postgres adapters." },
  { name: "Zabbix", type: "zabbix", body: "Legacy alerting bridged into the LITLE-ID axis." },
] as const;

function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl mb-3">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}