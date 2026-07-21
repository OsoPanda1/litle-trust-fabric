import type { SubmissionDocument, SubmissionStatus, TriangulationResult, QuarantineDecision, DuplicateEvidence } from "./types";

const encoder = new TextEncoder();

interface QuarantineStore {
  submissions: Map<string, SubmissionDocument>;
}

const store: QuarantineStore = {
  submissions: new Map(),
};

function sha256Hex(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const abs = Math.abs(hash);
  return abs.toString(16).padStart(8, "0") + (abs * 7).toString(16).slice(0, 8);
}

function generateId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QRN-${ts}-${rand}`;
}

export function createSubmission(input: {
  userId: string;
  title: string;
  workType: string;
  abstract: string;
  content: string;
  repoUrl?: string;
  orcid: string;
  targetFederation?: string;
}): SubmissionDocument {
  const now = new Date().toISOString();
  const evidenceHash = sha256Hex(input.content + input.title + input.orcid);

  const doc: SubmissionDocument = {
    id: generateId(),
    userId: input.userId,
    title: input.title,
    workType: input.workType,
    abstract: input.abstract,
    content: input.content,
    repoUrl: input.repoUrl,
    orcid: input.orcid,
    targetFederation: input.targetFederation,
    status: "quarantine",
    triangulationResult: "pending",
    quarantineStartedAt: now,
    triangulationCompletedAt: null,
    indexedAt: null,
    litleId: null,
    evidenceHash,
    createdAt: now,
    updatedAt: now,
  };

  store.submissions.set(doc.id, doc);
  return doc;
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  updates?: Partial<SubmissionDocument>,
): Promise<SubmissionDocument | null> {
  const doc = store.submissions.get(id);
  if (!doc) return null;
  doc.status = status;
  doc.updatedAt = new Date().toISOString();
  if (updates) Object.assign(doc, updates);
  store.submissions.set(id, doc);
  return doc;
}

export function getSubmission(id: string): SubmissionDocument | null {
  return store.submissions.get(id) ?? null;
}

export function getUserSubmissions(userId: string): SubmissionDocument[] {
  return Array.from(store.submissions.values()).filter((s) => s.userId === userId);
}

export function getQuarantineQueue(): SubmissionDocument[] {
  return Array.from(store.submissions.values()).filter(
    (s) => s.status === "quarantine" || s.status === "reviewing" || s.status === "triangulating",
  );
}

export async function processQuarantineDecision(
  submission: SubmissionDocument,
  triangulationResult: TriangulationResult,
  evidence: DuplicateEvidence[],
): Promise<QuarantineDecision> {
  if (triangulationResult === "green") {
    return {
      action: "index",
      reason: "Triangulation complete: no existing registrations found. Author identity verified. Ready for LITLE-ID issuance.",
      evidence,
      confidence: 0.95,
    };
  }

  if (triangulationResult === "red") {
    const primaryEvidence = evidence[0];
    return {
      action: "reject",
      reason: primaryEvidence
        ? `Duplicate detected: ${primaryEvidence.type.toUpperCase()} ${primaryEvidence.identifier} references existing work. Author notified with citation details.`
        : "Existing registration detected. Submission rejected pending author clarification.",
      evidence,
      confidence: 0.9,
    };
  }

  return {
    action: "escalate",
    reason: "Triangulation inconclusive — automated checks could not verify originality. Requires manual review by curation federation.",
    evidence,
    confidence: 0.3,
  };
}

export async function submitForIndexing(submission: SubmissionDocument): Promise<string> {
  const litleId = `LTL-${new Date().getFullYear()}-RQ-${submission.id.slice(-4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  await updateSubmissionStatus(submission.id, "indexed", {
    litleId,
    indexedAt: new Date().toISOString(),
    triangulationResult: "green",
  });
  return litleId;
}

export async function rejectSubmission(
  submission: SubmissionDocument,
  reason: string,
  evidence: DuplicateEvidence[],
): Promise<void> {
  const evidenceSummary = evidence.map((e) => `${e.type.toUpperCase()}: ${e.identifier}`).join("; ");
  await updateSubmissionStatus(submission.id, "duplicate", {
    triangulationResult: "red",
    triangulationCompletedAt: new Date().toISOString(),
  });
}
