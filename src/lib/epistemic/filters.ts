import type { EpistemicProfile, EpistemicFilter, EpistemicDimension, QualityScore, EpistemicAggregation, KnowledgeDomain } from "./types";

const DIMENSION_WEIGHTS: Record<EpistemicDimension, number> = {
  methodological_rigor: 0.20,
  reproducibility: 0.18,
  citation_integrity: 0.15,
  peer_review_status: 0.12,
  data_transparency: 0.12,
  ai_provenance: 0.10,
  longevity_potential: 0.08,
  epistemological_novelty: 0.05,
};

export function calculateComposite(dimensions: Record<EpistemicDimension, QualityScore>): number {
  let score = 0;
  for (const [dim, weight] of Object.entries(DIMENSION_WEIGHTS)) {
    score += (dimensions[dim as EpistemicDimension] ?? 0) * weight;
  }
  return Math.round(score * 100) / 100;
}

export function applyFilter(profiles: EpistemicProfile[], filter: EpistemicFilter): EpistemicProfile[] {
  let result = [...profiles];

  if (filter.minCompositeScore !== undefined) {
    result = result.filter((p) => p.compositeScore >= filter.minCompositeScore);
  }
  if (filter.domains && filter.domains.length > 0) {
    result = result.filter((p) => filter.domains!.includes(p.domain));
  }
  if (filter.dimensions) {
    for (const [dim, minScore] of Object.entries(filter.dimensions)) {
      result = result.filter((p) => (p.dimensions[dim as EpistemicDimension] ?? 0) >= minScore!);
    }
  }
  if (filter.aiAssisted !== undefined) {
    result = result.filter((p) => p.aiAssisted === filter.aiAssisted);
  }
  if (filter.hasEvidenceChain !== undefined) {
    result = result.filter((p) => p.hasEvidenceChain === filter.hasEvidenceChain);
  }
  if (filter.tags && filter.tags.length > 0) {
    result = result.filter((p) => filter.tags!.some((t) => p.tags.includes(t)));
  }

  const sortBy = filter.sortBy ?? "compositeScore";
  const mul = filter.sortOrder === "desc" ? -1 : 1;
  result.sort((a, b) => {
    if (sortBy === "compositeScore") return (a.compositeScore - b.compositeScore) * mul;
    return 0;
  });

  if (filter.offset) result = result.slice(filter.offset);
  if (filter.limit) result = result.slice(0, filter.limit);

  return result;
}

export function aggregate(profiles: EpistemicProfile[]): EpistemicAggregation {
  const dimensions = Object.keys(DIMENSION_WEIGHTS) as EpistemicDimension[];
  const dimensionAverages = {} as Record<EpistemicDimension, number>;

  for (const dim of dimensions) {
    const sum = profiles.reduce((acc, p) => acc + p.dimensions[dim], 0);
    dimensionAverages[dim] = profiles.length > 0 ? Math.round((sum / profiles.length) * 100) / 100 : 0;
  }

  const domainDistribution = {} as Record<KnowledgeDomain, number>;
  for (const p of profiles) {
    domainDistribution[p.domain] = (domainDistribution[p.domain] ?? 0) + 1;
  }

  const tagCount = new Map<string, number>();
  for (const p of profiles) {
    for (const tag of p.tags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
  }
  const topTags = [...tagCount.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const totalScore = profiles.reduce((acc, p) => acc + p.compositeScore, 0);

  return {
    dimensionAverages,
    totalWorks: profiles.length,
    domainDistribution,
    averageCompositeScore: profiles.length > 0 ? Math.round((totalScore / profiles.length) * 100) / 100 : 0,
    topTags,
  };
}

export const QUALITY_THRESHOLDS = {
  platinum: 4.0,
  gold: 3.5,
  silver: 2.5,
  bronze: 1.5,
} as const;

export function getQualityTier(score: number): "platinum" | "gold" | "silver" | "bronze" | "unrated" {
  if (score >= QUALITY_THRESHOLDS.platinum) return "platinum";
  if (score >= QUALITY_THRESHOLDS.gold) return "gold";
  if (score >= QUALITY_THRESHOLDS.silver) return "silver";
  if (score >= QUALITY_THRESHOLDS.bronze) return "bronze";
  return "unrated";
}

export function createProfile(partial: Partial<EpistemicProfile> & { litleId: string }): EpistemicProfile {
  const defaultDimensions: Record<EpistemicDimension, QualityScore> = {
    methodological_rigor: 0, reproducibility: 0, citation_integrity: 0,
    peer_review_status: 0, data_transparency: 0, ai_provenance: 0,
    longevity_potential: 0, epistemological_novelty: 0,
  };

  const dimensions = { ...defaultDimensions, ...partial.dimensions };
  const compositeScore = partial.compositeScore ?? calculateComposite(dimensions);

  return {
    litleId: partial.litleId,
    dimensions,
    compositeScore,
    domain: partial.domain ?? "technology",
    subdomains: partial.subdomains ?? [],
    tags: partial.tags ?? [],
    methodology: partial.methodology ?? "",
    aiAssisted: partial.aiAssisted ?? false,
    hasEvidenceChain: partial.hasEvidenceChain ?? false,
    hasCryptoSignature: partial.hasCryptoSignature ?? false,
  } as EpistemicProfile;
}
