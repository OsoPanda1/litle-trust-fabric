import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/standard/")({
  head: () => ({
    meta: [
      { title: "Standard — LITLE Trust Fabric" },
      { name: "description", content: "LITLE Standard portal: RFCs, legal frameworks, certification and Open Science specifications for independent academic preservation." },
    ],
  }),
  component: StandardPage,
});

const RFCS = [
  { id: "RFC-0001", title: "LITLE-ID Identifier Specification", desc: "Format, encoding, checksum algorithm and resolution protocol for persistent identifiers.", status: "stable", to: "/standard/rfcs/0001-litle-id" },
  { id: "RFC-0002", title: "Namespace Registry", desc: "Registration and governance of LITLE-ID namespaces: technology, science, humanities.", status: "stable", to: "/standard/rfcs/0002-namespace-registry" },
  { id: "RFC-0003", title: "Evidence DAG Schema", desc: "JSON canonicalization, Merkle-DAG node types and edge semantics for provenance graphs.", status: "draft", to: "/standard/rfcs/0003-evidence-dag-schema" },
  { id: "RFC-0008", title: "Evidence Chain", desc: "Standardized provenance recording for sources, prompts, model seeds and revisions.", status: "stable", to: "/standard/rfcs/0008-evidence-chain" },
  { id: "RFC-0009", title: "Independent Archive", desc: "Redundant off-platform preservation with public manifests.", status: "stable", to: "/standard/rfcs/0009-independent-archive" },
  { id: "RFC-0014", title: "Open Science Curation", desc: "Epistemic filter for Open Science publishing with 9 quality dimensions.", status: "stable", to: "/standard/open-science" },
  { id: "RFC-0015", title: "DAC Certification", desc: "Digital Academic Certificate combining CSV, authorship GMM, source verification and epistemic scoring.", status: "stable", to: "/standard/certification" },
];

const LEGAL_FRAMEWORKS = [
  { title: "Gobernanza Federada", org: "TAMV", body: "Reglas de quorum 5/7, resolución de disputas y transparencia en la toma de decisiones." },
  { title: "Política de Preservación", org: "LITLE", body: "Compromiso de preservación independiente con manifiestos públicos y redundancia geográfica." },
  { title: "Código de Ética Académica", org: "FED-5", body: "Lineamientos para moderación, retractación y manejo de conflictos de interés." },
  { title: "Marco Legal LATAM", org: "Open Science", body: "Alineación con legislaciones de acceso abierto en México, Brasil, Argentina y Chile." },
];

function StandardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">&larr; Back</a>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">LITLE Standard Portal</span>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <h1 className="font-serif text-4xl mb-3">Standard</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            The LITLE standard defines the cryptographic, institutional and federated protocols
            that underpin the Trust Fabric. RFCs, legal frameworks and certification schemas
            are published here for public review and implementation.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6 flex items-center gap-3">
          <span className="h-px w-6 bg-gilt/60" /> RFCs
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-20">
          {RFCS.map((rfc) => (
            <Link key={rfc.id} to={rfc.to} className="crystal-panel p-6 group hover:bg-accent/10 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gilt">{rfc.id}</span>
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  rfc.status === "stable" ? "border-gilt/30 text-gilt" : "border-amber-signal/30 text-amber-signal"
                }`}>
                  {rfc.status}
                </span>
              </div>
              <h3 className="font-serif text-xl mb-2">{rfc.title}</h3>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed">{rfc.desc}</p>
              <span className="text-xs gilt-text font-mono opacity-70 group-hover:opacity-100 block mt-4">Read specification →</span>
            </Link>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6 flex items-center gap-3">
          <span className="h-px w-6 bg-gilt/60" /> Legal Frameworks
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-20">
          {LEGAL_FRAMEWORKS.map((fw) => (
            <div key={fw.title} className="crystal-panel p-6">
              <div className="font-mono text-xs text-gilt mb-2">{fw.org}</div>
              <h3 className="font-serif text-lg mb-2">{fw.title}</h3>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed">{fw.body}</p>
            </div>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6 flex items-center gap-3">
          <span className="h-px w-6 bg-gilt/60" /> Certification
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/standard/certification" className="crystal-panel p-6 group hover:bg-accent/10 transition">
            <h3 className="font-serif text-xl mb-2">Digital Academic Certificate (DAC)</h3>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-4">
              Four-layer certification: CSV verification, authorship Gaussian Mixture Model,
              source verification DAG and epistemic scoring. RFC-0015.
            </p>
            <span className="text-xs gilt-text font-mono opacity-70 group-hover:opacity-100">View certification standard →</span>
          </Link>
          <Link to="/standard/open-science" className="crystal-panel p-6 group hover:bg-accent/10 transition">
            <h3 className="font-serif text-xl mb-2">Open Science Curation</h3>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-4">
              Epistemic filter for Open Science publishing. 9 dimensions of quality
              with weighted scoring and transparent methodology. RFC-0014.
            </p>
            <span className="text-xs gilt-text font-mono opacity-70 group-hover:opacity-100">View Open Science standard →</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-xs text-muted-foreground font-mono uppercase tracking-wider">
          <span>LITLE · Trust Fabric &amp; Standard · Real del Monte, Hidalgo, MX</span>
        </div>
      </footer>
    </main>
  );
}
