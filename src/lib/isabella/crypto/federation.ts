// ────────────────────────────────────────────────────────────────
// Isabella.Crypto — Federation & Cryptographic Sovereignty
// Máscaras de federación, firma y verificación de payloads
// ────────────────────────────────────────────────────────────────

import { createHash, randomBytes } from "crypto";
import type { FederationId, FederationMask } from "../types";

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

const FEDERATIONS: FederationId[] = ["FED-1", "FED-2", "FED-3", "FED-4", "FED-5", "FED-6", "FED-7"];

const SEK = process.env.MEXA_API_SECURE_KEY ?? "isabella-crypto-dev-key";

export function createFederationMask(federationId: FederationId, nodeId: string): FederationMask {
  if (!FEDERATIONS.includes(federationId)) throw new Error(`Federación inválida: ${federationId}`);
  const timestamp = Date.now();
  const raw = `${federationId}:${nodeId}:${timestamp}:${SEK}`;
  const signature = createHash("sha256").update(raw).digest("hex");
  return { federationId, nodeId, timestamp, signature };
}

export function verifyFederationMask(mask: FederationMask): VerificationResult {
  const raw = `${mask.federationId}:${mask.nodeId}:${mask.timestamp}:${SEK}`;
  const expected = createHash("sha256").update(raw).digest("hex");

  if (mask.signature !== expected) return { valid: false, federation: mask.federationId, node: mask.nodeId, reason: "invalid signature" };
  if (Date.now() - mask.timestamp > 300000) return { valid: false, federation: mask.federationId, node: mask.nodeId, reason: "mask expired (max 5min)" };
  if (!FEDERATIONS.includes(mask.federationId)) return { valid: false, federation: mask.federationId, node: mask.nodeId, reason: "unknown federation" };
  return { valid: true, federation: mask.federationId, node: mask.nodeId };
}

export function signPayload(payload: unknown, mask: FederationMask): SignedPayload {
  const nonce = randomBytes(16).toString("hex");
  const payloadStr = JSON.stringify(payload);
  const hash = createHash("sha256").update(`${payloadStr}:${mask.signature}:${nonce}`).digest("hex");
  return { payload, federationMask: mask, hash, nonce };
}

export function verifySignedPayload(signed: SignedPayload): VerificationResult {
  const maskResult = verifyFederationMask(signed.federationMask);
  if (!maskResult.valid) return maskResult;

  const payloadStr = JSON.stringify(signed.payload);
  const expected = createHash("sha256").update(`${payloadStr}:${signed.federationMask.signature}:${signed.nonce}`).digest("hex");

  if (signed.hash !== expected) return { valid: false, federation: signed.federationMask.federationId, node: signed.federationMask.nodeId, reason: "payload hash mismatch" };
  return { valid: true, federation: signed.federationMask.federationId, node: signed.federationMask.nodeId };
}

export function cryptoStatus(): { ok: boolean; federations: number } {
  return { ok: true, federations: FEDERATIONS.length };
}
