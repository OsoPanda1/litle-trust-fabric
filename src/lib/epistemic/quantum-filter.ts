import type { EpistemicDimension, EpistemicProfile, QualityScore, KnowledgeDomain } from "./types";

export type QuantumObjective = "maximize_quality" | "balance_dimensions" | "pareto_frontier";

export interface QuantumFilterConfig {
  objective: QuantumObjective;
  iterations: number;
  temperatureStart: number;
  temperatureEnd: number;
  couplingStrength: number;
  seed?: number;
}

export interface QuantumScoredWork {
  profile: EpistemicProfile;
  quantumScore: number;
  confidence: number;
  entangledDimensions: Array<{ dimA: EpistemicDimension; dimB: EpistemicDimension; correlation: number }>;
}

const DIMENSIONS: EpistemicDimension[] = [
  "methodological_rigor",
  "reproducibility",
  "citation_integrity",
  "peer_review_status",
  "data_transparency",
  "ai_provenance",
  "longevity_potential",
  "epistemological_novelty",
];

const DIMENSION_PAIRS: Array<[EpistemicDimension, EpistemicDimension]> = [
  ["methodological_rigor", "reproducibility"],
  ["citation_integrity", "data_transparency"],
  ["peer_review_status", "methodological_rigor"],
  ["ai_provenance", "reproducibility"],
  ["longevity_potential", "epistemological_novelty"],
  ["data_transparency", "reproducibility"],
];

const DEFAULT_WEIGHTS: Record<EpistemicDimension, number> = {
  methodological_rigor: 0.20,
  reproducibility: 0.18,
  citation_integrity: 0.15,
  peer_review_status: 0.12,
  data_transparency: 0.12,
  ai_provenance: 0.10,
  longevity_potential: 0.08,
  epistemological_novelty: 0.05,
};

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export class QuantumEpistemicFilter {
  private config: QuantumFilterConfig;
  private cachedWeights: Record<EpistemicDimension, number> | null = null;

  constructor(config?: Partial<QuantumFilterConfig>) {
    this.config = {
      objective: "maximize_quality",
      iterations: 1000,
      temperatureStart: 10.0,
      temperatureEnd: 0.01,
      couplingStrength: 0.15,
      seed: Date.now(),
      ...config,
    };
  }

  private simulatedAnnealingWeights(): Record<EpistemicDimension, number> {
    const weights = { ...DEFAULT_WEIGHTS };
    let temp = this.config.temperatureStart;
    const decay = Math.pow(
      this.config.temperatureEnd / this.config.temperatureStart,
      1 / this.config.iterations,
    );
    const rand = seededRand(this.config.seed ?? Date.now());

    for (let iter = 0; iter < this.config.iterations; iter++) {
      const dimIdx = Math.floor(rand() * DIMENSIONS.length);
      const dim = DIMENSIONS[dimIdx];

      const targetEntropy = this.config.objective === "balance_dimensions" ? Math.log(DIMENSIONS.length) : 1.5;
      const currentEnergy = this.computeEnergy(weights, targetEntropy);
      const prevWeight = weights[dim];
      const perturbation = (rand() - 0.5) * temp * 0.1;
      const candidate = Math.max(0.01, prevWeight + perturbation);
      weights[dim] = candidate;

      const candidateEnergy = this.computeEnergy(weights, targetEntropy);
      const delta = candidateEnergy - currentEnergy;
      if (delta <= 0 && Math.exp(delta / Math.max(temp, 0.001)) < rand()) {
        weights[dim] = prevWeight;
      }

      const total = DIMENSIONS.reduce((s, d) => s + weights[d], 0);
      for (const d of DIMENSIONS) weights[d] /= total;
      temp *= decay;
    }

    this.cachedWeights = { ...weights };
    return weights;
  }

  private computeEnergy(weights: Record<EpistemicDimension, number>, targetEntropy: number): number {
    let entropy = 0;
    for (const dim of DIMENSIONS) {
      if (weights[dim] > 0) entropy -= weights[dim] * Math.log(weights[dim]);
    }
    return -Math.abs(entropy - targetEntropy);
  }

  private computeCorrelation(
    dimA: EpistemicDimension,
    dimB: EpistemicDimension,
    profiles: EpistemicProfile[],
  ): number {
    if (profiles.length < 3) return 0;
    const meanA = profiles.reduce((s, p) => s + p.dimensions[dimA], 0) / profiles.length;
    const meanB = profiles.reduce((s, p) => s + p.dimensions[dimB], 0) / profiles.length;
    let num = 0, denA = 0, denB = 0;
    for (const p of profiles) {
      const da = p.dimensions[dimA] - meanA;
      const db = p.dimensions[dimB] - meanB;
      num += da * db;
      denA += da * da;
      denB += db * db;
    }
    if (denA === 0 || denB === 0) return 0;
    return num / Math.sqrt(denA * denB);
  }

  private entropyScore(profile: EpistemicProfile): number {
    let entropy = 0;
    for (const dim of DIMENSIONS) {
      const v = (profile.dimensions[dim] ?? 0) / 5;
      if (v > 0) entropy -= v * Math.log(v);
    }
    return entropy;
  }

  score(profiles: EpistemicProfile[]): QuantumScoredWork[] {
    const optimizedWeights = this.simulatedAnnealingWeights();
    const populationSize = profiles.length;

    return profiles.map((profile) => {
      let quantumScore = 0;
      for (const dim of DIMENSIONS) {
        quantumScore += (profile.dimensions[dim] ?? 0) * optimizedWeights[dim];
      }

      let entanglementEnergy = 0;
      if (populationSize >= 3) {
        for (const [dA, dB] of DIMENSION_PAIRS) {
          const corr = this.computeCorrelation(dA, dB, profiles);
          entanglementEnergy += corr * this.config.couplingStrength;
        }
      }

      quantumScore = parseFloat((quantumScore + entanglementEnergy).toFixed(2));

      const maxEntropy = Math.log(DIMENSIONS.length);
      const confidence = maxEntropy > 0
        ? Math.min(1, Math.max(0, this.entropyScore(profile) / maxEntropy))
        : 0;

      const entangledDimensions = populationSize >= 3
        ? DIMENSION_PAIRS
            .map(([dA, dB]) => ({
              dimA: dA,
              dimB: dB,
              correlation: parseFloat(this.computeCorrelation(dA, dB, profiles).toFixed(4)),
            }))
            .filter((e) => Math.abs(e.correlation) > 0.3)
        : [];

      return {
        profile,
        quantumScore,
        confidence: parseFloat(confidence.toFixed(4)),
        entangledDimensions,
      };
    });
  }

  getOptimizedWeights(): Record<EpistemicDimension, number> {
    if (this.cachedWeights) return this.cachedWeights;
    return this.simulatedAnnealingWeights();
  }
}
