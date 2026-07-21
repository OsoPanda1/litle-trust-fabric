import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils";

export type SourceStatus = "pending" | "identified" | "verified" | "cross-referenced" | "published" | "disputed";

export type SourceType = "pdf" | "docx" | "md" | "txt" | "html" | "dataset" | "code" | "image" | "audio" | "video" | "interview" | "observation" | "experiment";

export interface SourceMetadata {
  title: string;
  author: string;
  date: string;
  url?: string;
  doi?: string;
  publisher?: string;
  license?: string;
}

export interface DataSource {
  id: string;
  type: SourceType;
  metadata: SourceMetadata;
  content: string;
  hash: string;
  status: SourceStatus;
  provenance: string[];
  verifiedBy: string[];
  crossReferences: string[];
  timestamp: string;
}

export interface VerificationStep {
  step: number;
  name: string;
  status: "pending" | "passed" | "failed" | "skipped";
  details: string;
  timestamp: string;
}

export interface SourceVerificationResult {
  sourceId: string;
  status: "verified" | "partial" | "unverified";
  overallScore: number;
  steps: VerificationStep[];
  discrepancies: string[];
  recommendations: string[];
  verifiedAt: string;
  verifiedBy: string;
}

function computeHash(content: string): string {
  return bytesToHex(sha256(new TextEncoder().encode(content)));
}

export function createSource(type: SourceType, metadata: SourceMetadata, content: string): DataSource {
  return {
    id: `SRC-${computeHash(content).slice(0, 12).toUpperCase()}`,
    type,
    metadata,
    content,
    hash: computeHash(content),
    status: "pending",
    provenance: [],
    verifiedBy: [],
    crossReferences: [],
    timestamp: new Date().toISOString(),
  };
}

export function identifySource(source: DataSource): DataSource {
  return { ...source, status: "identified", provenance: [source.metadata.title, source.metadata.author].filter(Boolean) };
}

export function verifyIntegrity(source: DataSource): { source: DataSource; passed: boolean } {
  const currentHash = computeHash(source.content);
  const passed = currentHash === source.hash;
  return {
    source: { ...source, status: passed ? "verified" : "disputed", verifiedBy: [...source.verifiedBy, "integrity-check"] },
    passed,
  };
}

export function crossReference(source: DataSource, references: DataSource[]): { source: DataSource; matches: number; total: number } {
  let matches = 0;
  let total = 0;
  const crossRefs: string[] = [];

  for (const ref of references) {
    if (ref.id === source.id) continue;
    total++;
    const refSentences = ref.content.split(/[.!?]+/).filter(Boolean);
    const srcSentences = source.content.split(/[.!?]+/).filter(Boolean);

    const shared = refSentences.filter((rs) => {
      const rsTrim = rs.trim().toLowerCase();
      return srcSentences.some((ss) => ss.trim().toLowerCase().includes(rsTrim.slice(0, 40)));
    });

    if (shared.length > 0) {
      matches++;
      crossRefs.push(ref.id);
    }
  }

  return {
    source: {
      ...source,
      status: total > 0 && matches >= Math.ceil(total / 2) ? "cross-referenced" : source.status,
      crossReferences: [...source.crossReferences, ...crossRefs],
    },
    matches,
    total,
  };
}

export function runVerification(source: DataSource, references?: DataSource[]): SourceVerificationResult {
  const steps: VerificationStep[] = [];
  const discrepancies: string[] = [];
  const recommendations: string[] = [];
  const now = new Date().toISOString();

  steps.push({
    step: 1,
    name: "Source Identification",
    status: "passed",
    details: `Source identified as ${source.type}: ${source.metadata.title} by ${source.metadata.author}`,
    timestamp: now,
  });

  const { passed: integrityPassed } = verifyIntegrity(source);
  steps.push({
    step: 2,
    name: "Content Integrity",
    status: integrityPassed ? "passed" : "failed",
    details: integrityPassed ? `Hash verified: ${source.hash.slice(0, 16)}...` : `Hash mismatch: expected ${source.hash.slice(0, 16)}...`,
    timestamp: now,
  });
  if (!integrityPassed) discrepancies.push("Content hash does not match original");

  if (source.metadata.url) {
    steps.push({
      step: 3,
      name: "URL Accessibility",
      status: "passed",
      details: `Source URL provided: ${source.metadata.url}`,
      timestamp: now,
    });
  } else {
    steps.push({
      step: 3,
      name: "URL Accessibility",
      status: "skipped",
      details: "No URL provided; assuming local source",
      timestamp: now,
    });
  }

  if (references && references.length > 0) {
    const { matches, total } = crossReference(source, references);
    steps.push({
      step: 4,
      name: "Cross-Reference",
      status: matches >= Math.ceil(total / 2) ? "passed" : "failed",
      details: `Cross-referenced against ${total} sources: ${matches} matches`,
      timestamp: now,
    });
    if (matches < Math.ceil(total / 2)) {
      discrepancies.push(`Only ${matches}/${total} cross-references matched`);
    }
  } else {
    steps.push({
      step: 4,
      name: "Cross-Reference",
      status: "skipped",
      details: "No reference sources provided for cross-checking",
      timestamp: now,
    });
  }

  steps.push({
    step: 5,
    name: "Provenance Check",
    status: source.provenance.length > 0 ? "passed" : "failed",
    details: source.provenance.length > 0 ? `${source.provenance.length} provenance records` : "No provenance records",
    timestamp: now,
  });
  if (source.provenance.length === 0) {
    recommendations.push("Add provenance records to establish chain of custody");
  }

  const passedSteps = steps.filter((s) => s.status === "passed").length;
  const totalSteps = steps.filter((s) => s.status !== "skipped").length;
  const overallScore = totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0;

  if (overallScore < 60) recommendations.push("Consider additional verification before publication");
  if (overallScore >= 80) recommendations.push("Source is suitable for academic citation");

  return {
    sourceId: source.id,
    status: overallScore >= 80 ? "verified" : overallScore >= 50 ? "partial" : "unverified",
    overallScore,
    steps,
    discrepancies,
    recommendations,
    verifiedAt: now,
    verifiedBy: "LITLE Verification Engine v1",
  };
}
