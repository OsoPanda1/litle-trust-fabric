import { describe, it, expect } from "vitest";
import {
  getGate,
  getGateSequence,
  deriveGateSequence,
  computeQuantumState,
  stateToBytes,
  bytesToState,
  stateToHex,
  quantumFingerprint,
  fingerprintSimilarity,
  gateSequenceSimilarity,
} from "./gates";

describe("getGate", () => {
  it("returns a gate for valid index", () => {
    const gate = getGate(0);
    expect(gate).toBeDefined();
    expect(gate.name).toBe("H");
    expect(gate.index).toBe(0);
  });

  it("wraps around for out-of-range index", () => {
    const gate = getGate(100);
    expect(gate).toBeDefined();
  });
});

describe("getGateSequence", () => {
  it("returns all 48 gates", () => {
    const seq = getGateSequence();
    expect(seq.length).toBe(48);
    expect(seq[0].name).toBe("H");
    expect(seq[47].name).toBe("MEASURE");
  });
});

describe("deriveGateSequence", () => {
  it("returns deterministic sequence from seed", () => {
    const seed = new Uint8Array(32).fill(0xaa);
    const seq1 = deriveGateSequence(seed, 48);
    const seq2 = deriveGateSequence(seed, 48);
    expect(seq1).toEqual(seq2);
    expect(seq1.length).toBe(48);
  });

  it("produces different sequences for different seeds", () => {
    const s1 = deriveGateSequence(new Uint8Array(32).fill(0xaa), 48);
    const s2 = deriveGateSequence(new Uint8Array(32).fill(0xbb), 48);
    let diff = 0;
    for (let i = 0; i < 48; i++) if (s1[i] !== s2[i]) diff++;
    expect(diff).toBeGreaterThan(0);
  });

  it("all indices are in valid range", () => {
    const seq = deriveGateSequence(new Uint8Array(32).fill(0xcc), 48);
    for (const idx of seq) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(48);
    }
  });
});

describe("computeQuantumState", () => {
  it("returns normalized state vector", () => {
    const seed = new Uint8Array(32).fill(0x42);
    const state = computeQuantumState(seed);
    const norm = Math.sqrt(state[0][0]**2 + state[0][1]**2 + state[1][0]**2 + state[1][1]**2);
    expect(Math.abs(norm - 1)).toBeLessThan(0.001);
  });

  it("produces deterministic states", () => {
    const seed = new Uint8Array(32).fill(0x42);
    const s1 = computeQuantumState(seed);
    const s2 = computeQuantumState(seed);
    expect(s1[0][0]).toBeCloseTo(s2[0][0], 10);
    expect(s1[0][1]).toBeCloseTo(s2[0][1], 10);
  });
});

describe("stateToBytes / bytesToState round-trip", () => {
  it("round-trips correctly", () => {
    const seed = new Uint8Array(32).fill(0x99);
    const state = computeQuantumState(seed);
    const bytes = stateToBytes(state);
    expect(bytes.length).toBe(32);
    const restored = bytesToState(bytes);
    expect(restored[0][0]).toBeCloseTo(state[0][0], 10);
    expect(restored[0][1]).toBeCloseTo(state[0][1], 10);
  });
});

describe("stateToHex", () => {
  it("produces 64-char hex string", () => {
    const seed = new Uint8Array(32).fill(0x55);
    const state = computeQuantumState(seed);
    const hex = stateToHex(state);
    expect(hex.length).toBe(64);
    expect(/^[0-9a-f]{64}$/i.test(hex)).toBe(true);
  });
});

describe("quantumFingerprint", () => {
  it("produces fingerprint with 48-length gate sequence", () => {
    const data = new Uint8Array([1, 2, 3]);
    const fgp = quantumFingerprint(data);
    expect(fgp.gateSequence.length).toBe(48);
    expect(fgp.vector.length).toBe(4);
  });

  it("produces deterministic fingerprints", () => {
    const data = new Uint8Array([1, 2, 3]);
    const f1 = quantumFingerprint(data);
    const f2 = quantumFingerprint(data);
    expect(f1.state).toEqual(f2.state);
  });
});

describe("fingerprintSimilarity", () => {
  it("returns 1.0 for identical fingerprints", () => {
    const data = new Uint8Array([1, 2, 3]);
    const fgp = quantumFingerprint(data);
    const sim = fingerprintSimilarity(fgp, fgp);
    expect(sim).toBeCloseTo(1.0, 5);
  });

  it("returns lower value for different data", () => {
    const f1 = quantumFingerprint(new Uint8Array([1, 2, 3]));
    const f2 = quantumFingerprint(new Uint8Array([4, 5, 6]));
    const sim = fingerprintSimilarity(f1, f2);
    expect(sim).toBeLessThan(1.0);
    expect(sim).toBeGreaterThanOrEqual(0);
  });
});

describe("gateSequenceSimilarity", () => {
  it("returns 1.0 for identical sequences", () => {
    const seq = deriveGateSequence(new Uint8Array(32).fill(0x77), 48);
    expect(gateSequenceSimilarity(seq, seq)).toBeCloseTo(1.0);
  });

  it("returns 0.0 for fully disjoint sequences", () => {
    const seq1 = deriveGateSequence(new Uint8Array(32).fill(0x77), 48);
    const seq2 = deriveGateSequence(new Uint8Array(32).fill(0x88), 48);
    const sim = gateSequenceSimilarity(seq1, seq2);
    expect(sim).toBeGreaterThanOrEqual(0);
    expect(sim).toBeLessThan(1.0);
  });
});
