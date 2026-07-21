import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { getQuarantineQueue, updateSubmissionStatus, getSubmission } from "@/lib/submission/quarantine";
import { executeTriangulation } from "@/lib/submission/pipeline";
import type { SubmissionDocument } from "@/lib/submission/types";

export const Route = createFileRoute("/admin/quarantine")({
  head: () => ({
    meta: [
      { title: "Quarantine Admin — LITLE Curation Federation" },
      { name: "description", content: "Admin panel for reviewing quarantined submissions and managing the curation pipeline." },
    ],
  }),
  component: QuarantineAdminPage,
});

function QuarantineAdminPage() {
  const [queue, setQueue] = useState<SubmissionDocument[]>([]);
  const [selected, setSelected] = useState<SubmissionDocument | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const refresh = useCallback(() => {
    setQueue(getQuarantineQueue());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRetriangulate = async (id: string) => {
    setActionMsg("Re-triangulating...");
    try {
      await executeTriangulation(id);
      setActionMsg("Triangulation complete.");
      refresh();
      setSelected(getSubmission(id));
    } catch (err) {
      setActionMsg(`Error: ${(err as Error).message}`);
    }
  };

  const handleForceIndex = async (id: string) => {
    setActionMsg("Forcing index...");
    try {
      await updateSubmissionStatus(id, "indexed", {
        litleId: `LTL-${new Date().getFullYear()}-RQ-MNL-${id.slice(-4).toUpperCase()}`,
        indexedAt: new Date().toISOString(),
        triangulationResult: "green",
      });
      setActionMsg("Manually indexed.");
      refresh();
      setSelected(null);
    } catch (err) {
      setActionMsg(`Error: ${(err as Error).message}`);
    }
  };

  const handleReject = async (id: string) => {
    setActionMsg("Rejecting...");
    try {
      await updateSubmissionStatus(id, "duplicate", {
        triangulationResult: "red",
        triangulationCompletedAt: new Date().toISOString(),
      });
      setActionMsg("Rejected.");
      refresh();
      setSelected(null);
    } catch (err) {
      setActionMsg(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">&larr; Dashboard</Link>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">FED-5 Curation</span>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <h1 className="font-serif text-4xl mb-3">Quarantine Queue</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Curation Federation panel. Review submissions that failed automated triangulation
            or require manual intervention before indexing.
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={refresh} className="text-xs font-mono uppercase tracking-wider border border-border/60 px-3 py-1.5 hover:bg-accent/30 transition">
              Refresh ({queue.length})
            </button>
          </div>
          {actionMsg && (
            <div className="mt-4 text-xs font-mono text-amber-signal crystal-panel p-3 inline-block">
              {actionMsg}
            </div>
          )}
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-[1fr_1fr] gap-8">
        <div className="space-y-3">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Awaiting review</div>
          {queue.length === 0 ? (
            <div className="crystal-panel p-8 text-center text-muted-foreground text-sm">
              Queue is empty. All submissions processed.
            </div>
          ) : (
            queue.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className={`crystal-panel p-4 cursor-pointer transition hover:bg-accent/10 ${selected?.id === s.id ? "border-gilt/40" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif text-sm truncate">{s.title}</span>
                  <span className="text-[10px] font-mono uppercase text-amber-signal">{s.status}</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground flex gap-3">
                  <span>{s.id}</span>
                  <span>{s.workType}</span>
                  <span>{s.orcid}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Details &amp; Actions</div>
          {!selected ? (
            <div className="crystal-panel p-8 text-center text-muted-foreground text-sm">
              Select a submission to review
            </div>
          ) : (
            <div className="crystal-panel p-6 space-y-4">
              <h2 className="font-serif text-xl">{selected.title}</h2>
              <dl className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div><dt className="text-muted-foreground">ID</dt><dd>{selected.id}</dd></div>
                <div><dt className="text-muted-foreground">Type</dt><dd>{selected.workType}</dd></div>
                <div><dt className="text-muted-foreground">ORCID</dt><dd>{selected.orcid}</dd></div>
                <div><dt className="text-muted-foreground">Status</dt><dd>{selected.status}</dd></div>
                <div><dt className="text-muted-foreground">Triangulation</dt><dd>{selected.triangulationResult}</dd></div>
                <div><dt className="text-muted-foreground">Created</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div>
              </dl>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground font-mono mb-1">Abstract</p>
                <p className="text-sm bg-background border border-border/40 p-3 rounded-sm">{selected.abstract}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border/40">
                <button onClick={() => handleRetriangulate(selected.id)}
                  className="rounded-sm bg-petroleum px-4 py-2 text-xs font-mono uppercase tracking-wider text-foreground hover:bg-petroleum/90 transition">
                  Re-triangulate
                </button>
                <button onClick={() => handleForceIndex(selected.id)}
                  className="rounded-sm border border-emerald/60 px-4 py-2 text-xs font-mono uppercase tracking-wider text-emerald hover:bg-emerald/10 transition">
                  Force Index
                </button>
                <button onClick={() => handleReject(selected.id)}
                  className="rounded-sm border border-red/60 px-4 py-2 text-xs font-mono uppercase tracking-wider text-red hover:bg-red/10 transition">
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
