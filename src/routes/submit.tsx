import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { submitAndQuarantine, executeTriangulation } from "@/lib/submission/pipeline";
import type { SubmissionDocument, TriangulationReport, PipelineResult } from "@/lib/submission/types";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit — LITLE Trust Fabric" },
      { name: "description", content: "Submit your academic work for certification under the LITLE Trust Fabric standard. Submissions enter quarantine for originality verification before indexing." },
    ],
  }),
  component: SubmitPage,
});

const WORK_TYPES = [
  "Paper", "Monograph", "Edited Volume", "Technical Report", "Dataset",
  "Model", "Lab Notebook", "Manifesto", "Translation", "Critical Edition",
];

const FEDERATIONS = ["FED-1 Crypto", "FED-2 Standards", "FED-3 Infrastructure", "FED-4 Evidence", "FED-5 Curation", "FED-6 Kernel", "FED-7 Audit"];

function SubmitPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [abstract, setAbstract] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [orcid, setOrcid] = useState("");
  const [fed, setFed] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [phase, setPhase] = useState<"form" | "quarantine" | "triangulating" | "result">("form");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !abstract || !orcid || !agreed) return;
    setError(null);

    try {
      setPhase("quarantine");
      const step1 = await submitAndQuarantine({
        userId: "anonymous",
        title,
        workType: type,
        abstract,
        content: abstract,
        repoUrl: repoUrl || undefined,
        orcid,
        targetFederation: fed || undefined,
      });
      setPhase("triangulating");

      const step2 = await executeTriangulation(step1.submission.id);
      setResult(step2);
      setPhase("result");
    } catch (err) {
      setError((err as Error).message);
      setPhase("form");
    }
  };

  if (phase === "quarantine") {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-6">
          <div className="w-16 h-16 mx-auto border border-amber-signal/60 grid place-items-center">
            <span className="text-amber-signal font-serif text-3xl">!</span>
          </div>
          <h1 className="font-serif text-3xl">Submission in quarantine</h1>
          <div className="crystal-panel p-4 text-xs font-mono text-muted-foreground space-y-2">
            <p>Your document has been placed in <span className="text-amber-signal">quarantine</span>.</p>
            <p>LITLE is now performing cross-reference triangulation:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>ORCID identity verification</li>
              <li>DOI / Crossref search</li>
              <li>ISNI registry check</li>
              <li>Web similarity analysis</li>
              <li>LITLE library deduplication</li>
            </ul>
            <p className="animate-pulse mt-4">Investigating&hellip;</p>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "triangulating") {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-6">
          <div className="w-16 h-16 mx-auto border border-gilt/60 grid place-items-center">
            <span className="gilt-text font-serif text-3xl">~</span>
          </div>
          <h1 className="font-serif text-3xl">Triangulating information</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Cross-referencing your submission against academic registries and publication databases.
            This process confirms originality before indexing.
          </p>
          <div className="flex justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gilt/60 animate-pulse"></span>
            <span className="w-3 h-3 rounded-full bg-gilt/40 animate-pulse" style={{ animationDelay: "0.2s" }}></span>
            <span className="w-3 h-3 rounded-full bg-gilt/20 animate-pulse" style={{ animationDelay: "0.4s" }}></span>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "result" && result) {
    const decision = result.decision;
    const isGreen = result.litleId;
    const isRed = decision?.action === "reject";

    if (isGreen) {
      return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="max-w-lg mx-auto px-6 py-20 text-center space-y-6">
            <div className="w-16 h-16 mx-auto border border-emerald bg-emerald/10 grid place-items-center">
              <span className="text-emerald font-serif text-3xl">✓</span>
            </div>
            <h1 className="font-serif text-3xl">Indexed &amp; Certified</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Triangulation complete — no conflicts found. Your work has been indexed
              and assigned a permanent LITLE-ID.
            </p>
            <div className="crystal-panel p-4 space-y-2">
              <p className="text-xs font-mono text-muted-foreground">LITLE-ID</p>
              <p className="font-mono text-lg gilt-text">{result.litleId}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to={`/verify/${result.litleId}`} className="inline-flex rounded-sm bg-petroleum px-5 py-2.5 text-xs font-mono uppercase tracking-[0.18em] text-foreground hover:bg-petroleum/90 transition">
                View Certificate
              </Link>
              <Link to="/library" className="inline-flex rounded-sm border border-border px-5 py-2.5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:border-platinum hover:text-foreground transition">
                Browse Library
              </Link>
            </div>
          </div>
        </main>
      );
    }

    if (isRed) {
      const duplicates = result.report?.checks.filter((c) => c.found) ?? [];
      return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="max-w-lg mx-auto px-6 py-20 text-center space-y-6">
            <div className="w-16 h-16 mx-auto border border-red/60 grid place-items-center">
              <span className="text-red font-serif text-3xl">!</span>
            </div>
            <h1 className="font-serif text-3xl">Duplicate detected</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our triangulation found your content already registered in academic sources.
              Your submission has been held in quarantine.
            </p>
            <div className="crystal-panel p-4 text-left text-xs font-mono space-y-2">
              {duplicates.map((c, i) => (
                <div key={i} className="border-b border-border/40 pb-2 last:border-b-0">
                  <p className="text-gilt">{c.source}</p>
                  <p className="text-muted-foreground">{c.detail}</p>
                  {c.match && <p className="text-foreground mt-1">Match: {c.match}</p>}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              If you believe this is an error, contact curation@litle.org with your submission ID:
              <span className="font-mono text-foreground block mt-1">{result.submission.id}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/" className="inline-flex rounded-sm border border-border px-5 py-2.5 text-sm hover:bg-accent/30 transition">Return home</Link>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-lg mx-auto px-6 py-20 text-center space-y-6">
          <div className="w-16 h-16 mx-auto border border-amber-signal/60 grid place-items-center">
            <span className="text-amber-signal font-serif text-3xl">?</span>
          </div>
          <h1 className="font-serif text-3xl">Requires manual review</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Automated triangulation could not reach a conclusive decision.
            Your submission has been escalated to the curation federation for manual review.
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-4">
            Submission ID: <span className="text-foreground">{result.submission.id}</span>
          </p>
          <Link to="/" className="inline-flex rounded-sm border border-border px-5 py-2.5 text-sm hover:bg-accent/30 transition mt-4">Return home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">&larr; Back</a>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Submit your work</span>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <h1 className="font-serif text-4xl mb-3">Submit your work</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Publish your academic work under the LITLE standard. Every submission
            enters <span className="text-amber-signal font-mono">quarantine</span> for
            originality triangulation — LITLE cross-references ORCID, Crossref/DOI, ISNI,
            and web sources before indexing. This ensures no duplicate or pre-published
            content enters the library without author awareness.
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="crystal-panel p-4 mb-6 border border-red/40">
            <p className="text-xs font-mono text-red">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="crystal-panel p-8 md:p-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Title *</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={500}
                className="w-full bg-background border border-border/60 px-4 py-2.5 text-sm focus:outline-none focus:border-platinum transition font-serif"
                placeholder="Full title of the work" />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Work type *</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value)} required
                className="w-full bg-background border border-border/60 px-4 py-2.5 text-sm focus:outline-none focus:border-platinum transition font-mono text-muted-foreground">
                <option value="">Select type…</option>
                {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="abstract" className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Abstract / Description *</label>
            <textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} required rows={5}
              className="w-full bg-background border border-border/60 px-4 py-2.5 text-sm focus:outline-none focus:border-platinum transition font-mono"
              placeholder="Describe the work, its methodology and contributions…" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="repo" className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Repository / DOI / URL</label>
              <input id="repo" type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full bg-background border border-border/60 px-4 py-2.5 text-sm focus:outline-none focus:border-platinum transition font-mono"
                placeholder="https://github.com/… or DOI" />
            </div>
            <div className="space-y-2">
              <label htmlFor="orcid" className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">ORCID iD *</label>
              <input id="orcid" type="text" value={orcid} onChange={(e) => setOrcid(e.target.value)} required
                className="w-full bg-background border border-border/60 px-4 py-2.5 text-sm focus:outline-none focus:border-platinum transition font-mono"
                placeholder="0000-0000-0000-0000" pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="fed" className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Target Federation (optional)</label>
            <select id="fed" value={fed} onChange={(e) => setFed(e.target.value)}
              className="w-full bg-background border border-border/60 px-4 py-2.5 text-sm focus:outline-none focus:border-platinum transition font-mono text-muted-foreground">
              <option value="">Auto-assign</option>
              {FEDERATIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="flex items-start gap-3 pt-4 border-t border-border/40">
            <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required
              className="mt-1 accent-gilt" />
            <label htmlFor="agree" className="text-xs text-muted-foreground font-mono leading-relaxed">
              I confirm that this work is my original contribution, that I have the right to publish it,
              and that it complies with the LITLE Academic Ethics Code and Open Science principles.
              I understand my submission enters quarantine for originality triangulation. *
            </label>
          </div>

          <div className="text-[10px] font-mono text-muted-foreground border border-border/40 p-3 rounded-sm">
            <span className="text-amber-signal">&bull;</span> By submitting, you agree to LITLE's
            originality verification process. Your work will be checked against ORCID, Crossref,
            ISNI and web sources. If a duplicate is found, you will be notified with references
            and the submission will be held in quarantine.
          </div>

          <button type="submit" disabled={!agreed}
            className="w-full rounded-sm bg-petroleum py-3.5 text-sm font-mono uppercase tracking-[0.18em] text-foreground hover:bg-petroleum/90 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Submit for quarantine &amp; verification
          </button>
        </form>
      </section>

      <footer className="border-t border-border/60 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-xs text-muted-foreground font-mono uppercase tracking-wider">
          <span>LITLE · Trust Fabric &amp; Standard · Real del Monte, Hidalgo, MX</span>
        </div>
      </footer>
    </main>
  );
}
