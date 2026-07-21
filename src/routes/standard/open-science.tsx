import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/standard/open-science")({
  head: () => ({
    meta: [
      { title: "Open Science Curation — LITLE Epistemic Filter" },
      {
        name: "description",
        content:
          "LITLE's epistemological engine filters the best of Open Science: methodological rigor, reproducibility, AI provenance and citation integrity.",
      },
      { property: "og:title", content: "Open Science Curation — LITLE" },
      { property: "og:url", content: "/standard/open-science" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/standard/open-science" }],
  }),
  component: OpenSciencePage,
});

function OpenSciencePage() {
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
        <div className="badge-platinum mb-6 w-fit">RFC-0014 · Curation</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-8">
          Open Science.
          <br />
          <span className="platinum-text">Curated. Verified. Preserved.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Open Science publishes without filters. LITLE adds the missing layer:
          an epistemological engine that scores every work on methodological
          rigor, reproducibility, AI provenance, citation integrity, and
          longevity potential.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/standard/rfcs/$slug"
            params={{ slug: "0014-open-science-curation" }}
            className="btn-institutional text-sm font-medium"
          >
            Read RFC-0014
          </Link>
          <Link
            to="/standard/archive"
            className="rounded-sm border border-gilt/60 gilt-text px-5 py-2.5 text-sm"
          >
            Browse curated works →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-4 gap-px bg-border/60 border border-border">
          <MetricCard value="9" label="Epistemic dimensions" />
          <MetricCard value="0–5" label="Score per dimension" />
          <MetricCard value="PKI" label="Anchor verification" />
          <MetricCard value="∞" label="Preservation horizon" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
          The Epistemic Dimensions
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <DimensionCard
            name="Methodological Rigor"
            weight="20%"
            desc="Is the methodology sound? Are assumptions stated? Are limitations acknowledged?"
            tier="platinum"
          />
          <DimensionCard
            name="Reproducibility"
            weight="18%"
            desc="Can an independent party reproduce the results? Are data and code available?"
            tier="platinum"
          />
          <DimensionCard
            name="Citation Integrity"
            weight="15%"
            desc="Are sources accurately cited? Do citations support rather than contradict claims?"
            tier="gold"
          />
          <DimensionCard
            name="Peer Review Status"
            weight="12%"
            desc="Has the work undergone peer review? Open or closed? What was the outcome?"
            tier="gold"
          />
          <DimensionCard
            name="Data Transparency"
            weight="12%"
            desc="Are raw data, preprocessing steps and analytic code fully disclosed?"
            tier="gold"
          />
          <DimensionCard
            name="AI Provenance"
            weight="10%"
            desc="Are AI model names, version seeds and prompt chains recorded in the Evidence Chain?"
            tier="silver"
          />
          <DimensionCard
            name="Longevity Potential"
            weight="8%"
            desc="Is the work in a durable format? Is it archived independently? Does it have a LITLE-ID?"
            tier="silver"
          />
          <DimensionCard
            name="Epistemological Novelty"
            weight="5%"
            desc="Does the work introduce a new framework, paradigm or cross-domain synthesis?"
            tier="bronze"
          />
          <DimensionCard
            name="Human-Machine Readability"
            weight="0%"
            desc="Is the metadata structured for both human scholars and AI agents to parse?"
            tier="platinum"
          />
        </div>
      </section>

      <section className="border-y border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-14 items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                For AI Agents
              </div>
              <h2 className="font-serif text-4xl leading-tight mb-4">
                Knowledge you can
                <span className="platinum-text"> trust programmatically.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Every LITLE work exposes machine-readable epistemic metadata:
                quality scores per dimension, evidence chain hashes,
                cryptographic anchors, and structured methodology descriptions.
                AI agents can query, filter and ingest only works that meet
                their reliability thresholds.
              </p>
            </div>
            <div className="crystal-glass p-8">
              <pre className="text-xs font-mono leading-relaxed overflow-x-auto">
{`{
  "litleId": "LTL-2026-RQ-8F4A-29D3",
  "epistemic": {
    "methodological_rigor": 5,
    "reproducibility": 4,
    "ai_provenance": 4,
    "compositeScore": 4.2,
    "tier": "platinum"
  },
  "evidenceChain": {
    "rootHash": "8f4a...",
    "nodeCount": 47,
    "integrity": "verified"
  },
  "aiContext": {
    "models": ["claude-4", "gpt-5"],
    "prompts": 12,
    "seeds": ["0x8F4A..."]
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
          How It Works
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            n="01"
            t="Submit"
            b="Authors submit works through the LITLE pipeline. Raw knowledge is ingested, reconstructed and synthesized."
          />
          <StepCard
            n="02"
            t="Verify"
            b="The epistemic engine scores each work across 9 dimensions. AI provenance is extracted from the Evidence Chain."
          />
          <StepCard
            n="03"
            t="Curate"
            b="Works above configurable thresholds enter the curated library. The public can browse, search and filter by quality tier."
          />
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center text-sm text-muted-foreground">
          <p className="font-serif text-lg mb-2">LITLE — The Standard for Preserving Knowledge. Verifying Legacy.</p>
          <p className="text-xs">
            RFC-0014 · Open Science Curation ·{" "}
            <Link to="/standard/rfcs" className="underline">Browse all RFCs</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-background p-6 text-center">
      <div className="platinum-text font-serif text-4xl mb-1">{value}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function DimensionCard({ name, weight, desc, tier }: { name: string; weight: string; desc: string; tier: string }) {
  const colors: Record<string, string> = {
    platinum: "badge-platinum",
    gold: "badge-amber",
    silver: "border border-border/60 text-muted-foreground",
    bronze: "border border-border/40 text-muted-foreground/60",
  };
  return (
    <div className="crystal-panel p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif text-lg">{name}</h3>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${colors[tier] ?? colors.silver}`}>
          {weight}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <div className="crystal-glass p-8">
      <div className="font-mono text-xs text-gilt mb-2">{n}</div>
      <h3 className="font-serif text-2xl mb-3">{t}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{b}</p>
    </div>
  );
}
