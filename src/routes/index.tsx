import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LITLE — The Standard for Preserving Knowledge. Verifying Legacy." },
      {
        name: "description",
        content:
          "The open standard for preserving academic knowledge, verifying its lineage, and outliving the platforms that host it.",
      },
      { property: "og:title", content: "LITLE — The Standard for Preserving Knowledge" },
      {
        property: "og:description",
        content:
          "Durable identifiers, evidence chains and independent preservation for academic work.",
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
    <main className="min-h-screen">
      <TopBar />
      <Hero />
      <ProblemBand />
      <EngineSection />
      <CertifiesSection />
      <LibrarySection />
      <ClosingCTA />
      <SiteFooter />
    </main>
  );
}

/* ————————————————————— Navigation ————————————————————— */

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
              Editorial Infrastructure
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/standard" className="hover:text-foreground transition">Standard</Link>
          <Link to="/standard/rfcs" className="hover:text-foreground transition">RFCs</Link>
          <Link to="/standard/archive" className="hover:text-foreground transition">Archive</Link>
          <a href="#how" className="hover:text-foreground transition">How it Works</a>
          <a href="#library" className="hover:text-foreground transition">Library</a>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <a
            href="#library"
            className="hidden sm:inline-flex rounded-sm border border-border px-3 py-1.5 hover:bg-accent/30 transition"
          >
            Enter Library
          </a>
          <Link
            to="/auth"
            className="inline-flex rounded-sm border border-gilt/60 px-3 py-1.5 gilt-text hover:bg-gilt/10 transition"
          >
            Submit Work
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* ————————————————————— Hero ————————————————————— */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundArchive />
      <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-32 text-center">
        <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-10">
          <span className="h-px w-8 bg-gilt/60" />
          The LITLE Standard · Edition I
          <span className="h-px w-8 bg-gilt/60" />
        </div>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] mb-8">
          The Standard for
          <br />
          Preserving Knowledge.
          <br />
          <span className="gilt-text italic">Verifying Legacy.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          LITLE is the open standard for academic works that must remain
          citable across decades — with durable identifiers, transparent
          evidence chains, and preservation that outlives any single platform.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/standard"
            className="rounded-sm bg-primary text-primary-foreground px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition"
          >
            Read the Standard
          </Link>
          <Link
            to="/standard/rfcs"
            className="rounded-sm border border-gilt/60 px-6 py-3 text-sm gilt-text hover:bg-gilt/10 transition"
          >
            Browse RFCs
          </Link>
        </div>
        <div className="hairline mt-24 max-w-xl mx-auto" />
      </div>
    </section>
  );
}

function BackgroundArchive() {
  // A quiet abstract library / graph motif, drawn with tight SVG lines.
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
      <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.78 0.14 75)" stopOpacity="0.9" />
            <stop offset="1" stopColor="oklch(0.78 0.14 75)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* stacked shelves */}
        {Array.from({ length: 12 }).map((_, r) => (
          <g key={r} stroke="url(#fade)" strokeWidth="0.5" fill="none">
            <line x1="0" y1={40 + r * 45} x2="1200" y2={40 + r * 45} />
            {Array.from({ length: 40 }).map((_, c) => (
              <line
                key={c}
                x1={30 + c * 30 + (r % 2) * 8}
                y1={40 + r * 45}
                x2={30 + c * 30 + (r % 2) * 8}
                y2={40 + r * 45 - (10 + ((c * 7) % 22))}
              />
            ))}
          </g>
        ))}
        {/* subtle DAG overlay */}
        <g stroke="oklch(0.78 0.14 75)" strokeOpacity="0.35" fill="none">
          {[
            [200, 120, 380, 220],
            [380, 220, 560, 180],
            [380, 220, 620, 320],
            [560, 180, 780, 260],
            [620, 320, 800, 400],
            [780, 260, 980, 340],
            [800, 400, 980, 340],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.6" />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ————————————————————— Problem ————————————————————— */

function ProblemBand() {
  const stages = [
    { k: "I", t: "Production", b: "PDFs, DOCX, Markdown, TXT, notes, drafts, audio transcripts. Years of raw material accumulate." },
    { k: "II", t: "Organization", b: "Where almost everything stops. Folders overlap, versions multiply, coherence dissolves." },
    { k: "III", t: "Publication", b: "Only a fraction ever reaches this point. Most independent work never becomes literature." },
  ];
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-28">
      <SectionKicker>The Problem</SectionKicker>
      <h2 className="font-serif text-4xl md:text-5xl max-w-3xl mb-6 leading-tight">
        Most independent research dies between
        <span className="gilt-text"> organization and publication.</span>
      </h2>
      <p className="text-muted-foreground max-w-2xl mb-14">
        LITLE lives exactly there — between the years of accumulated fragments
        and the finished, verifiable book.
      </p>
      <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border">
        {stages.map((s) => (
          <div key={s.k} className="bg-background p-8">
            <div className="font-mono text-xs tracking-widest text-gilt mb-4">STAGE {s.k}</div>
            <h3 className="font-serif text-2xl mb-3">{s.t}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ————————————————————— Engine ————————————————————— */

function EngineSection() {
  const steps = [
    { t: "Raw Knowledge", b: "Massive ingestion of heterogeneous files: PDF, DOCX, MD, TXT, transcribed notes." },
    { t: "Knowledge Reconstruction", b: "Recover the lineage of each idea — its versions, evolutions and merges." },
    { t: "Semantic Organization", b: "Thematic and chapter structure based on meaning, not dates or filenames." },
    { t: "Editorial Synthesis", b: "Narrative synthesis: complete, continuous and rigorous chapters." },
    { t: "Cryptographic Identity", b: "A structural editorial identity — LITLE-512B — assigned to every work." },
    { t: "Publication", b: "Professional formats (EPUB, PDF, print) released into the LITLE network." },
    { t: "Long-term Preservation", b: "The content, its lineage and its traceability preserved across decades." },
  ];
  return (
    <section className="border-y border-border/60 bg-[color:oklch(0.12_0.015_60)]">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <SectionKicker>The Academic Knowledge Engine</SectionKicker>
        <h2 className="font-serif text-4xl md:text-5xl max-w-3xl mb-14 leading-tight">
          A pipeline that turns years of fragments
          <br />
          into a single, sealed work.
        </h2>

        <ol className="relative border-l border-gilt/30 ml-3 space-y-10">
          {steps.map((s, i) => (
            <li key={s.t} className="pl-8 relative">
              <span className="absolute -left-[9px] top-1 h-4 w-4 border border-gilt/60 bg-background grid place-items-center">
                <span className="h-1.5 w-1.5 bg-gilt/80" />
              </span>
              <div className="grid md:grid-cols-[8rem_1fr] gap-x-8 gap-y-2">
                <div className="font-mono text-xs uppercase tracking-widest text-gilt/80 pt-1">
                  Phase {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-1">{s.t}</h3>
                  <p className="text-muted-foreground max-w-2xl">{s.b}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ————————————————————— Certifies ————————————————————— */

function CertifiesSection() {
  const items = [
    { t: "Author identity", b: "The individual or collective responsible for the work." },
    { t: "Exact content", b: "Text, chapters, glossary, formulas — hashed and versioned." },
    { t: "Structural lineage", b: "The source files, notes and revisions the work descends from." },
    { t: "Edition and cover", b: "Version (vX.Y.Z) and a cryptographic hash of the cover art." },
    { t: "Timestamp and integrity", b: "A verifiable moment of sealing; any later alteration leaves a trace." },
    { t: "Editorial identity", b: "A LITLE-512B container that anchors the work as citable literature." },
  ];
  return (
    <section id="standard" className="max-w-7xl mx-auto px-6 py-28">
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 items-start">
        <div>
          <SectionKicker>What a LITLE work certifies</SectionKicker>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            Not a signature.
            <br />
            An <span className="gilt-text italic">editorial identity.</span>
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            At the core of the system is the LITLE-512B standard — a
            512-byte cryptographic container that binds a work to its authors,
            its content and its history. Cryptography is the mechanism;
            editorial identity is the product.
          </p>
          <div className="font-mono text-xs text-muted-foreground border border-border/70 p-5 leading-relaxed">
            <div className="gilt-text mb-2">litle1qz9j…gk7pf2s</div>
            back cover · colophon · library record
          </div>
        </div>
        <ul className="grid sm:grid-cols-2 gap-px bg-border/60 border border-border">
          {items.map((i) => (
            <li key={i.t} className="bg-background p-6">
              <div className="flex items-start gap-3">
                <span className="mt-1 text-gilt font-mono">✓</span>
                <div>
                  <div className="font-serif text-lg mb-1">{i.t}</div>
                  <div className="text-sm text-muted-foreground">{i.b}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ————————————————————— Library ————————————————————— */

function LibrarySection() {
  const disciplines = [
    "Technology", "Sciences", "Humanities",
    "Culture", "Politics", "Economics",
    "Finance", "Education", "Critical Thought",
  ];
  return (
    <section id="library" className="border-y border-border/60 bg-[color:oklch(0.12_0.015_60)]">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <SectionKicker>Independent Academic Library</SectionKicker>
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-14 items-end mb-14">
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            A curated space for
            <span className="gilt-text"> technology, science, humanities</span>{" "}
            and critical thought.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            No commercial fiction. No vanity content. Only rigorous work,
            reconstructed by the LITLE engine and sealed with an editorial
            identity that will outlive the platform hosting it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {disciplines.map((d) => (
            <div
              key={d}
              className="card-editorial p-6 flex items-center justify-between group"
            >
              <div>
                <div className="font-serif text-xl">{d}</div>
                <div className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">
                  Catalogue in preparation
                </div>
              </div>
              <span className="gilt-text font-mono text-sm opacity-70 group-hover:opacity-100 transition">
                →
              </span>
            </div>
          ))}
        </div>

        <p className="mt-14 max-w-2xl text-sm text-muted-foreground italic">
          “This library is still being built. The first independent works
          published here will set a precedent for others.”
        </p>
      </div>
    </section>
  );
}

/* ————————————————————— Closing CTA ————————————————————— */

function ClosingCTA() {
  return (
    <section id="authors" className="max-w-7xl mx-auto px-6 py-28">
      <div className="grid md:grid-cols-2 gap-px bg-border/60 border border-border">
        <div className="bg-background p-10 md:p-14">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            I read
          </div>
          <h3 className="font-serif text-3xl mb-4">Enter the library.</h3>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Works published here are part of a long-term preservation effort
            for independent knowledge. Read online, download, cite — with
            integrity you can verify yourself.
          </p>
          <a
            href="#library"
            className="inline-flex rounded-sm border border-border px-5 py-2.5 text-sm hover:bg-accent/30 transition"
          >
            Browse the catalogue
          </a>
        </div>
        <div className="bg-[color:oklch(0.16_0.02_65)] p-10 md:p-14">
          <div className="text-xs uppercase tracking-[0.3em] text-gilt/80 mb-4">
            I publish
          </div>
          <h3 className="font-serif text-3xl mb-4">
            Turn years of research into <span className="gilt-text italic">enduring literature.</span>
          </h3>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We don't judge your drafts. We reconstruct your research. Upload
            your archive and let LITLE compose, seal and publish the work
            that has been waiting inside it.
          </p>
          <Link
            to="/auth"
            className="inline-flex rounded-sm bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
          >
            Preserve your research →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— Footer ————————————————————— */

function SiteFooter() {
  return (
    <footer id="about" className="border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 grid place-items-center border border-gilt/60">
              <span className="gilt-text font-serif text-lg leading-none">L</span>
            </div>
            <span className="font-serif text-lg tracking-wide">LITLE</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Infrastructure for independent academic literature. A long-term
            commitment to preservation, integrity and attribution.
          </p>
        </div>

        <FooterCol title="Policies" items={["Ethics", "Integrity", "Preservation"]} />
        <FooterCol title="Technical Specs" items={["LITLE-512B", "API", "Integrations"]} />
        <FooterCol title="Community" items={["Governance", "Contact", "Colophon"]} />
      </div>

      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono uppercase tracking-widest">
          <span>LITLE · Editorial Infrastructure</span>
          <span className="gilt-text">Where independent research becomes enduring literature.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.3em] text-gilt/80 mb-4">{title}</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:text-foreground transition">{i}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ————————————————————— Utilities ————————————————————— */

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6">
      <span className="h-px w-8 bg-gilt/60" />
      {children}
    </div>
  );
}
