export type SubmissionStatus =
  | "draft"
  | "quarantine"
  | "reviewing"
  | "triangulating"
  | "indexed"
  | "rejected"
  | "duplicate";

export type TriangulationResult = "pending" | "green" | "red" | "inconclusive";

export interface SubmissionDocument {
  id: string;
  userId: string;
  title: string;
  workType: string;
  abstract: string;
  content: string;
  repoUrl?: string;
  orcid: string;
  targetFederation?: string;
  status: SubmissionStatus;
  triangulationResult: TriangulationResult;
  quarantineStartedAt: string | null;
  triangulationCompletedAt: string | null;
  indexedAt: string | null;
  litleId: string | null;
  evidenceHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface TriangulationCheck {
  source: string;
  found: boolean;
  match: string | null;
  confidence: number;
  detail: string;
}

export interface TriangulationReport {
  submissionId: string;
  checks: TriangulationCheck[];
  overallResult: TriangulationResult;
  summary: string;
  completedAt: string;
}

export interface DuplicateEvidence {
  type: "orcid" | "doi" | "isni" | "crossref" | "web";
  identifier: string;
  existingWorkTitle: string;
  existingWorkUrl: string;
  matchScore: number;
}

export interface QuarantineDecision {
  action: "index" | "reject" | "escalate";
  reason: string;
  evidence: DuplicateEvidence[];
  confidence: number;
}
