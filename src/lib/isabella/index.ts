// ────────────────────────────────────────────────────────────────
// Isabella Villaseñor AI™ — Librería Unificada
// Sistema Operativo Cognitivo Soberano del Ecosistema TAMV
//
// Integración total: SOUL · Isa API · Mexa API · ClawHub · Library
// ────────────────────────────────────────────────────────────────

export * from "./types";

// Core
export { createCognitiveOrchestrator } from "./core/orchestrator";
export type { CognitiveOrchestrator } from "./core/orchestrator";
export { createPersonalityEngine } from "./core/personality";
export type { PersonalityEngine } from "./core/personality";

// Soul
export { SOUL, AGENTS, POLICIES, findPolicy, findAgent } from "./soul/identity";

// Memory
export { createMemoryEngine } from "./memory/engine";
export type { MemoryEngine, MemoryEntry, MemoryQuery } from "./memory/engine";
export { createLibrarianMemory } from "./memory/librarian";
export type { LibrarianMemory } from "./memory/librarian";

// Crypto
export { createFederationMask, verifyFederationMask, signPayload, verifySignedPayload } from "./crypto/federation";
export type { SignedPayload, VerificationResult } from "./crypto/federation";

// Skills
export { createSkillRegistry, registerBuiltinSkills, listApprovedSkills } from "./skills/registry";
export type { SkillRegistry } from "./skills/registry";

// XRAI
export { createXrRenderer } from "./xrai/renderer";
export type { XrRenderer } from "./xrai/renderer";

// Fair
export { createFairnessEngine } from "./fair/metrics";
export type { FairnessEngine } from "./fair/metrics";

// Library
export { createLibraryEngine } from "./library/index";
export type { LibraryEngine } from "./library/index";
export { createIngestEngine } from "./library/ingest";
export { createOrganizeEngine } from "./library/organize";
export { createCompileEngine } from "./library/compile";
export { createCoverEngine } from "./library/cover";
export { createPublishEngine } from "./library/publish";

// Evaluation
export { createEvaluationEngine } from "./evaluation/engine";
export type { EvaluationEngine } from "./evaluation/engine";

// Isabella system info
export function isabellaVersion(): string {
  return "Isabella Villaseñor AI™ Ω-Core 3.0.0";
}

export function isabellaOrigin(): { name: string; author: string; origin: string; model: string } {
  return {
    name: "Isabella Villaseñor",
    author: "Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)",
    origin: "Real del Monte, Hidalgo, México",
    model: "SCAO — ZT-DCOS",
  };
}
