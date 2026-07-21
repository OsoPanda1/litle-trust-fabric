import { shake256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";

export type Complex = [number, number];
export type QuantumState = Complex[];
export type GateMatrix = [[Complex, Complex], [Complex, Complex]];
export type GatePhase = "Z" | "X" | "Y" | "H" | "T" | "S" | "P";

export interface GateDefinition {
  index: number;
  name: string;
  matrix: GateMatrix;
  phase: GatePhase;
  angle: number;
}

export interface QuantumFingerprint {
  state: QuantumState;
  vector: Float64Array;
  gateSequence: number[];
}

const PI = Math.PI;
const I: Complex = [0, 1];

function cmul(a: Complex, b: Complex): Complex {
  return [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]];
}

function cadd(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]];
}

function conj(c: Complex): Complex {
  return [c[0], -c[1]];
}

function matMulVec(m: GateMatrix, v: [Complex, Complex]): [Complex, Complex] {
  return [
    cadd(cmul(m[0][0], v[0]), cmul(m[0][1], v[1])),
    cadd(cmul(m[1][0], v[0]), cmul(m[1][1], v[1])),
  ];
}

const GATE_DEFINITIONS: GateDefinition[] = [
  { index: 0,  name: "H",    matrix: [[[1,0],[1,0]],[[1,0],[-1,0]]], phase: "H", angle: 0 },
  { index: 1,  name: "X",    matrix: [[[0,0],[1,0]],[[1,0],[0,0]]], phase: "X", angle: PI },
  { index: 2,  name: "Y",    matrix: [[[0,0],[-0,-1]],[[0,1],[0,0]]], phase: "Y", angle: PI },
  { index: 3,  name: "Z",    matrix: [[[1,0],[0,0]],[[0,0],[-1,0]]], phase: "Z", angle: PI },
  { index: 4,  name: "S",    matrix: [[[1,0],[0,0]],[[0,0],[0,1]]], phase: "S", angle: PI/2 },
  { index: 5,  name: "Sdg",  matrix: [[[1,0],[0,0]],[[0,0],[0,-1]]], phase: "S", angle: -PI/2 },
  { index: 6,  name: "T",    matrix: [[[1,0],[0,0]],[[0,0],[1,1]]], phase: "T", angle: PI/4 },
  { index: 7,  name: "Tdg",  matrix: [[[1,0],[0,0]],[[0,0],[1,-1]]], phase: "T", angle: -PI/4 },
  { index: 8,  name: "RX(π/4)",   matrix: phaseRotX(PI/4),  phase: "X", angle: PI/4 },
  { index: 9,  name: "RX(π/2)",   matrix: phaseRotX(PI/2),  phase: "X", angle: PI/2 },
  { index: 10, name: "RX(π)",     matrix: phaseRotX(PI),    phase: "X", angle: PI },
  { index: 11, name: "RY(π/4)",   matrix: phaseRotY(PI/4),  phase: "Y", angle: PI/4 },
  { index: 12, name: "RY(π/2)",   matrix: phaseRotY(PI/2),  phase: "Y", angle: PI/2 },
  { index: 13, name: "RY(π)",     matrix: phaseRotY(PI),    phase: "Y", angle: PI },
  { index: 14, name: "RZ(π/4)",   matrix: phaseRotZ(PI/4),  phase: "Z", angle: PI/4 },
  { index: 15, name: "RZ(π/2)",   matrix: phaseRotZ(PI/2),  phase: "Z", angle: PI/2 },
  { index: 16, name: "RZ(π)",     matrix: phaseRotZ(PI),    phase: "Z", angle: PI },
  { index: 17, name: "√X",   matrix: sqrtX(),     phase: "X", angle: PI/2 },
  { index: 18, name: "√Y",   matrix: sqrtY(),     phase: "Y", angle: PI/2 },
  { index: 19, name: "SWAP", matrix: [[[1,0],[0,0]],[[0,0],[1,0]]], phase: "X", angle: 0 },
  { index: 20, name: "iSWAP", matrix: iSwapMat(), phase: "X", angle: PI/2 },
  { index: 21, name: "CS",   matrix: csMat(),     phase: "S", angle: PI/2 },
  { index: 22, name: "CT",   matrix: ctMat(),     phase: "T", angle: PI/4 },
  { index: 23, name: "Toffoli-phase", matrix: toffPhaseMat(), phase: "Z", angle: 0 },
  { index: 24, name: "H(XZ)", matrix: composeGates(phaseRotX(PI/2), phaseRotZ(PI/2)), phase: "H", angle: PI/2 },
  { index: 25, name: "H(YZ)", matrix: composeGates(phaseRotY(PI/2), phaseRotZ(PI/2)), phase: "H", angle: PI/2 },
  { index: 26, name: "P(π/8)", matrix: phaseGate(PI/8),  phase: "P", angle: PI/8 },
  { index: 27, name: "P(π/16)", matrix: phaseGate(PI/16), phase: "P", angle: PI/16 },
  { index: 28, name: "QFT-2", matrix: qft2Mat(),    phase: "H", angle: PI/2 },
  { index: 29, name: "QFT-4", matrix: qft4Mat(),    phase: "H", angle: PI/4 },
  { index: 30, name: "V(0)",   matrix: [[[1,0],[0,0]],[[0,0],[1,0]]], phase: "Z", angle: 0 },
  { index: 31, name: "V(1)",   matrix: [[[0,0],[1,0]],[[1,0],[0,0]]], phase: "X", angle: 0 },
  { index: 32, name: "V(2)",   matrix: [[[0,-1],[0,0]],[[0,0],[0,1]]], phase: "Y", angle: 0 },
  { index: 33, name: "V(3)",   matrix: [[[1,0],[0,0]],[[0,0],[-1,0]]], phase: "Z", angle: 0 },
  { index: 34, name: "CX",    matrix: [[[1,0],[0,0]],[[0,0],[0,1]]], phase: "X", angle: 0 },
  { index: 35, name: "CY",    matrix: [[[1,0],[0,0]],[[0,0],[0,-1]]], phase: "Y", angle: 0 },
  { index: 36, name: "CZ",    matrix: [[[1,0],[0,0]],[[0,0],[-1,0]]], phase: "Z", angle: 0 },
  { index: 37, name: "CRX(π/4)", matrix: crxMat(PI/4),  phase: "X", angle: PI/4 },
  { index: 38, name: "CRY(π/4)", matrix: cryMat(PI/4),  phase: "Y", angle: PI/4 },
  { index: 39, name: "CRZ(π/4)", matrix: crzMat(PI/4),  phase: "Z", angle: PI/4 },
  { index: 40, name: "U3(π/2,π/4,π/8)", matrix: u3Mat(PI/2, PI/4, PI/8), phase: "P", angle: PI/8 },
  { index: 41, name: "U3(π/4,π/8,π/16)", matrix: u3Mat(PI/4, PI/8, PI/16), phase: "P", angle: PI/16 },
  { index: 42, name: "U3(π,π/2,π/4)", matrix: u3Mat(PI, PI/2, PI/4), phase: "P", angle: PI/4 },
  { index: 43, name: "ECHO-X", matrix: echoX(), phase: "X", angle: 0 },
  { index: 44, name: "ECHO-Y", matrix: echoY(), phase: "Y", angle: 0 },
  { index: 45, name: "ECHO-Z", matrix: echoZ(), phase: "Z", angle: 0 },
  { index: 46, name: "ENTANGLE", matrix: entangleMat(), phase: "P", angle: PI/2 },
  { index: 47, name: "MEASURE", matrix: measureMat(), phase: "H", angle: 0 },
];

function phaseRotX(theta: number): GateMatrix {
  const c = Math.cos(theta/2), s = Math.sin(theta/2);
  return [[[c,0],[-0,-s]],[[0,-s],[c,0]]];
}
function phaseRotY(theta: number): GateMatrix {
  const c = Math.cos(theta/2), s = Math.sin(theta/2);
  return [[[c,0],[-s,0]],[[s,0],[c,0]]];
}
function phaseRotZ(theta: number): GateMatrix {
  const e = Math.cos(theta/2);
  const f = Math.sin(theta/2);
  return [[[e,-f],[0,0]],[[0,0],[e,f]]];
}
function sqrtX(): GateMatrix {
  return [[[0.5,0.5],[0.5,-0.5]],[[0.5,-0.5],[0.5,0.5]]];
}
function sqrtY(): GateMatrix {
  return [[[0.5,0],[0.5,0.5]],[[-0.5,-0.5],[0.5,0]]];
}
function iSwapMat(): GateMatrix {
  return [[[1,0],[0,0]],[[0,0],[0,1]]];
}
function csMat(): GateMatrix {
  return [[[1,0],[0,0]],[[0,0],[0,1]]];
}
function ctMat(): GateMatrix {
  return [[[1,0],[0,0]],[[0,0],[1/Math.SQRT2,1/Math.SQRT2]]];
}
function toffPhaseMat(): GateMatrix {
  return [[[1,0],[0,0]],[[0,0],[-1,0]]];
}
function phaseGate(phi: number): GateMatrix {
  return [[[1,0],[0,0]],[[0,0],[Math.cos(phi),Math.sin(phi)]]];
}
function qft2Mat(): GateMatrix {
  const s = 1/Math.SQRT2;
  return [[[s,0],[s,0]],[[s,0],[-s,0]]];
}
function qft4Mat(): GateMatrix {
  const s = 1/Math.SQRT2;
  return [[[s,0],[s,0]],[[s,0],[-s,0]]];
}
function crxMat(theta: number): GateMatrix {
  const c = Math.cos(theta/2), s = Math.sin(theta/2);
  return [[[1,0],[0,0]],[[0,0],[c,-s]],[[0,0],[-0,-s],[c,0]]] as unknown as GateMatrix;
}
function cryMat(theta: number): GateMatrix {
  const c = Math.cos(theta/2), s = Math.sin(theta/2);
  return [[[1,0],[0,0]],[[0,0],[c,-s]],[[0,0],[s,0],[c,0]]] as unknown as GateMatrix;
}
function crzMat(theta: number): GateMatrix {
  const e = Math.cos(theta/2), f = Math.sin(theta/2);
  return [[[1,0],[0,0]],[[0,0],[e,-f]],[[0,0],[0,0],[e,f]]] as unknown as GateMatrix;
}
function u3Mat(theta: number, phi: number, lam: number): GateMatrix {
  const ct = Math.cos(theta/2), st = Math.sin(theta/2);
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const cl = Math.cos(lam), sl = Math.sin(lam);
  return [
    [[ct,0], [-st*cl, -st*(-sl)]],
    [[st*cp, st*sp], [ct*cp*cl - sp*sl, ct*cp*(-sl) + sp*cl]],
  ];
}
function echoX(): GateMatrix {
  return [[[0,0],[1,0]],[[1,0],[0,0]]];
}
function echoY(): GateMatrix {
  return [[[0,-1],[1,0]],[[1,0],[0,1]]];
}
function echoZ(): GateMatrix {
  return [[[1,0],[0,0]],[[0,0],[-1,0]]];
}
function entangleMat(): GateMatrix {
  const s = 1/Math.SQRT2;
  return [[[s,0],[0,0]],[[0,0],[s,0]]];
}
function measureMat(): GateMatrix {
  return [[[1,0],[0,0]],[[0,0],[0,0]]];
}
function composeGates(a: GateMatrix, b: GateMatrix): GateMatrix {
  return [
    [cadd(cmul(a[0][0],b[0][0]), cmul(a[0][1],b[1][0])), cadd(cmul(a[0][0],b[0][1]), cmul(a[0][1],b[1][1]))],
    [cadd(cmul(a[1][0],b[0][0]), cmul(a[1][0],b[1][0])), cadd(cmul(a[1][0],b[0][1]), cmul(a[1][1],b[1][1]))],
  ];
}

export function getGate(index: number): GateDefinition {
  if (index < 0 || index >= GATE_DEFINITIONS.length) {
    return GATE_DEFINITIONS[index % GATE_DEFINITIONS.length];
  }
  return GATE_DEFINITIONS[index];
}

export function getGateSequence(): GateDefinition[] {
  return [...GATE_DEFINITIONS];
}

export function applyGate(state: [Complex, Complex], gate: GateDefinition): [Complex, Complex] {
  return matMulVec(gate.matrix, state);
}

export function deriveGateSequence(seed: Uint8Array, length: number = 48): number[] {
  const hash = shake256(seed, { dkLen: Math.ceil(length * 4) });
  const gates: number[] = [];
  for (let i = 0; i < length; i++) {
    const idx = (hash[i * 4] << 24 | hash[i * 4 + 1] << 16 | hash[i * 4 + 2] << 8 | hash[i * 4 + 3]) >>> 0;
    gates.push(idx % GATE_DEFINITIONS.length);
  }
  return gates;
}

export function computeQuantumState(
  seed: Uint8Array,
  gateSequence?: number[],
): QuantumState {
  const seq = gateSequence ?? deriveGateSequence(seed, 48);
  let state: [Complex, Complex] = [[1, 0], [0, 0]];
  for (const gateIdx of seq) {
    state = applyGate(state, getGate(gateIdx));
  }
  const norm = Math.sqrt(state[0][0]**2 + state[0][1]**2 + state[1][0]**2 + state[1][1]**2);
  if (norm > 0) {
    state[0][0] /= norm; state[0][1] /= norm;
    state[1][0] /= norm; state[1][1] /= norm;
  }
  return state;
}

export function stateToBytes(state: QuantumState): Uint8Array {
  const buf = new Float64Array(4);
  buf[0] = state[0][0]; buf[1] = state[0][1];
  buf[2] = state[1][0]; buf[3] = state[1][1];
  return new Uint8Array(buf.buffer);
}

export function bytesToState(bytes: Uint8Array): QuantumState {
  const buf = new Float64Array(bytes.buffer, bytes.byteOffset, 4);
  return [[buf[0], buf[1]], [buf[2], buf[3]]];
}

export function stateToHex(state: QuantumState): string {
  return bytesToHex(stateToBytes(state));
}

export function quantumFingerprint(
  data: Uint8Array,
  profile: string = "L-48G.v1",
): QuantumFingerprint {
  const hash = shake256(data, { dkLen: 32 });
  const gateSequence = deriveGateSequence(hash, 48);
  const state = computeQuantumState(hash, gateSequence);
  const vector = new Float64Array([state[0][0], state[0][1], state[1][0], state[1][1]]);
  return { state, vector, gateSequence };
}

export function fingerprintSimilarity(
  a: QuantumFingerprint,
  b: QuantumFingerprint,
): number {
  let dot = 0;
  let nA = 0, nB = 0;
  for (let i = 0; i < 4; i++) {
    dot += a.vector[i] * b.vector[i];
    nA += a.vector[i] * a.vector[i];
    nB += b.vector[i] * b.vector[i];
  }
  const normA = Math.sqrt(nA);
  const normB = Math.sqrt(nB);
  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (normA * normB);
  return (sim + 1) / 2;
}

export function gateSequenceSimilarity(seqA: number[], seqB: number[]): number {
  const minLen = Math.min(seqA.length, seqB.length);
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    if (seqA[i] === seqB[i]) matches++;
  }
  return matches / Math.max(seqA.length, seqB.length);
}

export {
  GATE_DEFINITIONS,
};
