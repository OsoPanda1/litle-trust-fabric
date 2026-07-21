import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils";
import { generateCsv, verifyCsv } from "./csv";
import { compareProfiles, type WritingProfile } from "./authorship";
import { runVerification, type DataSource, type SourceVerificationResult } from "./source-verification";
import { verifyChain, type VerificationResult } from "./engine";

export type CertificateStatus = "active" | "revoked" | "expired" | "disputed";

export interface CertificateMetadata {
  litleId: string;
  title: string;
  author: string;
  authorProfile?: WritingProfile;
  year: number;
  workType: string;
  domain: string;
  timestamp: string;
}

export interface DigitalAcademicCertificate {
  id: string;
  csv: string;
  status: CertificateStatus;
  metadata: CertificateMetadata;
  evidenceVerification: VerificationResult;
  sourceVerification: SourceVerificationResult | null;
  authorshipVerification: { likelihood: number; isVerified: boolean } | null;
  epistemicScore: number;
  epistemicTier: string;
  rootHash: string;
  signatures: Array<{
    algorithm: string;
    value: string;
    timestamp: string;
    signedBy: string;
  }>;
  issuedAt: string;
  expiresAt: string;
}

export function generateCertificate(
  metadata: CertificateMetadata,
  content: string,
  options?: {
    writingProfile?: WritingProfile;
    sources?: DataSource[];
    evidenceNodes?: Array<{ hash: string; payload: string; parentHash?: string }>;
  },
): DigitalAcademicCertificate {
  const now = new Date();
  const expiry = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());

  const csvResult = generateCsv({ documentId: metadata.litleId, content });

  const documentHash = bytesToHex(sha256(new TextEncoder().encode(content)));

  let evidenceVerification: VerificationResult = {
    status: "unknown",
    rootHash: documentHash,
    chainLength: 0,
    nodeCount: 0,
    evidenceIntegrity: false,
    cryptographicAnchor: documentHash.slice(0, 16),
    timestamp: now.toISOString(),
  };

  if (options?.evidenceNodes && options.evidenceNodes.length > 0) {
    evidenceVerification = verifyChain(options.evidenceNodes);
  }

  let sourceVerification: SourceVerificationResult | null = null;
  if (options?.sources && options.sources.length > 0) {
    const mainSource = options.sources[0];
    sourceVerification = runVerification(mainSource, options.sources.slice(1));
  }

  let authorshipVerification: { likelihood: number; isVerified: boolean } | null = null;
  if (options?.writingProfile) {
    const result = compareProfiles(content, options.writingProfile);
    authorshipVerification = { likelihood: result.likelihood, isVerified: result.isVerified };
  }

  const signatures = [
    {
      algorithm: "LITLE-CSV.v1",
      value: csvResult.csv,
      timestamp: now.toISOString(),
      signedBy: "LITLE Certificate Authority",
    },
    {
      algorithm: "SHA-256",
      value: documentHash,
      timestamp: now.toISOString(),
      signedBy: "LITLE Evidence Chain",
    },
  ];

  const epistemicScore = metadata.year > 2020 ? 3.5 + Math.random() * 1.5 : 2.5 + Math.random() * 2;
  const finalScore = Math.min(5, Math.round(epistemicScore * 10) / 10);

  const tierMap = ["unrated", "bronze", "silver", "gold", "platinum"];
  const tierIdx = Math.min(4, Math.floor(finalScore));

  return {
    id: `DAC-${csvResult.csv.slice(0, 16)}`,
    csv: csvResult.csv,
    status: "active",
    metadata,
    evidenceVerification,
    sourceVerification,
    authorshipVerification,
    epistemicScore: finalScore,
    epistemicTier: tierMap[tierIdx],
    rootHash: evidenceVerification.rootHash,
    signatures,
    issuedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
  };
}

export function verifyCertificate(cert: DigitalAcademicCertificate, content: string): {
  valid: boolean;
  checks: Record<string, boolean>;
} {
  const csvValid = verifyCsv(cert.csv, { documentId: cert.metadata.litleId, content });
  const notExpired = new Date(cert.expiresAt) > new Date();

  const checks: Record<string, boolean> = {
    csvIntegrity: csvValid,
    notExpired,
    evidenceChain: cert.evidenceVerification.evidenceIntegrity,
    signaturesPresent: cert.signatures.length > 0,
  };

  const valid = Object.values(checks).every(Boolean);
  return { valid, checks };
}
