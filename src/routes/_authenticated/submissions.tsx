import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getUserSubmissions } from "@/lib/submission/pipeline";
import type { SubmissionDocument } from "@/lib/submission/types";

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({
    meta: [
      { title: "My Submissions — LITLE Trust Fabric" },
      { name: "description", content: "Track your research submissions through the LITLE quarantine and certification pipeline." },
    ],
  }),
  component: SubmissionsPage,
});

const STATUS_COLORS: Record<string, string> = {
  draft: "text-muted-foreground border-border/40",
  quarantine: "text-amber-signal border-amber-signal/30",
  reviewing: "text-[color:oklch(0.7_0.1_240)] border-[color:oklch(0.7_0.1_240)]/30",
  triangulating: "text-[color:oklch(0.7_0.1_240)] border-[color:oklch(0.7_0.1_240)]/30",
  indexed: "text-emerald border-emerald/30",
  rejected: "text-red/80 border-red/30",
  duplicate: "text-red/80 border-red/30",
};

function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionDocument[]>([]);
  const userId = "anonymous";

  useEffect(() => {
    setSubmissions(getUserSubmissions(userId));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">&larr; Dashboard</Link>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">My Submissions</span>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <h1 className="font-serif text-4xl mb-3">Submissions</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Track your research works through the LITLE quarantine, triangulation and certification pipeline.
          </p>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8">
        {submissions.length === 0 ? (
          <div className="crystal-panel p-12 text-center">
            <p className="text-muted-foreground mb-4">No submissions yet.</p>
            <Link to="/submit" className="inline-flex rounded-sm bg-petroleum px-5 py-2.5 text-xs font-mono uppercase tracking-[0.18em] text-foreground hover:bg-petroleum/90 transition">
              Submit your first work
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="crystal-panel p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-serif text-lg truncate">{s.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs font-mono text-muted-foreground">
                    <span>ID: {s.id}</span>
                    <span>{s.workType}</span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    {s.litleId && <span className="gilt-text">LITLE-ID: {s.litleId}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border ${STATUS_COLORS[s.status] ?? "border-border/40 text-muted-foreground"}`}>
                    {s.status}
                  </span>
                  {s.status === "indexed" && s.litleId && (
                    <Link to={`/verify/${s.litleId}`} className="text-xs gilt-text font-mono hover:underline">
                      View &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
