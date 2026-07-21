import { sha256 } from "@noble/hashes/sha2.js";
import { shake256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";
import { generateCsv, verifyCsv } from "./csv";
import { compareProfiles, type WritingProfile } from "./authorship";
import { runVerification, type DataSource, type SourceVerificationResult } from "./source-verification";
import { verifyChain, type VerificationResult, type HashProfile } from "./engine";
import { getPqcProvider, concat, entropyBytes } from "@/lib/litle/pqc";
import { getQualityTier } from "@/lib/epistemic/filters";

export type CertificateStatus = "active" | "revoked" | "expired" | "disputed";
export type CertificateSuite = "classic" | "pqc" | "dual";

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

export interface SignatureEntry {
  algorithm: string;
  value: string;
  timestamp: string;
  signedBy: string;
  hashProfile?: HashProfile;
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
  signatures: SignatureEntry[];
  issuedAt: string;
  expiresAt: string;
  suite: CertificateSuite;
  pqcPublicKey?: string;
}

const encoder = new TextEncoder();

function validateMetadata(m: CertificateMetadata): void {
  if (!/^LTL-\d{4}-[A-Z]{2}-[0-9A-F]{4}-[0-9A-F]{4}$/.test(m.litleId) && !m.litleId.startsWith("litle:")) {
    throw new Error(`Invalid LITLE-ID format: ${m.litleId}`);
  }
  if (!Number.isInteger(m.year) || m.year < 1900 || m.year > 2099) {
    throw new Error(`Invalid year: ${m.year}`);
  }
  if (!m.title || m.title.length > 500) throw new Error("Title must be 1-500 chars");
  if (!m.author || m.author.length > 200) throw new Error("Author must be 1-200 chars");
}

export function generateCertificate(
  metadata: CertificateMetadata,
  content: string,
  options?: {
    writingProfile?: WritingProfile;
    sources?: DataSource[];
    evidenceNodes?: Array<{ hash: string; payload: string; parentHash?: string }>;
    suite?: CertificateSuite;
    pqcSecretKey?: string;
  },
): DigitalAcademicCertificate {
  const now = new Date();
  const expiry = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
  const suite: CertificateSuite = options?.suite ?? "classic";

  validateMetadata(metadata);

  const csvResult = generateCsv({ documentId: metadata.litleId, content });
  const hashProfile: HashProfile = suite === "pqc" || suite === "dual" ? "SHAKE256" : "SHA-256";
  const contentBytes = encoder.encode(content);
  const documentHash = hashProfile === "SHAKE256"
    ? bytesToHex(shake256(contentBytes, { dkLen: 32 }))
    : bytesToHex(sha256(contentBytes));

  let evidenceVerification: VerificationResult = {
    status: "unknown",
    rootHash: documentHash,
    chainLength: 0,
    nodeCount: 0,
    evidenceIntegrity: false,
    cryptographicAnchor: documentHash.slice(0, 16),
    verifiedAt: now.toISOString(),
    hashProfile,
  };

  if (options?.evidenceNodes && options.evidenceNodes.length > 0) {
    evidenceVerification = verifyChain(options.evidenceNodes, hashProfile);
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

  const signatures: SignatureEntry[] = [
    {
      algorithm: "LITLE-CSV.v1",
      value: csvResult.csv,
      timestamp: now.toISOString(),
      signedBy: "LITLE Certificate Authority",
      hashProfile: "SHA-256",
    },
    {
      algorithm: hashProfile,
      value: documentHash,
      timestamp: now.toISOString(),
      signedBy: "LITLE Evidence Chain",
      hashProfile,
    },
  ];

  let pqcPublicKey: string | undefined;

  if (suite === "pqc" || suite === "dual") {
    const provider = getPqcProvider("L-PQC.v1");
    const seedMaterial = options?.pqcSecretKey
      ? shake256(encoder.encode(options.pqcSecretKey + metadata.litleId), { dkLen: 64 })
      : entropyBytes(64);
    const keyPair = provider.generateKey(seedMaterial);
    const msgToSign = encoder.encode(documentHash + "|" + metadata.litleId + "|" + metadata.title);
    const sig = provider.sign(keyPair.secretKey, msgToSign);

    signatures.push({
      algorithm: "ML-DSA-87 (Dilithium5)",
      value: bytesToHex(sig.value),
      timestamp: now.toISOString(),
      signedBy: "LITLE PQC Authority",
      hashProfile: "SHAKE256",
    });

    pqcPublicKey = bytesToHex(keyPair.publicKey);

    if (suite === "dual") {
      const bridgeMsg = encoder.encode(documentHash + "|" + metadata.litleId);
      const bridgeSig = sha256(bridgeMsg);
      signatures.push({
        algorithm: "SHA-256-BRIDGE",
        value: bytesToHex(bridgeSig),
        timestamp: now.toISOString(),
        signedBy: "LITLE Dual Bridge",
        hashProfile: "SHA-256",
      });
    }
  }

  const epistemicBase = metadata.year > 2020 ? 3.5 : 2.5;
  const quantumBoost = suite === "pqc" || suite === "dual" ? 0.3 : 0;
  const epistemicScore = Math.min(5, parseFloat((epistemicBase + quantumBoost).toFixed(1)));
  const epistemicTier = getQualityTier(epistemicScore);

  const certId = `DAC-${csvResult.csv.slice(0, 16)}`;

  return {
    id: certId,
    csv: csvResult.csv,
    status: "active",
    metadata,
    evidenceVerification,
    sourceVerification,
    authorshipVerification,
    epistemicScore,
    epistemicTier,
    rootHash: evidenceVerification.rootHash,
    signatures,
    issuedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    suite,
    pqcPublicKey,
  };
}

export function verifyCertificate(
  cert: DigitalAcademicCertificate,
  content: string,
): {
  valid: boolean;
  checks: Record<string, boolean>;
  pqcVerified?: boolean;
} {
  const csvValid = verifyCsv(cert.csv, { documentId: cert.metadata.litleId, content });
  const notExpired = new Date(cert.expiresAt) > new Date();

  const checks: Record<string, boolean> = {
    csvIntegrity: csvValid,
    notExpired,
    evidenceChain: cert.evidenceVerification.evidenceIntegrity,
    signaturesPresent: cert.signatures.length > 0,
  };

  let pqcVerified: boolean | undefined;

  if (cert.suite === "pqc" || cert.suite === "dual") {
    const pqcSig = cert.signatures.find((s) => s.algorithm === "ML-DSA-87 (Dilithium5)");
    if (pqcSig && cert.pqcPublicKey) {
      try {
        const provider = getPqcProvider("L-PQC.v1");
        const pk = hexToBytes(cert.pqcPublicKey);
        const sigBytes = hexToBytes(pqcSig.value);
        const dHash = cert.signatures.find((s) => s.hashProfile === "SHAKE256")?.value ?? cert.rootHash;
        const msg = new TextEncoder().encode(dHash + "|" + cert.metadata.litleId + "|" + cert.metadata.title);
        pqcVerified = provider.verify(pk, msg, sigBytes);
        checks.pqcSignature = pqcVerified;
      } catch {
        checks.pqcSignature = false;
      }
    }
  }

  const valid = Object.values(checks).every(Boolean);
  return { valid, checks, pqcVerified };
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = hex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) ?? [];
  return new Uint8Array(bytes);
}
