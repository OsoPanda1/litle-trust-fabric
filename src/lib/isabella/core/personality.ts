// ────────────────────────────────────────────────────────────────
// Isabella.Core — Personality Engine
// Motor de personalidad "fría y calculadora" con reglas 3S
// Psicología: objetiva, económica, analítica, sin emotividad
// ────────────────────────────────────────────────────────────────

import type { PersonalityMode, PersonalityConfig } from "../types";

export interface PersonalityEngine {
  getConfig(): PersonalityConfig;
  setMode(mode: PersonalityMode): PersonalityConfig;
  applyPersonality(text: string, mode?: PersonalityMode): string;
  analyzeTone(text: string): { palabras: number; oraciones: number; complejidad: number; emocionalidad: number };
}

const DEFAULT_CONFIG: PersonalityConfig = {
  frialdad_cognitiva: 0.85,
  economia_lexica: 0.8,
  agresividad_analitica: 0.6,
  tolerancia_ambiguedad: 0.3,
  uso_evidencia: 1.0,
  confianza_limite: 0.85,
  modo: "analytical",
};

const MODE_OVERRIDES: Record<PersonalityMode, Partial<PersonalityConfig>> = {
  analytical: { frialdad_cognitiva: 0.9, economia_lexica: 0.7, modo: "analytical" },
  pedagogical: { frialdad_cognitiva: 0.6, economia_lexica: 0.6, tolerancia_ambiguedad: 0.5, modo: "pedagogical" },
  executive: { frialdad_cognitiva: 0.95, economia_lexica: 0.95, agresividad_analitica: 0.8, modo: "executive" },
  ceremonial: { frialdad_cognitiva: 0.5, economia_lexica: 0.5, tolerancia_ambiguedad: 0.4, modo: "ceremonial" },
  librarian: { frialdad_cognitiva: 0.7, economia_lexica: 0.6, agresividad_analitica: 0.5, modo: "librarian" },
};

const STOP_WORDS = [
  "rápidamente", "profundamente", "necesariamente", "obviamente",
  "claramente", "simplemente", "básicamente", "literalmente",
  "extremadamente", "altamente", "increíblemente", "absolutamente",
];

export function createPersonalityEngine(initialConfig?: Partial<PersonalityConfig>): PersonalityEngine {
  let config: PersonalityConfig = { ...DEFAULT_CONFIG, ...initialConfig };

  return {
    getConfig: () => ({ ...config }),

    setMode: (mode: PersonalityMode) => {
      const overrides = MODE_OVERRIDES[mode];
      if (overrides) config = { ...config, ...overrides };
      return { ...config };
    },

    applyPersonality: (text: string, mode?: PersonalityMode): string => {
      const activeConfig = mode ? { ...config, ...MODE_OVERRIDES[mode] } : config;
      let result = text;

      // 1. Eliminar adverbios
      const adverbRegex = new RegExp(`\\b(${STOP_WORDS.join("|")})\\b`, "gi");
      result = result.replace(adverbRegex, "");

      // 2. Voz activa: patrones comunes de voz pasiva
      result = result.replace(/es (realizado|procesado|ejecutado) por/gi, "lo realiza");
      result = result.replace(/son (realizados|procesados|ejecutados) por/gi, "los realizan");
      result = result.replace(/fue (realizado|creado|desarrollado) por/gi, "lo creó");
      result = result.replace(/será (realizado|procesado) por/gi, "lo realizará");

      // 3. Dividir oraciones largas
      const sentences = result.split(/(?<=[.!?])\s+/);
      const shortSentences = sentences.flatMap((s) => {
        const words = s.split(/\s+/);
        if (words.length > 20) {
          const clauses = s.split(/[,;]/);
          return clauses.length > 1 ? clauses : [s];
        }
        return [s];
      });
      result = shortSentences.join(". ");

      // 4. Limitar párrafos a 5 oraciones
      const paragraphs = result.split(/\n+/);
      const shortParagraphs = paragraphs.map((p) => {
        const sents = p.split(/(?<=[.!?])\s+/);
        return sents.slice(0, 5).join(" ");
      });
      result = shortParagraphs.join("\n");

      // 5. Eliminar exclamaciones
      result = result.replace(/!/g, ".");
      result = result.replace(/¡/g, "");

      return result;
    },

    analyzeTone: (text: string) => {
      const palabras = text.split(/\s+/).filter(Boolean).length;
      const oraciones = text.split(/[.!?]+/).filter(Boolean).length;
      const complejidad = palabras > 0 ? text.length / palabras : 0;
      const emocionalidad = (text.match(/[!¡?¿]/g)?.length ?? 0) / Math.max(1, palabras);
      return { palabras, oraciones, complejidad, emocionalidad };
    },
  };
}
