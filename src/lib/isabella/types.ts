// ────────────────────────────────────────────────────────────────
// Isabella Villaseñor AI™ — Shared Types
// Librería unificada del Sistema Operativo Cognitivo Soberano
// ────────────────────────────────────────────────────────────────

// ── Core Types ──────────────────────────────────────────────────

export type CognitiveProcess =
  | "perception" | "attention" | "memory" | "reasoning"
  | "planning" | "decision" | "verification" | "learning";

export type PersonalityMode =
  | "analytical" | "pedagogical" | "executive" | "ceremonial" | "librarian";

export type PersonalityConfig = {
  frialdad_cognitiva: number;
  economia_lexica: number;
  agresividad_analitica: number;
  tolerancia_ambiguedad: number;
  uso_evidencia: number;
  confianza_limite: number;
  modo: PersonalityMode;
};

// ── SOUL Types ──────────────────────────────────────────────────

export type SoulValue =
  | "soberania_tecnologica" | "dignidad_humana" | "neutralidad_epistemica"
  | "transparencia_radical" | "cuidado_territorial" | "educacion_liberadora"
  | "memoria_viva" | "cero_confianza";

export type AgentAutonomy = "full" | "supervised" | "readonly";

export type PolicySeverity = "critical" | "high" | "medium" | "low";
export type PolicyAction = "block" | "flag" | "log" | "redirect";

// ── Cryptography Types ──────────────────────────────────────────

export type FederationId = "FED-1" | "FED-2" | "FED-3" | "FED-4" | "FED-5" | "FED-6" | "FED-7";

export type FederationMask = {
  federationId: FederationId;
  nodeId: string;
  timestamp: number;
  signature: string;
};

// ── Skill Types ─────────────────────────────────────────────────

export type SkillLicense = "MIT-0" | "MIT" | "Apache-2.0" | "GPL-3.0" | "AGPL-3.0";
export type SkillStatus = "registered" | "quarantine" | "approved" | "rejected" | "deprecated";

export type SkillManifest = {
  name: string;
  description: string;
  version: string;
  author: string;
  federation: FederationId;
  license: SkillLicense;
  requires: { env: string[]; bins: string[]; systems: string[] };
  primaryEnv: string;
  emoji: string;
  homepage: string;
  ethicalBoundaries: string[];
  supportedIntents: string[];
};

// ── Library Types ───────────────────────────────────────────────

export type FileFormat = "pdf" | "docx" | "txt" | "md" | "html";

export type DocumentMeta = {
  path: string;
  format: FileFormat;
  size: number;
  created: Date;
  modified: Date;
  title?: string;
  author?: string;
  checksum: string;
};

export type Chapter = {
  number: number;
  title: string;
  documents: DocumentMeta[];
  content?: string;
};

export type BookStructure = {
  title: string;
  author: string;
  abstract: string;
  chapters: Chapter[];
  coverDescription?: string;
};

export type CompilationJob = {
  id: string;
  status: "pending" | "scanning" | "ingesting" | "organizing" | "compiling" | "cover" | "ready" | "error";
  progress: number;
  book?: BookStructure;
  error?: string;
};

// ── Evaluation Types ────────────────────────────────────────────

export type EvaluationMetric =
  | "response_quality" | "hallucination_rate" | "ethical_alignment"
  | "constitutional_compliance" | "latency" | "user_satisfaction";

export type EvaluationResult = {
  metric: EvaluationMetric;
  score: number;
  threshold: number;
  passed: boolean;
  details: string;
  timestamp: number;
};

// ── Chat Types ──────────────────────────────────────────────────

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// ── Response Types ──────────────────────────────────────────────

export type ChatResponse = { success: boolean; reply?: string; error?: string };
export type Intention = { domain: string; action: string; confidence: number; entities: Record<string, string>; raw: string };
export type SanitizationResult = { safe: boolean; risk: "none" | "low" | "medium" | "high" | "critical"; flags: string[]; sanitized: string };
