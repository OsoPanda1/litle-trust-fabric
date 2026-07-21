import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils";

export interface VerificationResult {
  status: "verified" | "revoked" | "unknown";
  rootHash: string;
  chainLength: number;
  nodeCount: number;
  evidenceIntegrity: boolean;
  cryptographicAnchor: string;
  timestamp: string;
}

export interface OCSPVerification {
  status: "good" | "revoked" | "unknown";
  message: string;
  responderId?: string;
  producedAt?: string;
}

export function verifyEvidenceIntegrity(nodes: Array<{ hash: string; payload: string; parentHash?: string }>): boolean {
  for (const node of nodes) {
    const computed = bytesToHex(sha256(new TextEncoder().encode(node.payload)));
    if (computed !== node.hash) return false;
  }
  return true;
}

export function buildMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return "";
  if (hashes.length === 1) return hashes[0];
  const next: string[] = [];
  for (let i = 0; i < hashes.length; i += 2) {
    if (i + 1 < hashes.length) {
      const combined = bytesToHex(sha256(new TextEncoder().encode(hashes[i] + hashes[i + 1])));
      next.push(combined);
    } else {
      next.push(hashes[i]);
    }
  }
  return buildMerkleRoot(next);
}

export function verifyChain(nodes: Array<{ hash: string; payload: string; parentHash?: string }>): VerificationResult {
  const integrity = verifyEvidenceIntegrity(nodes);
  const hashes = nodes.map((n) => n.hash);
  const rootHash = buildMerkleRoot(hashes);

  return {
    status: integrity ? "verified" : "unknown",
    rootHash,
    chainLength: nodes.length,
    nodeCount: nodes.length,
    evidenceIntegrity: integrity,
    cryptographicAnchor: rootHash.slice(0, 16),
    timestamp: new Date().toISOString(),
  };
}
