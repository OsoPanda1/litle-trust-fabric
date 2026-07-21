export type KnowledgeDomain =
  | "technology" | "sciences" | "humanities"
  | "culture" | "politics" | "economics"
  | "finance" | "education" | "critical-thought"
  | "mathematics" | "physics" | "biology"
  | "medicine" | "engineering" | "philosophy";

export type EpistemicDimension =
  | "methodological_rigor"
  | "reproducibility"
  | "citation_integrity"
  | "peer_review_status"
  | "data_transparency"
  | "ai_provenance"
  | "longevity_potential"
  | "epistemological_novelty";

export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface EpistemicProfile {
  litleId: string;
  dimensions: Record<EpistemicDimension, QualityScore>;
  compositeScore: number;
  domain: KnowledgeDomain;
  subdomains: string[];
  tags: string[];
  methodology: string;
  aiAssisted: boolean;
  hasEvidenceChain: boolean;
  hasCryptoSignature: boolean;
  metadata?: {
    timestamp?: string;
    citations?: number;
  };
}

export interface EpistemicFilter {
  minCompositeScore?: number;
  domains?: KnowledgeDomain[];
  dimensions?: Partial<Record<EpistemicDimension, QualityScore>>;
  aiAssisted?: boolean;
  hasEvidenceChain?: boolean;
  tags?: string[];
  sortBy?: "compositeScore" | "date" | "citations";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface EpistemicAggregation {
  dimensionAverages: Record<EpistemicDimension, number>;
  totalWorks: number;
  domainDistribution: Record<KnowledgeDomain, number>;
  averageCompositeScore: number;
  topTags: Array<{ tag: string; count: number }>;
}
