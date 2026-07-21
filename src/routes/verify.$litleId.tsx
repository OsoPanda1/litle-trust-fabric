import { createFileRoute, notFound } from "@tanstack/react-router";
import { LitleIdEngine, parseAny, toHuman, type LitleId } from "@/lib/litle/id";

export const Route = createFileRoute("/verify/$litleId")({
  head: ({ params }) => ({
    meta: [
      { title: `Verify ${params.litleId} — LITLE Trust Fabric` },
      { name: "description", content: `Digital Academic Certificate resolution for identifier ${params.litleId}. Curated by LITLE Trust Fabric.` },
    ],
  }),
  loader: ({ params }) => {
    const parsed = params.litleId ? LitleIdEngine.parse(params.litleId) : null;
    const verifyResult = params.litleId ? LitleIdEngine.verify(params.litleId) : null;
    if (!parsed || !verifyResult?.valid) throw notFound();
    return { parsed, verifyResult, raw: params.litleId };
  },
  component: VerifyPage,
  notFoundComponent: () => (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <h1 className="font-serif text-4xl text-platinum">Identifier not recognised</h1>
        <p className="text-sm text-muted-foreground">The identifier you provided could not be parsed as a valid LITLE-ID. Verify the format and try again.</p>
        <a href="/" className="inline-block text-xs font-mono uppercase tracking-wider gilt-text hover:underline pt-4">Return to LITLE</a>
      </div>
    </main>
  ),
});

function VerifyPage() {
  const { parsed, raw } = Route.useLoaderData();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">&larr; Back</a>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Datacite-style Resolver</span>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="crystal-panel p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="verified-badge px-3 py-1 text-xs font-mono uppercase tracking-wider">Verified Identifier</span>
            {parsed.pqcCapable && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-mono uppercase tracking-wider border border-gilt/30 text-gilt rounded-full bg-gilt/5">
                PQC Enabled
              </span>
            )}
            {(parsed as any).quantumCapable && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-mono uppercase tracking-wider border border-emerald-dark/30 text-emerald-dark rounded-full bg-emerald-dark/5">
                48-Gate Quantum
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-[1fr_1.5fr] gap-10">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">LITLE-ID</p>
                <div className="font-mono text-sm break-all bg-background border border-border/40 p-3 rounded-sm">{raw}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">Canonical</p>
                <div className="font-mono text-sm break-all bg-background border border-border/40 p-3 rounded-sm">{toHuman(parsed as LitleId)}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">Federation</p>
                <div className="font-mono text-sm bg-background border border-border/40 p-3 rounded-sm">{parsed.federationId ?? "FED0"}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">Crypto Profile</p>
                <div className="font-mono text-sm bg-background border border-border/40 p-3 rounded-sm">{parsed.cryptoProfile}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">Identifier details</p>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-background border border-border/40 p-3">
                    <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Namespace</dt>
                    <dd className="font-mono">{parsed.namespace}</dd>
                  </div>
                  <div className="bg-background border border-border/40 p-3">
                    <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Year</dt>
                    <dd className="font-mono">{parsed.year}</dd>
                  </div>
                  <div className="bg-background border border-border/40 p-3">
                    <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Work Type</dt>
                    <dd className="font-mono">{parsed.workType}</dd>
                  </div>
                  <div className="bg-background border border-border/40 p-3">
                    <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Suffix</dt>
                    <dd className="font-mono text-[10px] break-all">{parsed.suffix}</dd>
                  </div>
                </dl>
              </div>

              <div className="border-t border-border/40 pt-6">
                <h2 className="font-serif text-2xl mb-4">Digital Academic Certificate</h2>
                <div className="grid gap-3">
                  <a href={`/certificate/${raw}`} className="inline-flex items-center justify-center rounded-sm bg-petroleum px-6 py-3 text-xs font-mono uppercase tracking-[0.18em] text-foreground hover:bg-petroleum/90 transition">
                    View full DAC &rarr;
                  </a>
                  <a href="/library" className="inline-flex items-center justify-center rounded-sm border border-border px-6 py-3 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:border-platinum hover:text-foreground transition">
                    Explore more works
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
