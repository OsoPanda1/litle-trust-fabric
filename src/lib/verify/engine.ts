import { sha256 } from "@noble/hashes/sha2.js";
import { shake256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";
import { concat } from "@/lib/litle/pqc";

export type HashProfile = "SHA-256" | "SHAKE256";

export interface VerificationResult {
  status: "verified" | "revoked" | "unknown";
  rootHash: string;
  chainLength: number;
  nodeCount: number;
  evidenceIntegrity: boolean;
  cryptographicAnchor: string;
  verifiedAt: string;
  hashProfile: HashProfile;
}

export interface OCSPVerification {
  status: "good" | "revoked" | "unknown";
  message: string;
  responderId?: string;
  producedAt?: string;
}

function hashFn(data: Uint8Array, profile: HashProfile): Uint8Array {
  return profile === "SHAKE256" ? shake256(data, { dkLen: 32 }) : sha256(data);
}

export function verifyEvidenceIntegrity(
  nodes: Array<{ hash: string; payload: string; parentHash?: string }>,
  profile: HashProfile = "SHA-256",
): { integrity: boolean; chainValid: boolean } {
  for (const node of nodes) {
    const computed = bytesToHex(hashFn(new TextEncoder().encode(node.payload), profile));
    if (computed !== node.hash) return { integrity: false, chainValid: false };
  }
  const chainValid = nodes.every((node, i) => {
    if (i === 0) return node.parentHash === undefined || node.parentHash === null;
    return node.parentHash === nodes[i - 1].hash;
  });
  return { integrity: true, chainValid };
}

export function buildMerkleRoot(
  hashes: string[],
  profile: HashProfile = "SHA-256",
): string {
  if (hashes.length === 0) return "";
  if (hashes.length === 1) return hashes[0];
  const next: string[] = [];
  const encoder = new TextEncoder();
  for (let i = 0; i < hashes.length; i += 2) {
    if (i + 1 < hashes.length) {
      const left = encoder.encode(hashes[i]);
      const right = encoder.encode(hashes[i + 1]);
      const combined = bytesToHex(hashFn(concat(left, right), profile));
      next.push(combined);
    } else {
      next.push(hashes[i]);
    }
  }
  return buildMerkleRoot(next, profile);
}

export function verifyChain(
  nodes: Array<{ hash: string; payload: string; parentHash?: string }>,
  profile: HashProfile = "SHA-256",
): VerificationResult {
  const { integrity, chainValid } = verifyEvidenceIntegrity(nodes, profile);
  const hashes = nodes.map((n) => n.hash);
  const rootHash = buildMerkleRoot(hashes, profile);

  return {
    status: integrity && chainValid ? "verified" : "unknown",
    rootHash,
    chainLength: nodes.length,
    nodeCount: nodes.length,
    evidenceIntegrity: integrity,
    cryptographicAnchor: rootHash.slice(0, 16),
    verifiedAt: new Date().toISOString(),
    hashProfile: profile,
  };
}
