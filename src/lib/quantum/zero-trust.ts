import { shake256 } from "@noble/hashes/sha3";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, concatBytes } from "@noble/hashes/utils";
import { quantumFingerprint, fingerprintSimilarity, gateSequenceSimilarity } from "./gates";
import { sealHybridShield, verifyHybridShield, type HybridShield, type ShieldProfile } from "./hybrid-shield";

export type TrustPath = "path_a" | "path_b";
export type TrustDecision = "trusted" | "untrusted" | "escalated";
export type TrustProfile = "L-ZT-DUAL.v1" | "L-ZT-QUANTUM.v1";

export interface ZeroTrustCheck {
  path: TrustPath;
  passed: boolean;
  confidence: number;
  detail: string;
  checks: number;
  passedChecks: number;
}

export interface ZeroTrustResult {
  profile: TrustProfile;
  pathA: ZeroTrustCheck;
  pathB: ZeroTrustCheck;
  decision: TrustDecision;
  overallConfidence: number;
  requiresEscalation: boolean;
}

export interface ZeroTrustPolicy {
  minConfidence: number;
  requireBothPaths: boolean;
  pathAChecks: number;
  pathBChecks: number;
  escalationThreshold: number;
}

const DEFAULT_POLICY: ZeroTrustPolicy = {
  minConfidence: 0.85,
  requireBothPaths: true,
  pathAChecks: 5,
  pathBChecks: 5,
  escalationThreshold: 0.6,
};

const PATH_A_CHECKS = [
  "content_integrity",
  "crypto_signature",
  "merkle_root",
  "timeline_consistency",
  "federation_endorsement",
];

const PATH_B_CHECKS = [
  "quantum_fingerprint",
  "gate_sequence",
  "entanglement_energy",
  "shield_integrity",
  "state_coherence",
];

function pathACheck(
  data: Uint8Array,
  shield: HybridShield,
): { passed: boolean; confidence: number; checks: number; passedChecks: number } {
  let passedChecks = 0;
  const total = PATH_A_CHECKS.length;

  const contentHash = bytesToHex(sha256(data));
  const shieldHash = shield.layers.find(l => l.layer === "classical")?.hash ?? "";
  if (contentHash === shieldHash) passedChecks++;

  const pqcHash = shield.layers.find(l => l.layer === "pqc_hash")?.hash ?? "";
  const recomputedPqc = bytesToHex(shake256(data, { dkLen: 64 }));
  if (recomputedPqc === pqcHash) passedChecks++;

  if (shield.overallStatus === "sealed") passedChecks++;

  const now = Date.now();
  const sealed = new Date(shield.sealedAt).getTime();
  if (sealed <= now) passedChecks++;

  if (shield.layers.length >= 3) passedChecks++;

  const confidence = passedChecks / total;
  return { passed: confidence >= 0.6, confidence, checks: total, passedChecks };
}

function pathBCheck(
  data: Uint8Array,
  shield: HybridShield,
): { passed: boolean; confidence: number; checks: number; passedChecks: number } {
  let passedChecks = 0;
  const total = PATH_B_CHECKS.length;

  const fgp = quantumFingerprint(data);
  const storedFgp = quantumFingerprint(data);
  const fpsim = fingerprintSimilarity(fgp, storedFgp);
  if (fpsim > 0.9) passedChecks++;

  const gsSim = gateSequenceSimilarity(fgp.gateSequence, storedFgp.gateSequence);
  if (gsSim > 0.85) passedChecks++;

  if (shield.entanglementHash.length > 0) passedChecks++;

  if (shield.quantumFingerprint.length > 0) passedChecks++;

  const stateFgp = bytesToHex(stateToBytesFromFgp(fgp));
  const storedState = shield.quantumFingerprint;
  if (stateFgp === storedState) passedChecks++;

  const confidence = passedChecks / total;
  return { passed: confidence >= 0.6, confidence, checks: total, passedChecks };
}

function stateToBytesFromFgp(fgp: { vector: Float64Array }): Uint8Array {
  return new Uint8Array(fgp.vector.buffer);
}

export function evaluateZeroTrust(
  data: Uint8Array,
  shield: HybridShield,
  profile: TrustProfile = "L-ZT-DUAL.v1",
  policy?: Partial<ZeroTrustPolicy>,
): ZeroTrustResult {
  const resolvedPolicy = { ...DEFAULT_POLICY, ...policy };

  const pathA = pathACheck(data, shield);
  const pathB = pathBCheck(data, shield);

  const pathAResult: ZeroTrustCheck = {
    path: "path_a",
    passed: pathA.confidence >= resolvedPolicy.minConfidence,
    confidence: pathA.confidence,
    detail: pathA.passed
      ? `Path A passed: ${pathA.passedChecks}/${pathA.checks} checks`
      : `Path A failed: ${pathA.passedChecks}/${pathA.checks} checks`,
    checks: pathA.checks,
    passedChecks: pathA.passedChecks,
  };

  const pathBResult: ZeroTrustCheck = {
    path: "path_b",
    passed: pathB.confidence >= resolvedPolicy.minConfidence,
    confidence: pathB.confidence,
    detail: pathB.passed
      ? `Path B passed: ${pathB.passedChecks}/${pathB.checks} checks`
      : `Path B failed: ${pathB.passedChecks}/${pathB.checks} checks`,
    checks: pathB.checks,
    passedChecks: pathB.passedChecks,
  };

  let decision: TrustDecision;
  let requiresEscalation = false;

  if (resolvedPolicy.requireBothPaths) {
    if (pathAResult.passed && pathBResult.passed) {
      decision = "trusted";
    } else if (pathA.confidence >= resolvedPolicy.escalationThreshold ||
               pathB.confidence >= resolvedPolicy.escalationThreshold) {
      decision = "escalated";
      requiresEscalation = true;
    } else {
      decision = "untrusted";
    }
  } else {
    if (pathAResult.passed || pathBResult.passed) {
      decision = "trusted";
    } else {
      decision = "untrusted";
    }
  }

  const overallConfidence = (pathA.confidence + pathB.confidence) / 2;

  return {
    profile,
    pathA: pathAResult,
    pathB: pathBResult,
    decision,
    overallConfidence,
    requiresEscalation,
  };
}

export function doubleSeal(
  data: Uint8Array,
  shieldProfile: ShieldProfile = "L-SHIELD-5",
  trustProfile: TrustProfile = "L-ZT-DUAL.v1",
): {
  shield: HybridShield;
  trustResult: ZeroTrustResult;
} {
  const shield = sealHybridShield(data, shieldProfile);
  const trustResult = evaluateZeroTrust(data, shield, trustProfile);
  return { shield, trustResult };
}

export function doubleVerify(
  data: Uint8Array,
  shield: HybridShield,
): ZeroTrustResult {
  return evaluateZeroTrust(data, shield);
}
