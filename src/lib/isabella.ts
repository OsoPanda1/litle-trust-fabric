// ────────────────────────────────────────────────────────────────
// Isabella Villaseñor AI™ — Punto de Integración Principal
// Unifica: SOUL · Isa API · Mexa API · ClawHub · Library · Engines
// ────────────────────────────────────────────────────────────────

// Re-exportar todo desde la librería unificada
export * from "./isabella/index";

// Exportaciones específicas para integración con plataforma
export { isabellaVersion, isabellaOrigin } from "./isabella/index";
export { createCognitiveOrchestrator } from "./isabella/core/orchestrator";
export { createPersonalityEngine } from "./isabella/core/personality";
export type { PersonalityEngine } from "./isabella/core/personality";
export { SOUL, AGENTS, POLICIES } from "./isabella/soul/identity";
export { createMemoryEngine } from "./isabella/memory/engine";
export { createFederationMask, verifyFederationMask } from "./isabella/crypto/federation";
export { createSkillRegistry, registerBuiltinSkills } from "./isabella/skills/registry";
export { createLibraryEngine } from "./isabella/library/index";
export { createEvaluationEngine } from "./isabella/evaluation/engine";
export { createFairnessEngine } from "./isabella/fair/metrics";
