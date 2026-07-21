import { shake256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";
import { quantumFingerprint, fingerprintSimilarity, gateSequenceSimilarity, type QuantumFingerprint } from "./gates";

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export type DataSource = "orcid" | "doi" | "isni" | "crossref" | "web" | "litle_library" | "quantum_state";

export interface DataTrace {
  source: DataSource;
  identifier: string;
  fingerprint: QuantumFingerprint;
  gateSequence: number[];
  entanglementEnergy: number;
  timestamp: string;
  metadata: Record<string, string>;
}

export interface TraceLink {
  sourceA: string;
  sourceB: string;
  fingerprintSimilarity: number;
  gateSequenceSimilarity: number;
  entanglementCorrelation: number;
  combinedScore: number;
  isMatch: boolean;
}

export interface DataInterconnectionReport {
  traces: DataTrace[];
  links: TraceLink[];
  authorshipConfidence: number;
  corroborationScore: number;
  uniqueSources: number;
  verified: boolean;
}

function deriveTraceIdentifier(source: DataSource, data: Uint8Array): string {
  const domainSep = new TextEncoder().encode(`litle-quantum-interconnect|${source}|`);
  return bytesToHex(shake256(concatBytes(domainSep, data), { dkLen: 16 }));
}

function computeEntanglementEnergy(a: QuantumFingerprint, b: QuantumFingerprint): number {
  const sim = fingerprintSimilarity(a, b);
  const gsSim = gateSequenceSimilarity(a.gateSequence, b.gateSequence);
  return (1 - sim) * (1 - gsSim);
}

export function createTrace(
  source: DataSource,
  identifier: string,
  data: Uint8Array,
  metadata?: Record<string, string>,
): DataTrace {
  const fingerprint = quantumFingerprint(data);
  const entanglementEnergy = 0;
  return {
    source,
    identifier,
    fingerprint,
    gateSequence: fingerprint.gateSequence,
    entanglementEnergy,
    timestamp: new Date().toISOString(),
    metadata: metadata ?? {},
  };
}

function createTraceLink(traceA: DataTrace, traceB: DataTrace): TraceLink {
  const fpsim = fingerprintSimilarity(traceA.fingerprint, traceB.fingerprint);
  const gsSim = gateSequenceSimilarity(traceA.gateSequence, traceB.gateSequence);
  const ec = computeEntanglementEnergy(traceA.fingerprint, traceB.fingerprint);
  const combined = (fpsim + gsSim + (1 - ec)) / 3;
  return {
    sourceA: `${traceA.source}:${traceA.identifier}`,
    sourceB: `${traceB.source}:${traceB.identifier}`,
    fingerprintSimilarity: fpsim,
    gateSequenceSimilarity: gsSim,
    entanglementCorrelation: ec,
    combinedScore: combined,
    isMatch: combined > 0.7,
  };
}

export function computeCorroboration(
  traces: DataTrace[],
): DataInterconnectionReport {
  if (traces.length === 0) {
    return {
      traces: [],
      links: [],
      authorshipConfidence: 0,
      corroborationScore: 0,
      uniqueSources: 0,
      verified: false,
    };
  }

  const links: TraceLink[] = [];
  for (let i = 0; i < traces.length; i++) {
    for (let j = i + 1; j < traces.length; j++) {
      links.push(createTraceLink(traces[i], traces[j]));
    }
  }

  const validLinks = links.filter(l => l.isMatch);
  const corroborationScore = traces.length > 1
    ? validLinks.length / (traces.length * (traces.length - 1) / 2)
    : 0;

  const uniqueSources = new Set(traces.map(t => t.source)).size;

  const avgFpsim = links.length > 0
    ? links.reduce((s, l) => s + l.fingerprintSimilarity, 0) / links.length
    : 0;

  const avgGssim = links.length > 0
    ? links.reduce((s, l) => s + l.gateSequenceSimilarity, 0) / links.length
    : 0;

  const authorshipConfidence = (avgFpsim * 0.4 + avgGssim * 0.3 + corroborationScore * 0.3);

  return {
    traces,
    links,
    authorshipConfidence,
    corroborationScore,
    uniqueSources,
    verified: authorshipConfidence > 0.75 && uniqueSources >= 2,
  };
}

export function traceAuthor(
  content: Uint8Array,
  sourceTraces: Array<{ source: DataSource; identifier: string; data: Uint8Array; metadata?: Record<string, string> }>,
): DataInterconnectionReport {
  const traces = sourceTraces.map(st =>
    createTrace(st.source, st.identifier, st.data, st.metadata),
  );

  const contentTrace = createTrace("litle_library", "content", content, { type: "submission" });
  traces.push(contentTrace);

  return computeCorroboration(traces);
}

export function authorshipCrossReference(
  submissionContent: string,
  orcidData?: string,
  doiData?: string,
  isniData?: string,
): DataInterconnectionReport {
  const encoder = new TextEncoder();
  const traces: Array<{ source: DataSource; identifier: string; data: Uint8Array; metadata?: Record<string, string> }> = [];

  traces.push({ source: "litle_library", identifier: "content", data: encoder.encode(submissionContent) });

  if (orcidData) {
    traces.push({ source: "orcid", identifier: `orcid-${shake256(encoder.encode(orcidData), { dkLen: 8 })}`, data: encoder.encode(orcidData), metadata: { type: "orcid_profile" } });
  }
  if (doiData) {
    traces.push({ source: "doi", identifier: `doi-${shake256(encoder.encode(doiData), { dkLen: 8 })}`, data: encoder.encode(doiData), metadata: { type: "doi_record" } });
  }
  if (isniData) {
    traces.push({ source: "isni", identifier: `isni-${shake256(encoder.encode(isniData), { dkLen: 8 })}`, data: encoder.encode(isniData), metadata: { type: "isni_record" } });
  }

  return traceAuthor(encoder.encode(submissionContent), traces);
}

export function quantumDataInterconnect(): string {
  return "LITLE-QUANTUM-INTERCONNECT-v1";
}
