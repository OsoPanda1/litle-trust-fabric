import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LITLE — The Standard for Preserving Knowledge. Verifying Legacy." },
      {
        name: "description",
        content:
          "La infraestructura soberana para la ciencia abierta de Latinoamérica. Estándar criptográfico, institucional y federado para preservar conocimiento y verificar linaje.",
      },
      { property: "og:title", content: "LITLE — Open Science LATAM" },
      {
        property: "og:description",
        content:
          "Identificadores soberanos, cadenas de evidencia Merkle-verificables y preservación independiente para investigación académica.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar />
      <HeroSection />
      <PillarsSection />
      <FederationsBand />
      <EpistemicBand />
      <LibrarySection />
      <ClosingCTA />
      <SiteFooter />
    </main>
  );
}

function TopBar() {
  return (
    <header className="border-b border-border/60 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 grid place-items-center border border-gilt/60">
            <span className="gilt-text font-serif text-xl leading-none">L</span>
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg tracking-wide">LITLE</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Trust Fabric &amp; Standard
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/library" className="hover:text-foreground transition">Library</Link>
          <Link to="/standard" className="hover:text-foreground transition">Standard</Link>
          <Link to="/standard/rfcs" className="hover:text-foreground transition">RFCs</Link>
          <Link to="/governance" className="hover:text-foreground transition">Governance</Link>
          <Link to="/standard/certification" className="hover:text-foreground transition">Certification</Link>
          <Link to="/standard/open-science" className="hover:text-foreground transition">Open Science</Link>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Link to="/library" className="hidden sm:inline-flex rounded-sm border border-border px-3 py-1.5 hover:bg-accent/30 transition">
            Library
          </Link>
          <Link to="/submit" className="inline-flex rounded-sm border border-gilt/60 px-3 py-1.5 gilt-text hover:bg-gilt/10 transition">
            Submit Work
          </Link>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="oklch(0.78 0.14 75)" stopOpacity="0.9" />
              <stop offset="1" stopColor="oklch(0.78 0.14 75)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 12 }).map((_, r) => (
            <g key={r} stroke="url(#fade)" strokeWidth="0.5" fill="none">
              <line x1="0" y1={40 + r * 45} x2="1200" y2={40 + r * 45} />
              {Array.from({ length: 40 }).map((_, c) => (
                <line key={c} x1={30 + c * 30 + (r % 2) * 8} y1={40 + r * 45} x2={30 + c * 30 + (r % 2) * 8} y2={40 + r * 45 - (10 + ((c * 7) % 22))} />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="hairline-glow mb-0" />
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="mb-10">
          <span className="inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground crystal-glass">
            LITLE Trust Fabric · Open Science LATAM
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-[3fr_2fr] items-start">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif platinum-text leading-tight">
              La infraestructura soberana para la ciencia abierta de Latinoamérica.
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              LITLE Trust Fabric establece un estándar criptográfico, institucional y federado
              para preservar conocimiento, verificar linaje y habilitar investigación independiente
              con alcance global.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/library" className="inline-flex items-center rounded-md bg-petroleum px-5 py-2.5 text-xs font-mono uppercase tracking-[0.18em] text-foreground hover:bg-petroleum/90 transition-colors">
                Explorar la Library
              </Link>
              <Link to="/submit" className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:border-platinum hover:text-foreground transition-colors">
                Registrar un trabajo
              </Link>
            </div>
            <div className="grid gap-4 mt-8 md:grid-cols-3 text-xs font-mono">
              <div className="crystal-glass p-4 space-y-2">
                <p className="text-muted-foreground uppercase tracking-[0.22em]">LITLE-ID</p>
                <p className="text-sm">Identificadores soberanos extendidos para obras, modelos y datasets, diseñados para interoperar con ORCID, ISNI y sistemas institucionales.</p>
              </div>
              <div className="crystal-glass p-4 space-y-2">
                <p className="text-muted-foreground uppercase tracking-[0.22em]">Evidence DAG</p>
                <p className="text-sm">Grafo Merkle-DAG multipadre que registra cada decisión computacional, asegurando una cadena de custodia verificable e independiente de proveedores.</p>
              </div>
              <div className="crystal-glass p-4 space-y-2">
                <p className="text-muted-foreground uppercase tracking-[0.22em]">7 Federaciones TAMV</p>
                <p className="text-sm">Gobernanza académica latinoamericana con quorum 5/7, sin dependencia de monopolios cita-métricos ni corporativos.</p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="crystal-glass p-5 space-y-4">
              <h2 className="text-sm font-serif text-platinum border-b border-border/40 pb-2">Estado del Nodo Cero</h2>
              <dl className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div><dt className="text-muted-foreground">Ubicación</dt><dd className="font-semibold">Real del Monte, Hidalgo, MX</dd></div>
                <div><dt className="text-muted-foreground">Federaciones activas</dt><dd className="font-semibold">7 / 7</dd></div>
                <div><dt className="text-muted-foreground">LITLE-IDs emitidos</dt><dd className="font-semibold">0001 – 0128</dd></div>
                <div><dt className="text-muted-foreground">Obras indexadas</dt><dd className="font-semibold">Libros, Papers, Modelos, Datasets</dd></div>
              </dl>
            </div>
            <div className="crystal-glass p-5 space-y-3">
              <h2 className="text-sm font-serif text-platinum border-b border-border/40 pb-2">Convergencias institucionales</h2>
              <ul className="space-y-2 text-xs text-muted-foreground font-mono">
                <li>Inspirado en OpenAIRE, Datacite y ORCID para metadata y citación.</li>
                <li>Compatibilidad estructural con Zenodo, Figshare y repositorios institucionales.</li>
                <li>Alineado a principios de Open Science y gobernanza pública de datos.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function PillarsSection() {
  const items = [
    { id: "RFC-0001", title: "LITLE-ID", body: "Durable, self-describing identifiers that survive rotation of the cryptographic profile.", to: "/verify/LTL-2026-RQ-8F4A-29D3" as const },
    { id: "RFC-0008", title: "Evidence Chain", body: "Standardized provenance: sources, prompts, model seeds and revisions — Merkle-verifiable.", to: "/standard/rfcs/$slug" as const, params: { slug: "0008-evidence-chain" } },
    { id: "RFC-0009", title: "Independent Archive", body: "Redundant off-platform preservation with public manifests, so works outlive the hosting layer.", to: "/standard/rfcs/$slug" as const, params: { slug: "0009-independent-archive" } },
    { id: "RFC-0015", title: "DAC Certification", body: "Digital Academic Certificate combining CSV, authorship GMM, source verification and epistemic scoring.", to: "/standard/certification" as const, params: {} as any },
  ];
  return (
    <section className="border-y border-border/60 bg-[color:oklch(0.12_0.015_60)]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-gilt/60" /> Trust Infrastructure
        </div>
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-14 items-end mb-14">
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">Four specifications.<br /><span className="gilt-text">One institutional standard for legacy.</span></h2>
          <p className="text-muted-foreground leading-relaxed">LITLE reframes cryptography as a foundation, not the product. The <span className="italic">standard</span> delivers editorial identity, verifiable lineage and independent preservation — for research that must remain citable long after platforms and implementations change.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-px bg-border/60 border border-border crystal-panel">
          {items.map((p) => (
            <Link key={p.id} to={p.to} params={(p as any).params} className="bg-background p-8 group hover:bg-accent/10 transition">
              <div className="font-mono text-xs text-gilt mb-3">{p.id}</div>
              <h3 className="font-serif text-2xl mb-3">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{p.body}</p>
              <span className="text-xs gilt-text font-mono opacity-70 group-hover:opacity-100">Read specification →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FederationsBand() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-28">
      <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6 flex items-center gap-3">
        <span className="h-px w-8 bg-gilt/60" /> 7 Federations · TAMV Governance
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { n: "FED-1", t: "Crypto & Identity", b: "Custodia de perfiles criptográficos, transición post-cuántica y raíz de confianza PKI." },
          { n: "FED-2", t: "Standards & LIPs", b: "Ciclo de vida formal de LIPs, compatibilidad hacia atrás y publicación de RFCs." },
          { n: "FED-3", t: "Infrastructure & Mesh", b: "Orquestación de nodos de almacenamiento distribuido y observabilidad multi-cloud." },
          { n: "FED-4", t: "Evidence & Lineage", b: "Integridad matemática del DAG, canonicalización JSON y esquemas de nodos." },
          { n: "FED-5", t: "Curation & Redemption", b: "Taxonomía académica, moderación de contenido y gestión de retractaciones." },
          { n: "FED-6", t: "Kernel & Dev", b: "Mantenimiento del núcleo en TS/Rust/Python, SDKs y CI/CD abiertas." },
          { n: "FED-7", t: "Audit & Compliance", b: "Evaluación de consistencia, seguridad, privacidad y resolución de disputas." },
        ].map((fed) => (
          <div key={fed.n} className="crystal-panel p-5">
            <div className="font-mono text-xs text-gilt mb-2">{fed.n}</div>
            <h3 className="font-serif text-lg mb-2">{fed.t}</h3>
            <p className="text-xs text-muted-foreground font-mono">{fed.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EpistemicBand() {
  return (
    <section className="border-y border-border/60 bg-[color:oklch(0.12_0.015_60)]">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-gilt/60" /> Epistemic Filter · RFC-0014
        </div>
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-14 items-end mb-14">
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            9 dimensions of quality.<br /><span className="gilt-text">Open Science, curated.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">Open Science publishes without filters. LITLE adds the missing layer: an epistemological engine that scores every work on methodological rigor, reproducibility, AI provenance, citation integrity and longevity potential.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { d: "Methodological Rigor", w: "20%", t: "platinum" },
            { d: "Reproducibility", w: "18%", t: "platinum" },
            { d: "Citation Integrity", w: "15%", t: "gold" },
            { d: "Peer Review", w: "12%", t: "gold" },
            { d: "Data Transparency", w: "12%", t: "gold" },
            { d: "AI Provenance", w: "10%", t: "silver" },
          ].map((dim) => (
            <div key={dim.d} className="crystal-panel p-4 flex items-center justify-between">
              <div>
                <div className="font-serif text-sm">{dim.d}</div>
                <div className="text-[10px] text-muted-foreground font-mono">weight</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${dim.t === "platinum" ? "badge-platinum" : dim.t === "gold" ? "badge-amber" : "border border-border/60 text-muted-foreground"}`}>
                {dim.w}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LibrarySection() {
  const disciplines = ["Technology", "Sciences", "Humanities", "Culture", "Politics", "Economics", "Finance", "Education", "Critical Thought"];
  return (
    <section className="max-w-7xl mx-auto px-6 py-28">
      <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6 flex items-center gap-3">
        <span className="h-px w-8 bg-gilt/60" /> Epistemic Library
      </div>
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-14 items-end mb-14">
        <h2 className="font-serif text-4xl md:text-5xl leading-tight">
          A curated space for
          <span className="gilt-text"> technology, science, humanities </span>
          and critical thought.
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          No commercial fiction. No vanity content. Only rigorous work,
          epistemologically scored and sealed with a Digital Academic Certificate
          designed to outlive the platform hosting it.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {disciplines.map((d) => (
          <div key={d} className="crystal-panel p-6 flex items-center justify-between group">
            <div>
              <div className="font-serif text-xl">{d}</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">Catalogue in preparation</div>
            </div>
            <span className="gilt-text font-mono text-sm opacity-70 group-hover:opacity-100 transition">→</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="border-y border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="grid md:grid-cols-2 gap-px bg-border/60 border border-border crystal-panel">
          <div className="bg-background p-10 md:p-14">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">I read</div>
            <h3 className="font-serif text-3xl mb-4">Enter the library.</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">Works published here are part of a long-term preservation effort for independent knowledge. Read online, download, cite — with integrity you can verify yourself.</p>
            <Link to="/library" className="inline-flex rounded-sm border border-border px-5 py-2.5 text-sm hover:bg-accent/30 transition">Browse the catalogue</Link>
          </div>
          <div className="bg-[color:oklch(0.16_0.02_65)] p-10 md:p-14">
            <div className="text-xs uppercase tracking-[0.3em] text-gilt/80 mb-4">I publish</div>
            <h3 className="font-serif text-3xl mb-4">Turn years of research into <span className="gilt-text italic">enduring literature.</span></h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">Upload your archive and let LITLE compose, seal, certify and publish the work that has been waiting inside it.</p>
            <Link to="/submit" className="btn-institutional text-sm font-medium">Preserve your research →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 grid place-items-center border border-gilt/60"><span className="gilt-text font-serif text-lg leading-none">L</span></div>
            <span className="font-serif text-lg tracking-wide">LITLE</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">Institutional infrastructure for independent academic literature. A long-term commitment to preservation, integrity and attribution.</p>
        </div>
        <FooterCol title="Explore" items={["Library", "Standard", "RFCs", "Governance"]} />
        <FooterCol title="Technical Specs" items={["LITLE-ID", "DAC Certification", "Evidence Chain", "Epistemic Filter"]} />
        <FooterCol title="Community" items={["Open Science", "Archive", "Colophon"]} />
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono uppercase tracking-widest">
          <span>LITLE · Trust Fabric &amp; Standard · Real del Monte, Hidalgo, MX</span>
          <span className="gilt-text">Where independent research becomes enduring literature.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  const routeMap: Record<string, string> = {
    "Library": "/library", "Standard": "/standard", "RFCs": "/standard/rfcs", "Governance": "/governance",
    "LITLE-ID": "/verify/LTL-2026-RQ-8F4A-29D3", "DAC Certification": "/standard/certification",
    "Evidence Chain": "/standard/rfcs/0008-evidence-chain", "Epistemic Filter": "/standard/open-science",
    "Open Science": "/standard/open-science", "Archive": "/standard/archive", "Colophon": "/",
  };
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4 font-mono">{title}</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}><Link to={routeMap[i] ?? "/"} className="hover:text-foreground transition">{i}</Link></li>
        ))}
      </ul>
    </div>
  );
}
