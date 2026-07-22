// ────────────────────────────────────────────────────────────────
// Mexa API — Cryptographic Sovereignty Layer
// Capa criptográfica del Sistema Operativo Cognitivo Soberano
// Firma digital, verificación de procedencia, máscara de federación
// ────────────────────────────────────────────────────────────────

import { createHash, randomBytes } from "crypto";

export type FederationMask = {
  federationId: string;
  nodeId: string;
  timestamp: number;
  signature: string;
};

export type SignedPayload = {
  payload: unknown;
  federationMask: FederationMask;
  hash: string;
  nonce: string;
};

export type VerificationResult = {
  valid: boolean;
  federation: string;
  node: string;
  reason?: string;
};

const FEDERATIONS = [
  "FED-1", "FED-2", "FED-3", "FED-4", "FED-5", "FED-6", "FED-7",
];

// ── Federation Mask ─────────────────────────────────────────────

export function createFederationMask(
  federationId: string,
  nodeId: string,
  secret: string
): FederationMask {
  if (!FEDERATIONS.includes(federationId)) {
    throw new Error(`Invalid federation: ${federationId}`);
  }
  const timestamp = Date.now();
  const raw = `${federationId}:${nodeId}:${timestamp}:${secret}`;
  const signature = createHash("sha256").update(raw).digest("hex");
  return { federationId, nodeId, timestamp, signature };
}

export function verifyFederationMask(
  mask: FederationMask,
  secret: string
): VerificationResult {
  const raw = `${mask.federationId}:${mask.nodeId}:${mask.timestamp}:${secret}`;
  const expectedSig = createHash("sha256").update(raw).digest("hex");

  if (mask.signature !== expectedSig) {
    return { valid: false, federation: mask.federationId, node: mask.nodeId, reason: "invalid signature" };
  }

  const age = Date.now() - mask.timestamp;
  if (age > 300000) {
    return { valid: false, federation: mask.federationId, node: mask.nodeId, reason: "mask expired" };
  }

  if (!FEDERATIONS.includes(mask.federationId)) {
    return { valid: false, federation: mask.federationId, node: mask.nodeId, reason: "unknown federation" };
  }

  return { valid: true, federation: mask.federationId, node: mask.nodeId };
}

// ── Payload Signing ─────────────────────────────────────────────

export function signPayload(
  payload: unknown,
  mask: FederationMask,
  secret: string
): SignedPayload {
  const nonce = randomBytes(16).toString("hex");
  const payloadStr = JSON.stringify(payload);
  const hash = createHash("sha256")
    .update(`${payloadStr}:${mask.signature}:${nonce}`)
    .digest("hex");

  return { payload, federationMask: mask, hash, nonce };
}

export function verifySignedPayload(
  signed: SignedPayload,
  secret: string
): VerificationResult {
  const maskResult = verifyFederationMask(signed.federationMask, secret);
  if (!maskResult.valid) return maskResult;

  const payloadStr = JSON.stringify(signed.payload);
  const expectedHash = createHash("sha256")
    .update(`${payloadStr}:${signed.federationMask.signature}:${signed.nonce}`)
    .digest("hex");

  if (signed.hash !== expectedHash) {
    return {
      valid: false,
      federation: signed.federationMask.federationId,
      node: signed.federationMask.nodeId,
      reason: "payload hash mismatch",
    };
  }

  return { valid: true, federation: signed.federationMask.federationId, node: signed.federationMask.nodeId };
}

// ── Mexa API Client ─────────────────────────────────────────────

export interface MexaApiClient {
  createMask: (fed: string, node: string) => FederationMask;
  sign: (payload: unknown, mask: FederationMask) => SignedPayload;
  verify: (signed: SignedPayload) => VerificationResult;
  health: () => { ok: boolean; federations: string[] };
}

export function createMexaClient(secret?: string): MexaApiClient {
  const key = secret ?? process.env.MEXA_API_SECURE_KEY ?? "mexa-dev-key";

  return {
    createMask: (fed: string, node: string) => createFederationMask(fed, node, key),
    sign: (payload: unknown, mask: FederationMask) => signPayload(payload, mask, key),
    verify: (signed: SignedPayload) => verifySignedPayload(signed, key),
    health: () => ({ ok: true, federations: FEDERATIONS }),
  };
}
