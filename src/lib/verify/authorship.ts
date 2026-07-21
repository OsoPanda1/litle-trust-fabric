import { sha256 } from "@noble/hashes/sha2.js";

export interface WritingProfile {
  authorId: string;
  meanWordLength: number;
  stdWordLength: number;
  meanSentenceLength: number;
  stdSentenceLength: number;
  vocabularyRichness: number;
  functionWordRatio: number;
  avgParagraphLength: number;
  passiveVoiceRatio: number;
  samples: number;
}

export interface AuthorshipResult {
  likelihood: number;
  isVerified: boolean;
  threshold: number;
  falseAlarmRate: number;
  distanceMetrics: Record<string, number>;
}

function extractFeatures(text: string): Record<string, number> {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  if (words.length === 0 || sentences.length === 0) {
    return {
      meanWordLength: 0,
      stdWordLength: 0,
      meanSentenceLength: 0,
      stdSentenceLength: 0,
      vocabularyRichness: 0,
      functionWordRatio: 0,
      avgParagraphLength: 0,
      passiveVoiceRatio: 0,
    };
  }

  const wordLengths = words.map((w) => w.length);
  const meanWordLength = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length;
  const stdWordLength = Math.sqrt(wordLengths.reduce((a, b) => a + (b - meanWordLength) ** 2, 0) / wordLengths.length);

  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const meanSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const stdSentenceLength = Math.sqrt(sentenceLengths.reduce((a, b) => a + (b - meanSentenceLength) ** 2, 0) / sentenceLengths.length);

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const vocabularyRichness = uniqueWords.size / words.length;

  const functionWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "can", "could", "may", "might", "shall", "should", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "not", "no", "nor", "so", "as", "if", "then", "than", "when", "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "only", "own", "same", "too", "very", "just", "also", "well", "still", "even", "already", "always", "never", "often", "once"]);
  const functionWordCount = words.filter((w) => functionWords.has(w.toLowerCase())).length;
  const functionWordRatio = functionWordCount / words.length;

  const avgParagraphLength = paragraphs.reduce((a, b) => a + b.split(/\s+/).filter(Boolean).length, 0) / paragraphs.length;

  const passivePattern = /\b(?:is|are|was|were|been|being)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passivePattern);
  const passiveVoiceRatio = (passiveMatches?.length ?? 0) / sentences.length;

  return {
    meanWordLength,
    stdWordLength,
    meanSentenceLength,
    stdSentenceLength,
    vocabularyRichness,
    functionWordRatio,
    avgParagraphLength,
    passiveVoiceRatio,
  };
}

function buildProfile(features: Record<string, number>, authorId: string): WritingProfile {
  return {
    authorId,
    meanWordLength: features.meanWordLength,
    stdWordLength: features.stdWordLength,
    meanSentenceLength: features.meanSentenceLength,
    stdSentenceLength: features.stdSentenceLength,
    vocabularyRichness: features.vocabularyRichness,
    functionWordRatio: features.functionWordRatio,
    avgParagraphLength: features.avgParagraphLength,
    passiveVoiceRatio: features.passiveVoiceRatio,
    samples: 1,
  };
}

function gaussianLikelihood(x: number, mean: number, std: number): number {
  if (std === 0) return x === mean ? 1 : 0;
  return Math.exp(-((x - mean) ** 2) / (2 * std * std)) / (std * Math.sqrt(2 * Math.PI));
}

export function compareProfiles(sample: string, profile: WritingProfile): AuthorshipResult {
  const features = extractFeatures(sample);
  const sampleProfile = buildProfile(features, "sample");

  const dimensions: Array<keyof WritingProfile> = [
    "meanWordLength", "stdWordLength", "meanSentenceLength", "stdSentenceLength",
    "vocabularyRichness", "functionWordRatio", "avgParagraphLength", "passiveVoiceRatio",
  ];

  const distanceMetrics: Record<string, number> = {};
  let logLikelihood = 0;
  let validDimensions = 0;

  for (const dim of dimensions) {
    const sv = sampleProfile[dim] as number;
    const pv = profile[dim] as number;
    const ps = Math.max(profile.stdWordLength, 0.01);

    const diff = Math.abs(sv - pv);
    const zScore = diff / ps;
    distanceMetrics[dim] = zScore;

    const likelihood = gaussianLikelihood(sv, pv, ps);
    if (likelihood > 0) {
      logLikelihood += Math.log(likelihood);
      validDimensions++;
    }
  }

  const avgLikelihood = validDimensions > 0 ? Math.exp(logLikelihood / validDimensions) : 0;
  const threshold = 0.3;
  const far = 0.02;

  return {
    likelihood: Math.round(avgLikelihood * 1000) / 1000,
    isVerified: avgLikelihood >= threshold,
    threshold,
    falseAlarmRate: far,
    distanceMetrics,
  };
}

export function mergeProfiles(profiles: WritingProfile[]): WritingProfile {
  if (profiles.length === 0) throw new Error("No profiles to merge");
  if (profiles.length === 1) return profiles[0];

  const dims: Array<keyof WritingProfile> = [
    "meanWordLength", "stdWordLength", "meanSentenceLength", "stdSentenceLength",
    "vocabularyRichness", "functionWordRatio", "avgParagraphLength", "passiveVoiceRatio",
  ];

  const merged: Record<string, number> = {};
  for (const dim of dims) {
    merged[dim] = profiles.reduce((a, p) => a + (p[dim] as number), 0) / profiles.length;
  }

  return {
    authorId: profiles[0].authorId,
    meanWordLength: merged.meanWordLength,
    stdWordLength: merged.stdWordLength,
    meanSentenceLength: merged.meanSentenceLength,
    stdSentenceLength: merged.stdSentenceLength,
    vocabularyRichness: merged.vocabularyRichness,
    functionWordRatio: merged.functionWordRatio,
    avgParagraphLength: merged.avgParagraphLength,
    passiveVoiceRatio: merged.passiveVoiceRatio,
    samples: profiles.reduce((a, p) => a + p.samples, 0),
  };
}

export function createProfileFromTexts(texts: string[], authorId: string): WritingProfile {
  const profiles = texts.map((t) => {
    const features = extractFeatures(t);
    return buildProfile(features, authorId);
  });
  return mergeProfiles(profiles);
}
