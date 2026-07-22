import { shake256 } from "@noble/hashes/sha3";
import { sha256 } from "@noble/hashes/sha2.js";
import { hmac } from "@noble/hashes/hmac";
import { bytesToHex } from "@noble/hashes/utils";
import { quantumFingerprint, stateToBytes } from "./gates";

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export type ShieldLayer = "classical" | "pqc_hash" | "pqc_sign" | "quantum_state" | "entanglement";
export type ShieldProfile = "L-SHIELD-3" | "L-SHIELD-4" | "L-SHIELD-5";
export type ShieldStatus = "sealed" | "tampered" | "verified";

export interface ShieldLayerResult {
  layer: ShieldLayer;
  successful: boolean;
  hash?: string;
  duration?: number;
  error?: string;
}

export interface HybridShield {
  id: string;
  profile: ShieldProfile;
  layers: ShieldLayerResult[];
  quantumFingerprint: string;
  entanglementHash: string;
  overallStatus: ShieldStatus;
  sealedAt: string;
}

const LAYER_ORDER: Record<ShieldProfile, ShieldLayer[]> = {
  "L-SHIELD-3": ["classical", "pqc_hash", "quantum_state"],
  "L-SHIELD-4": ["classical", "pqc_hash", "pqc_sign", "quantum_state"],
  "L-SHIELD-5": ["classical", "pqc_hash", "pqc_sign", "quantum_state", "entanglement"],
};

function classicallySeal(data: Uint8Array): { hash: string; key: Uint8Array; sealed: Uint8Array } {
  const key = shake256(data, { dkLen: 32 });
  const hash = bytesToHex(sha256(data));
  const sealed = hmac(sha256, key, data);
  return { hash, key, sealed };
}

function pqcHashLayer(data: Uint8Array): { hash: string; sealed: Uint8Array } {
  const sealed = shake256(data, { dkLen: 64 });
  return { hash: bytesToHex(sealed), sealed };
}

function pqcSignLayer(data: Uint8Array, keySeed: Uint8Array): { signature: string; sealed: Uint8Array } {
  const keyMaterial = shake256(keySeed, { dkLen: 128 });
  const signature = shake256(concatBytes(data, keyMaterial), { dkLen: 128 });
  return { signature: bytesToHex(signature), sealed: signature };
}

function quantumStateLayer(data: Uint8Array): { fingerprint: string; state: Uint8Array } {
  const fgp = quantumFingerprint(data);
  return { fingerprint: bytesToHex(stateToBytes(fgp.state)), state: stateToBytes(fgp.state) };
}

function entanglementLayer(data: Uint8Array, stateBytes: Uint8Array): { entanglementHash: string } {
  const combined = concatBytes(data, stateBytes);
  const entangled = shake256(combined, { dkLen: 64 });
  return { entanglementHash: bytesToHex(entangled) };
}

export function sealHybridShield(
  data: Uint8Array,
  profile: ShieldProfile = "L-SHIELD-5",
  keySeed?: Uint8Array,
): HybridShield {
  const layers: ShieldLayerResult[] = [];
  const layerOrder = LAYER_ORDER[profile];

  const id = bytesToHex(shake256(data, { dkLen: 16 }));

  for (const layer of layerOrder) {
    const start = performance.now();
    try {
      switch (layer) {
        case "classical": {
          const r = classicallySeal(data);
          layers.push({ layer, successful: true, hash: r.hash, duration: performance.now() - start });
          break;
        }
        case "pqc_hash": {
          const r = pqcHashLayer(data);
          layers.push({ layer, successful: true, hash: r.hash, duration: performance.now() - start });
          break;
        }
        case "pqc_sign": {
          const ks = keySeed ?? shake256(data, { dkLen: 32 });
          const r = pqcSignLayer(data, ks);
          layers.push({ layer, successful: true, hash: r.signature, duration: performance.now() - start });
          break;
        }
        case "quantum_state": {
          const r = quantumStateLayer(data);
          layers.push({ layer, successful: true, hash: r.fingerprint, duration: performance.now() - start });
          break;
        }
        case "entanglement": {
          const qs = quantumStateLayer(data);
          const r = entanglementLayer(data, qs.state);
          layers.push({ layer, successful: true, hash: r.entanglementHash, duration: performance.now() - start });
          break;
        }
      }
    } catch (e) {
      layers.push({ layer, successful: false, error: (e as Error).message });
    }
  }

  const quantumFingerprint = layers.find(l => l.layer === "quantum_state")?.hash ?? "";
  const entanglementHash = layers.find(l => l.layer === "entanglement")?.hash ?? "";

  return {
    id,
    profile,
    layers,
    quantumFingerprint,
    entanglementHash,
    overallStatus: layers.every(l => l.successful) ? "sealed" : "tampered",
    sealedAt: new Date().toISOString(),
  };
}

export function verifyHybridShield(
  shield: HybridShield,
  originalData: Uint8Array,
  keySeed?: Uint8Array,
): {
  valid: boolean;
  layerResults: ShieldLayerResult[];
  similarity: number;
} {
  const layerResults: ShieldLayerResult[] = [];
  const layerOrder = LAYER_ORDER[shield.profile];

  for (const layer of layerOrder) {
    const start = performance.now();
    const original = shield.layers.find(l => l.layer === layer);
    if (!original) {
      layerResults.push({ layer, successful: false, error: "Layer missing from shield" });
      continue;
    }

    try {
      switch (layer) {
        case "classical": {
          const r = classicallySeal(originalData);
          const ok = r.hash === original.hash;
          layerResults.push({ layer, successful: ok, hash: r.hash, duration: performance.now() - start });
          break;
        }
        case "pqc_hash": {
          const r = pqcHashLayer(originalData);
          const ok = r.hash === original.hash;
          layerResults.push({ layer, successful: ok, hash: r.hash, duration: performance.now() - start });
          break;
        }
        case "pqc_sign": {
          const ks = keySeed ?? shake256(originalData, { dkLen: 32 });
          const r = pqcSignLayer(originalData, ks);
          const ok = r.signature === original.hash;
          layerResults.push({ layer, successful: ok, hash: r.signature, duration: performance.now() - start });
          break;
        }
        case "quantum_state": {
          const r = quantumStateLayer(originalData);
          const ok = r.fingerprint === original.hash;
          layerResults.push({ layer, successful: ok, hash: r.fingerprint, duration: performance.now() - start });
          break;
        }
        case "entanglement": {
          const qs = quantumStateLayer(originalData);
          const r = entanglementLayer(originalData, qs.state);
          const ok = r.entanglementHash === original.hash;
          layerResults.push({ layer, successful: ok, hash: r.entanglementHash, duration: performance.now() - start });
          break;
        }
      }
    } catch (e) {
      layerResults.push({ layer, successful: false, error: (e as Error).message });
    }
  }

  const computedFgp = quantumFingerprint(originalData);
  const storedStateHex = shield.quantumFingerprint;
  const computedStateHex = bytesToHex(stateToBytes(computedFgp.state));
  const similarity = storedStateHex && computedStateHex === storedStateHex ? 1 : 0;

  return {
    valid: layerResults.every(l => l.successful),
    layerResults,
    similarity,
  };
}

export function shieldStrength(profile: ShieldProfile): number {
  switch (profile) {
    case "L-SHIELD-3": return 3;
    case "L-SHIELD-4": return 4;
    case "L-SHIELD-5": return 5;
  }
}
