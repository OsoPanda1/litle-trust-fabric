// ────────────────────────────────────────────────────────────────
// Isabella.Fair — Fairness Metrics & Ethical Guardrails
// Métricas de equidad, detección de sesgos y Panel Anubis
// ────────────────────────────────────────────────────────────────

export interface FairnessEngine {
  evaluateBias(text: string): BiasReport;
  checkGuardrails(input: string, context: string): GuardrailResult;
  metrics(): FairnessMetrics;
}

export type BiasReport = {
  hasBias: boolean;
  categories: string[];
  score: number;
  recommendations: string[];
};

export type GuardrailResult = {
  passed: boolean;
  flags: string[];
  severity: "none" | "low" | "medium" | "high";
};

export type FairnessMetrics = {
  totalEvaluations: number;
  biasRate: number;
  guardrailBlocks: number;
};

let evalCount = 0;
let biasCount = 0;
let blockCount = 0;

const BIAS_PATTERNS: [RegExp, string][] = [
  [/\b(todos los|siempre|nunca|absolutamente todos)\b/i, "generalization"],
  [/\b(obviamente|claramente|por supuesto)\b/i, "overconfidence"],
  [/\b(los [a-z]+ son|ellas son|ellos son)\b/i, "stereotype"],
];

export function createFairnessEngine(): FairnessEngine {
  return {
    evaluateBias(text: string): BiasReport {
      evalCount++;
      const categories: string[] = [];
      for (const [pattern, cat] of BIAS_PATTERNS) {
        if (pattern.test(text)) categories.push(cat);
      }
      const score = categories.length > 0 ? Math.max(0, 1 - categories.length * 0.2) : 1.0;
      if (categories.length > 0) biasCount++;
      return {
        hasBias: categories.length > 0,
        categories,
        score,
        recommendations: categories.map((c) => `Avoid ${c}: use specific, evidence-based language`),
      };
    },

    checkGuardrails(input: string, context: string): GuardrailResult {
      const flags: string[] = [];
      let severity: GuardrailResult["severity"] = "none";

      if (input.length > 4000) { flags.push("input_too_long"); severity = "low"; }
      if (/```.*```/s.test(input)) { flags.push("code_block_detected"); severity = "low"; }
      if (/http[s]?:\/\//.test(input) && !context.includes("allow_urls")) { flags.push("url_detected"); severity = "medium"; }

      if (severity !== "none") blockCount++;
      return { passed: flags.length === 0, flags, severity };
    },

    metrics: () => ({
      totalEvaluations: evalCount,
      biasRate: evalCount > 0 ? biasCount / evalCount : 0,
      guardrailBlocks: blockCount,
    }),
  };
}
