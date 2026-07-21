import type { SubmissionDocument, TriangulationReport, PipelineResult } from "./types";
import { createSubmission, updateSubmissionStatus, getSubmission, getUserSubmissions, processQuarantineDecision, submitForIndexing, rejectSubmission } from "./quarantine";
import { runTriangulation } from "./triangulation";
export type { PipelineResult } from "./types";

export async function submitAndQuarantine(input: {
  userId: string;
  title: string;
  workType: string;
  abstract: string;
  content: string;
  repoUrl?: string;
  orcid: string;
  targetFederation?: string;
}): Promise<PipelineResult> {
  const submission = createSubmission(input);
  await updateSubmissionStatus(submission.id, "reviewing");
  return { submission };
}

export async function executeTriangulation(submissionId: string): Promise<PipelineResult> {
  const submission = getSubmission(submissionId);
  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  await updateSubmissionStatus(submissionId, "triangulating");

  const { report, evidence } = await runTriangulation(submission);
  const decision = await processQuarantineDecision(submission, report.overallResult, evidence);

  await updateSubmissionStatus(submissionId, decision.action === "index" ? "quarantine" : submission.status, {
    triangulationResult: report.overallResult,
    triangulationCompletedAt: report.completedAt,
  });

  if (decision.action === "index") {
    const litleId = await submitForIndexing(submission);
    return { submission: getSubmission(submissionId)!, report, decision, litleId };
  }

  if (decision.action === "reject") {
    await rejectSubmission(submission, decision.reason, evidence);
    return { submission: getSubmission(submissionId)!, report, decision };
  }

  return { submission: getSubmission(submissionId)!, report, decision };
}

export async function fastTrackSubmission(input: {
  userId: string;
  title: string;
  workType: string;
  abstract: string;
  content: string;
  repoUrl?: string;
  orcid: string;
  targetFederation?: string;
}): Promise<PipelineResult> {
  const quarantine = await submitAndQuarantine(input);
  return executeTriangulation(quarantine.submission.id);
}

export { getUserSubmissions, getSubmission };
