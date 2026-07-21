import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit — LITLE Trust Fabric" },
      { name: "description", content: "Submit your academic work for certification under the LITLE Trust Fabric standard. Open Science publishing with Digital Academic Certificate." },
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
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !abstract || !orcid || !agreed) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-lg mx-auto px-6 py-20 text-center space-y-6">
          <div className="w-16 h-16 mx-auto border border-gilt/60 grid place-items-center">
            <span className="gilt-text font-serif text-3xl">✓</span>
          </div>
          <h1 className="font-serif text-3xl">Submission received</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your work has been submitted to the LITLE curation queue. You will receive a
            LITLE-ID and Digital Academic Certificate once the epistemic review is complete.
            You can track the status of your submission using the ORCID you provided.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/library" className="inline-flex rounded-sm border border-border px-5 py-2.5 text-sm hover:bg-accent/30 transition">Browse library</Link>
            <Link to="/" className="inline-flex rounded-sm border border-gilt/60 px-5 py-2.5 text-sm gilt-text hover:bg-gilt/10 transition">Return home</Link>
          </div>
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
            undergoes epistemological scoring and receives a Digital Academic Certificate.
            Works are preserved independently and indexed in the LITLE Academic Library.
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="crystal-panel p-8 md:p-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Title *</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
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
              and that it complies with the LITLE Academic Ethics Code and Open Science principles. *
            </label>
          </div>

          <button type="submit" disabled={!agreed}
            className="w-full rounded-sm bg-petroleum py-3.5 text-sm font-mono uppercase tracking-[0.18em] text-foreground hover:bg-petroleum/90 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Submit for certification
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
