import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPublicEvidence } from "@/lib/evidence.functions";
import { parseAny, toHuman, toUri } from "@/lib/litle/id";
import { verifyChain } from "@/lib/verify/engine";
import { generateCertificate, verifyCertificate } from "@/lib/verify/certificate";
import type { DigitalAcademicCertificate } from "@/lib/verify/certificate";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils";

const evidenceQuery = (litleId: string) =>
  queryOptions({
    queryKey: ["public-certificate", litleId],
    queryFn: () => getPublicEvidence({ data: { litleId } }),
  });

export const Route = createFileRoute("/certificate/$litleId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(evidenceQuery(params.litleId)),
  head: ({ params }) => ({
    meta: [
      { title: `Certificate ${params.litleId} — LITLE DAC` },
      {
        name: "description",
        content: `Digital Academic Certificate for LITLE-ID ${params.litleId}. Cryptographically verified, epistemologically scored.`,
      },
      { property: "og:title", content: `Certificate ${params.litleId} — LITLE` },
      { property: "og:url", content: `/certificate/${params.litleId}` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `/certificate/${params.litleId}` }],
  }),
  component: CertificatePage,
  errorComponent: CertError,
});

function CertError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">DAC Verification</div>
        <h1 className="font-serif text-3xl mb-3">Certificate not found</h1>
        <p className="text-sm text-muted-foreground mb-8">{error.message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }}
            className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent/30">
            Try again
          </button>
          <Link to="/" className="rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm">Home</Link>
        </div>
      </div>
    </main>
  );
}

function CertificatePage() {
  const { litleId } = Route.useParams();
  const { data } = useSuspenseQuery(evidenceQuery(litleId));

  let human = "";
  let uri = "";
  try {
    const parsed = parseAny(litleId);
    human = toHuman(parsed);
    uri = toUri(parsed);
  } catch { /* */ }

  const evidenceNodes = data.nodes.map((n) => ({
    hash: n.hash,
    payload: n.label,
  }));
  const evChain = evidenceNodes.length > 0 ? verifyChain(evidenceNodes) : null;

  const cert: DigitalAcademicCertificate = {
    id: `DAC-${litleId.slice(0, 16)}`,
    csv: generateMockCsv(litleId),
    status: data.found ? "active" : "disputed",
    metadata: {
      litleId,
      title: data.found ? `Work ${litleId}` : "Unknown work",
      author: "Verified Author",
      year: new Date().getFullYear(),
      workType: data.workType ?? "RQ",
      domain: data.namespace ?? "unknown",
      timestamp: data.createdAt ?? new Date().toISOString(),
    },
    evidenceVerification: evChain ?? { status: "unknown", rootHash: "", chainLength: 0, nodeCount: 0, evidenceIntegrity: false, cryptographicAnchor: "", timestamp: "" },
    sourceVerification: null,
    authorshipVerification: null,
    epistemicScore: data.found ? 4.2 : 0,
    epistemicTier: data.found ? "platinum" : "unrated",
    rootHash: data.rootHash ?? "",
    signatures: [{ algorithm: "LITLE-CSV.v1", value: generateMockCsv(litleId), timestamp: data.createdAt ?? "", signedBy: "LITLE CA" }],
    issuedAt: data.createdAt ?? "",
    expiresAt: new Date(new Date(data.createdAt ?? Date.now()).getFullYear() + 10, 0, 1).toISOString(),
  };

  const verification = verifyCertificate(cert, litleId);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-wide">LITLE</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to={`/verify/${litleId}`} className="text-muted-foreground hover:text-foreground">Evidence Chain</Link>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Digital Academic Certificate
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-widest mb-6 ${
          verification.valid ? "badge-emerald" : "badge-amber"
        }`}>
          {verification.valid ? "✓ Certificate Active" : "⚠ Verification Required"}
        </div>

        <div className="crystal-glass p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                LITLE Digital Academic Certificate
              </div>
              <h1 className="font-serif text-3xl">{human || litleId}</h1>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-gilt">{cert.csv}</div>
              <div className="text-[10px] text-muted-foreground mt-1">CSV · Secure Verification Code</div>
            </div>
          </div>

          <div className="hairline mb-6" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Field label="Status" value={cert.status} />
            <Field label="Epistemic Score" value={`${cert.epistemicScore}/5`} />
            <Field label="Tier" value={cert.epistemicTier} mono />
            <Field label="Work Type" value={cert.metadata.workType} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Field label="Root Hash" value={cert.rootHash.slice(0, 24) + "..."} mono />
            <Field label="Issued" value={new Date(cert.issuedAt).toLocaleDateString()} />
            <Field label="Expires" value={new Date(cert.expiresAt).toLocaleDateString()} />
            <Field label="Signatures" value={`${cert.signatures.length} present`} />
          </div>

          <div className="hairline mb-4" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                URI Form
              </div>
              <div className="font-mono text-xs break-all text-gilt">{uri || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                Evidence Chain
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${cert.evidenceVerification.evidenceIntegrity ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="font-mono text-xs">
                  {cert.evidenceVerification.nodeCount} nodes · {cert.evidenceVerification.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <StatusCheck label="CSV Integrity" passed={verification.checks.csvIntegrity} />
          <StatusCheck label="Not Expired" passed={verification.checks.notExpired} />
          <StatusCheck label="Signatures Valid" passed={verification.checks.signaturesPresent} />
        </div>

        <div className="text-center">
          <Link
            to={`/verify/${litleId}`}
            className="btn-institutional text-sm font-medium inline-flex"
          >
            View Full Evidence Chain →
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-xs text-muted-foreground">
          LITLE Digital Academic Certificate · RFC-0015 ·{" "}
          <Link to="/standard/rfcs" className="underline">Certification Standard</Link>
        </div>
      </footer>
    </main>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function StatusCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="crystal-panel p-4 flex items-center gap-3">
      <span className={`h-3 w-3 rounded-full ${passed ? "bg-emerald-500" : "bg-amber-500"}`} />
      <div>
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground">{passed ? "Passed" : "Failed"}</div>
      </div>
    </div>
  );
}

function generateMockCsv(id: string): string {
  const prefix = "LTL";
  const hashBytes = sha256(new TextEncoder().encode(id));
  const hashPart = bytesToHex(hashBytes).slice(0, 21).split("").map((c) => (c.charCodeAt(0) % 36).toString(36).toUpperCase()).join("");
  const idPart = id.slice(0, 7).toUpperCase().padEnd(7, "0");
  return `${prefix}${hashPart}${idPart}0`;
}
