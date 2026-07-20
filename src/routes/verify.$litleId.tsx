import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPublicEvidence } from "@/lib/evidence.functions";
import { parseAny, toHuman, toUri } from "@/lib/litle/id";

const evidenceQuery = (litleId: string) =>
  queryOptions({
    queryKey: ["public-evidence", litleId],
    queryFn: () => getPublicEvidence({ data: { litleId } }),
  });

export const Route = createFileRoute("/verify/$litleId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(evidenceQuery(params.litleId)),
  head: ({ params }) => ({
    meta: [
      { title: `Verify ${params.litleId} — LITLE` },
      {
        name: "description",
        content: `Public verification page for LITLE-ID ${params.litleId}. Inspect the evidence chain and cryptographic anchor.`,
      },
      { property: "og:title", content: `Verify ${params.litleId} — LITLE` },
      { property: "og:url", content: `/verify/${params.litleId}` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `/verify/${params.litleId}` }],
  }),
  component: VerifyPage,
  errorComponent: VerifyError,
  notFoundComponent: () => <VerifyError error={new Error("Not found")} reset={() => {}} />,
});

function VerifyError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Verification
        </div>
        <h1 className="font-serif text-3xl mb-3">Could not verify this identifier</h1>
        <p className="text-sm text-muted-foreground mb-8">{error.message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent/30"
          >
            Try again
          </button>
          <Link to="/" className="rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function VerifyPage() {
  const { litleId } = Route.useParams();
  const { data } = useSuspenseQuery(evidenceQuery(litleId));

  let human: string | null = null;
  let uri: string | null = null;
  try {
    const parsed = parseAny(litleId);
    human = toHuman(parsed);
    uri = toUri(parsed);
  } catch {
    /* leave as raw */
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">
            LITLE
          </Link>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Public Verification
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          LITLE-ID · RFC-0001
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
          {data.found ? "Verified record" : "No public record"}
        </h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          {data.found
            ? "The identifier below is anchored to a preserved work. Its evidence chain — sources, prompts, model seeds and revisions — is published for public inspection."
            : "This identifier is either private, unknown, or has not yet been published for public verification."}
        </p>

        <div className="grid md:grid-cols-2 gap-px bg-border/60 border border-border">
          <Field label="Human form" value={human ?? "—"} mono />
          <Field label="URI form" value={uri ?? "—"} mono />
          <Field label="Canonical" value={data.litleId} mono />
          <Field label="Work type" value={data.workType ?? "—"} />
          <Field label="Namespace" value={data.namespace ?? "—"} />
          <Field label="Crypto profile" value={data.cryptoProfile ?? "—"} mono />
          <Field label="Root hash" value={data.rootHash ?? "—"} mono />
          <Field
            label="Sealed at"
            value={data.createdAt ? new Date(data.createdAt).toISOString() : "—"}
            mono
          />
        </div>

        {data.found && (
          <div className="mt-14">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Evidence Chain · RFC-0008
            </div>
            <h2 className="font-serif text-2xl mb-6">Node summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border/60 border border-border mb-10">
              {(
                Object.entries(data.nodeCounts) as Array<
                  [keyof typeof data.nodeCounts, number]
                >
              ).map(([k, v]) => (
                <div key={k} className="bg-background p-4 text-center">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {k}
                  </div>
                  <div className="font-serif text-2xl mt-1">{v}</div>
                </div>
              ))}
            </div>

            {data.nodes.length > 0 && (
              <ul className="divide-y divide-border/60 border border-border">
                {data.nodes.map((n) => (
                  <li key={n.id} className="p-4 grid grid-cols-[6rem_1fr_10rem] gap-4 text-sm">
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {n.kind}
                    </span>
                    <span className="truncate">{n.label || "(unlabeled)"}</span>
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {n.hash.slice(0, 16)}…
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-14 text-xs text-muted-foreground">
          <Link to="/standard/rfcs/$slug" params={{ slug: "0008-evidence-chain" }} className="underline">
            Read RFC-0008 — Evidence Chain
          </Link>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-background p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className={mono ? "font-mono text-sm break-all" : "text-sm"}>{value}</div>
    </div>
  );
}
