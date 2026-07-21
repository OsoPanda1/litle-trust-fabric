export {
  getGate,
  getGateSequence,
  applyGate,
  deriveGateSequence,
  computeQuantumState,
  stateToBytes,
  bytesToState,
  stateToHex,
  quantumFingerprint,
  fingerprintSimilarity,
  gateSequenceSimilarity,
  type QuantumState,
  type QuantumFingerprint,
  type GateDefinition,
  type GatePhase,
  type Complex,
  GATE_DEFINITIONS,
} from "./gates";

export {
  sealHybridShield,
  verifyHybridShield,
  shieldStrength,
  type HybridShield,
  type ShieldLayer,
  type ShieldLayerResult,
  type ShieldProfile,
  type ShieldStatus,
} from "./hybrid-shield";

export {
  evaluateZeroTrust,
  doubleSeal,
  doubleVerify,
  type ZeroTrustResult,
  type ZeroTrustCheck,
  type ZeroTrustPolicy,
  type TrustDecision,
  type TrustPath,
  type TrustProfile,
} from "./zero-trust";

export {
  createTrace,
  computeCorroboration,
  traceAuthor,
  authorshipCrossReference,
  quantumDataInterconnect,
  type DataTrace,
  type DataSource,
  type TraceLink,
  type DataInterconnectionReport,
} from "./interconnect";
