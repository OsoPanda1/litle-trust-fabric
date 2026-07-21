import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/standard/certification")({
  head: () => ({
    meta: [
      { title: "Digital Academic Certification — LITLE DAC" },
      {
        name: "description",
        content:
          "LITLE Digital Academic Certificates (DAC) combine CSV secure codes, authorship verification, evidence chains and epistemic scoring into an immutable academic credential.",
      },
      { property: "og:title", content: "Digital Academic Certification — LITLE" },
      { property: "og:url", content: "/standard/certification" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/standard/certification" }],
  }),
  component: CertificationPage,
});

function CertificationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">LITLE</Link>
          <Link to="/standard" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
            ← Standards Council
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="badge-platinum mb-6 w-fit">RFC-0015 · Certification</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-8">
          Digital Academic
          <br />
          <span className="platinum-text">Certification.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Every work preserved in LITLE receives a Digital Academic Certificate (DAC) —
          a cryptographic credential combining CSV secure verification codes, evidence chain
          integrity, authorship analysis, source verification and epistemic scoring into a
          single, verifiable artifact.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to={`/certificate/LTL-2026-RQ-8F4A-29D3`} className="btn-institutional text-sm font-medium">
            View Sample Certificate
          </Link>
          <Link to="/standard/rfcs/$slug" params={{ slug: "0015-digital-academic-certification" }} className="rounded-sm border border-gilt/60 gilt-text px-5 py-2.5 text-sm">
            Read RFC-0015 →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-4 gap-px bg-border/60 border border-border">
          <MethodCard n="1" t="CSV Secure Code" b="32-char code derived from document hash + LITLE-ID. Tamper-evident by design." />
          <MethodCard n="2" t="Evidence Chain" b="Merkle-DAG of sources, prompts, model seeds. Verifiable root hash anchors the certificate." />
          <MethodCard n="3" t="Authorship Analysis" b="Statistical profile of author style: vocabulary, sentence structure, passive voice ratio." />
          <MethodCard n="4" t="Epistemic Score" b="9-dimension quality assessment. Tier: platinum > gold > silver > bronze > unrated." />
        </div>
      </section>

      <section className="border-y border-border/60">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">Verification Methods</div>
          <div className="space-y-10">
            <MethodDetail
              n="CSV (Código Seguro de Verificación)"
              origin="keensoft/csv-generator · Spanish e-Government"
              desc="The CSV standard (Ley 11/2007) generates a 32-character verification code combining a document hash (SHA-256 → Base36), a document identifier and a randomness configuration. LITLE adapts this for academic works: the CSV becomes the human-readable verification code printed on every certificate."
              structure="LTL (3 prefix) + 21 hash chars + 7 ID chars + 1 randomness config = 32 chars"
            />
            <MethodDetail
              n="Authorship GMM (Gaussian Mixture Model)"
              origin="albino-pav/P4 · Speaker Verification"
              desc="Inspired by speaker recognition systems that model vocal characteristics using GMMs, LITLE builds a statistical writing profile for each author — word length distribution, sentence complexity, vocabulary richness, function word frequency and passive voice ratio. New works are scored against the author's historical profile."
              structure="8-feature vector → Gaussian likelihood → Threshold-based verification (FAR optimized)"
            />
            <MethodDetail
              n="Data Source Verification"
              origin="martinszy/verificacion_de_datos · Journalistic Methodology"
              desc="A 5-step verification workflow: (1) Source Identification, (2) Content Integrity (SHA-256 hash), (3) URL Accessibility, (4) Cross-Reference against other sources, (5) Provenance Check. Each step produces a status: passed/failed/skipped."
              structure="5-step pipeline → weighted score (0-100) → verified/partial/unverified"
            />
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">Certificate Lifecycle</div>
        <div className="crystal-glass p-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <LifecycleStep n="1" t="Issue" b="Generated when a work is sealed with LITLE-512B" />
            <LifecycleStep n="2" t="Verify" b="Public endpoint /certificate/<litleId> validates all signatures" />
            <LifecycleStep n="3" t="Renew" b="Certificate renewed every 10 years; CSV root hash is immutable" />
            <LifecycleStep n="4" t="Revoke" b="If content is disputed, certificate enters 'disputed' status" />
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl mb-4">Verify any LITLE work</h2>
          <p className="text-muted-foreground mb-8">
            Every preserved work has a certificate at <code className="font-mono text-xs text-gilt">/certificate/&lt;LITLE-ID&gt;</code>
          </p>
          <Link to="/discovery" className="btn-institutional text-sm font-medium">
            Browse Certified Works
          </Link>
        </div>
      </section>
    </main>
  );
}

function MethodCard({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <div className="bg-background p-6">
      <div className="font-mono text-xs text-gilt mb-2">Method {n}</div>
      <h3 className="font-serif text-lg mb-2">{t}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{b}</p>
    </div>
  );
}

function MethodDetail({ n, origin, desc, structure }: { n: string; origin: string; desc: string; structure: string }) {
  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="w-1 h-16 bg-gilt/40 shrink-0 mt-1" />
        <div>
          <h3 className="font-serif text-xl mb-1">{n}</h3>
          <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-3">{origin}</div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
          <code className="text-xs font-mono text-gilt bg-background px-3 py-1.5 rounded border border-border/60 block">
            {structure}
          </code>
        </div>
      </div>
    </div>
  );
}

function LifecycleStep({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <div>
      <div className="font-mono text-lg text-gilt mb-1">{n}</div>
      <div className="font-serif text-base mb-1">{t}</div>
      <div className="text-xs text-muted-foreground">{b}</div>
    </div>
  );
}
