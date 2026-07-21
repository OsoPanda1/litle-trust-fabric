import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/discovery")({
  head: () => ({
    meta: [
      { title: "Curated Library — LITLE Open Science" },
      {
        name: "description",
        content:
          "Browse the epistemologically curated library of Open Science works. Filter by quality tier, domain, methodology and AI provenance.",
      },
      { property: "og:title", content: "Curated Library — LITLE" },
      { property: "og:url", content: "/discovery" },
    ],
    links: [{ rel: "canonical", href: "/discovery" }],
  }),
  component: DiscoveryPage,
});

const MOCK_WORKS = [
  {
    id: "LTL-2026-RQ-8F4A-29D3",
    title: "Epistemic Trust in AI-Assisted Research",
    domain: "technology",
    tier: "platinum" as const,
    score: 4.2,
    author: "Collective TAMV",
    methodology: "Mixed-methods longitudinal",
    aiAssisted: true,
  },
  {
    id: "LTL-2026-BK-1B2C-3D4E",
    title: "Foundations of Cryptographic Preservation",
    domain: "sciences",
    tier: "platinum" as const,
    score: 4.5,
    author: "LITLE Standards Council",
    methodology: "Formal specification",
    aiAssisted: false,
  },
  {
    id: "LTL-2026-RQ-5E6F-7A8B",
    title: "Reproducibility in Decentralized Science",
    domain: "sciences",
    tier: "gold" as const,
    score: 3.8,
    author: "Open Science Collective",
    methodology: "Systematic review",
    aiAssisted: true,
  },
  {
    id: "LTL-2026-AR-9C0D-1E2F",
    title: "Quantum-Resistant Signatures for Academic Works",
    domain: "mathematics",
    tier: "gold" as const,
    score: 3.6,
    author: "Post-Quantum WG",
    methodology: "Theoretical analysis",
    aiAssisted: false,
  },
  {
    id: "LTL-2026-DS-3A4B-5C6D",
    title: "Open Citation Network Dataset 2026",
    domain: "technology",
    tier: "silver" as const,
    score: 3.2,
    author: "Citation Graph Project",
    methodology: "Data curation",
    aiAssisted: true,
  },
  {
    id: "LTL-2026-RQ-7E8F-9A0B",
    title: "AI Provenance Tracking in Academic Pipelines",
    domain: "technology",
    tier: "silver" as const,
    score: 2.9,
    author: "ML Transparency Lab",
    methodology: "Case study",
    aiAssisted: true,
  },
];

const TIERS = [
  { key: "all", label: "All Works", color: "" },
  { key: "platinum", label: "Platinum", color: "badge-platinum" },
  { key: "gold", label: "Gold", color: "badge-amber" },
  { key: "silver", label: "Silver", color: "border border-border/60 text-muted-foreground" },
  { key: "bronze", label: "Bronze", color: "border border-border/40 text-muted-foreground/60" },
] as const;

function DiscoveryPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">LITLE</Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/standard" className="hover:text-foreground transition">Standard</Link>
            <Link to="/standard/rfcs" className="hover:text-foreground transition">RFCs</Link>
            <Link to="/standard/certification" className="hover:text-foreground transition">Certification</Link>
            <Link to="/standard/open-science" className="hover:text-foreground transition">Open Science</Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Epistemic Library
            </div>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight">
              Curated Open Science
            </h1>
          </div>
          <div className="flex gap-2">
            {TIERS.map((t) => (
              <button
                key={t.key}
                className={`text-xs px-3 py-1.5 rounded-full border border-border/60 hover:bg-accent/20 transition ${t.key === "all" ? "bg-accent/30" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-10">
          <input
            placeholder="Search by title, author, domain…"
            className="flex-1 rounded-md bg-input border border-border px-4 py-2 text-sm"
          />
          <select className="rounded-md bg-input border border-border px-3 py-2 text-sm text-muted-foreground">
            <option>All domains</option>
            <option>Technology</option>
            <option>Sciences</option>
            <option>Humanities</option>
            <option>Mathematics</option>
          </select>
          <select className="rounded-md bg-input border border-border px-3 py-2 text-sm text-muted-foreground">
            <option>Sort: Score</option>
            <option>Sort: Date</option>
            <option>Sort: Title</option>
          </select>
        </div>

        <div className="space-y-px bg-border/60 border border-border">
          {MOCK_WORKS.map((w) => (
            <Link
              key={w.id}
              to="/verify/$litleId"
              params={{ litleId: w.id }}
              className="bg-background p-5 grid grid-cols-[1fr_8rem_6rem_6rem] gap-4 items-center hover:bg-accent/10 transition group"
            >
              <div>
                <div className="font-serif text-lg mb-1 group-hover:text-gilt transition">
                  {w.title}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{w.author}</span>
                  <span className="font-mono">{w.id}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{w.methodology}</div>
              <div className="text-right font-mono text-sm">{w.score.toFixed(1)}</div>
              <div className="text-right">
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${TIERS.find((t) => t.key === w.tier)?.color ?? ""}`}>
                  {w.tier}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground text-center">
          {MOCK_WORKS.length} curated works ·{" "}
          <Link to="/standard/open-science" className="underline">How curation works</Link>
        </p>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-xs text-muted-foreground">
          LITLE · Open Science Epistemic Library · RFC-0014
        </div>
      </footer>
    </main>
  );
}
