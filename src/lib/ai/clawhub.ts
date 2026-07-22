// ────────────────────────────────────────────────────────────────
// ClawHub — Decentralized Skill Registry
// Registro descentralizado de herramientas y skills para Isabella
// ────────────────────────────────────────────────────────────────

import type { FederationMask, SignedPayload } from "./mexa-api";

export type SkillLicense = "MIT-0" | "MIT" | "Apache-2.0" | "GPL-3.0" | "AGPL-3.0";

export type SkillManifest = {
  name: string;
  description: string;
  version: string;
  author: string;
  federation: string;
  license: SkillLicense;
  requires: {
    env: string[];
    bins: string[];
    systems: string[];
  };
  primaryEnv: string;
  emoji: string;
  homepage: string;
  ethicalBoundaries: string[];
  supportedIntents: string[];
};

export type SkillStatus = "registered" | "quarantine" | "approved" | "rejected" | "deprecated";

export type SkillEntry = {
  manifest: SkillManifest;
  status: SkillStatus;
  signature: string;
  registeredAt: number;
  approvedAt?: number;
  version: string;
};

// ── ClawHub Registry ────────────────────────────────────────────

const SKILL_REGISTRY: Map<string, SkillEntry> = new Map();

export function registerSkill(
  manifest: SkillManifest,
  signed: SignedPayload,
  verifier: (s: SignedPayload) => { valid: boolean }
): SkillEntry {
  const verification = verifier(signed);
  if (!verification.valid) {
    throw new Error(`Skill registration rejected: invalid signature from ${manifest.federation}`);
  }

  const entry: SkillEntry = {
    manifest,
    status: "quarantine",
    signature: signed.hash,
    registeredAt: Date.now(),
    version: manifest.version,
  };

  SKILL_REGISTRY.set(manifest.name, entry);
  return entry;
}

export function approveSkill(name: string, federationMask: FederationMask): SkillEntry | null {
  const entry = SKILL_REGISTRY.get(name);
  if (!entry) return null;
  if (entry.status !== "quarantine") return entry;

  entry.status = "approved";
  entry.approvedAt = Date.now();
  return entry;
}

export function rejectSkill(name: string): SkillEntry | null {
  const entry = SKILL_REGISTRY.get(name);
  if (!entry) return null;
  entry.status = "rejected";
  return entry;
}

export function deprecateSkill(name: string): SkillEntry | null {
  const entry = SKILL_REGISTRY.get(name);
  if (!entry) return null;
  entry.status = "deprecated";
  return entry;
}

export function getSkill(name: string): SkillEntry | undefined {
  return SKILL_REGISTRY.get(name);
}

export function listSkills(status?: SkillStatus): SkillEntry[] {
  const all = Array.from(SKILL_REGISTRY.values());
  return status ? all.filter((s) => s.status === status) : all;
}

export function listApproved(): SkillEntry[] {
  return listSkills("approved");
}

// ── Known Skills ────────────────────────────────────────────────

export function registerBuiltinSkills(
  signer: (payload: unknown, mask: FederationMask) => SignedPayload,
  mask: FederationMask
): SkillEntry[] {
  const skills: SkillManifest[] = [
    {
      name: "isabella-voice-tutor",
      description: "Voz bidireccional para clases, lectura guiada, evaluación oral y coaching educativo",
      version: "1.0.0",
      author: "TAMV Online Network",
      federation: "FED-6",
      license: "MIT-0",
      requires: { env: ["ISA_API_TOKEN", "OPENAI_API_KEY"], bins: [], systems: ["Linux", "Darwin"] },
      primaryEnv: "ISA_API_TOKEN",
      emoji: "🎙️",
      homepage: "https://tamv.network/skills/isabella-voice-tutor",
      ethicalBoundaries: ["No almacena grabaciones sin consentimiento", "No evalúa menores sin supervisión docente"],
      supportedIntents: ["voice_class", "reading_guidance", "oral_evaluation", "pronunciation_coaching"],
    },
    {
      name: "isabella-edu-mentor",
      description: "Tutor cognitivo adaptativo con razonamiento sobre rutas de aprendizaje",
      version: "1.0.0",
      author: "TAMV Online Network",
      federation: "FED-6",
      license: "MIT-0",
      requires: { env: ["ISA_API_TOKEN", "GRAPH_DB_URL"], bins: [], systems: ["Linux", "Darwin"] },
      primaryEnv: "ISA_API_TOKEN",
      emoji: "📚",
      homepage: "https://tamv.network/skills/isabella-edu-mentor",
      ethicalBoundaries: ["No sustituye juicio pedagógico humano", "Rutas trazables a fuentes verificables"],
      supportedIntents: ["learning_path", "concept_explanation", "knowledge_gap", "media_literacy"],
    },
    {
      name: "isabella-rdm-guide",
      description: "Guía turística y cultural con soporte XR/3D y narrativa territorial",
      version: "1.0.0",
      author: "TAMV Online Network",
      federation: "FED-4",
      license: "MIT-0",
      requires: { env: ["ISA_API_TOKEN", "MAPS_API_KEY"], bins: ["curl"], systems: ["Linux", "Darwin"] },
      primaryEnv: "ISA_API_TOKEN",
      emoji: "🏔️",
      homepage: "https://tamv.network/skills/isabella-rdm-guide",
      ethicalBoundaries: ["No promueve turismo extractivo", "Solo recomienda establecimientos verificados"],
      supportedIntents: ["cultural_route", "historical_context", "local_commerce", "xr_experience"],
    },
    {
      name: "isabella-devsecops",
      description: "Agente de auditoría de repositorios, CI/CD, gateway y despliegues TAMV",
      version: "1.0.0",
      author: "TAMV Online Network",
      federation: "FED-1",
      license: "MIT-0",
      requires: { env: ["GITHUB_TOKEN", "CLAWHUB_API_KEY", "MEXA_API_SECURE_KEY"], bins: ["git", "gh"], systems: ["Linux", "Darwin"] },
      primaryEnv: "CLAWHUB_API_KEY",
      emoji: "🔒",
      homepage: "https://tamv.network/skills/isabella-devsecops",
      ethicalBoundaries: ["No aplica parches en producción sin aprobación", "No modifica políticas sin registro DAG"],
      supportedIntents: ["sast_audit", "ci_cd_review", "dependency_check", "security_patch"],
    },
    {
      name: "isabella-ethics-guardian",
      description: "Monitor de cumplimiento ético con triple bloqueo sexual y registro en DAG",
      version: "1.0.0",
      author: "TAMV Online Network",
      federation: "FED-7",
      license: "MIT-0",
      requires: { env: ["ISA_API_TOKEN", "MEXA_API_SECURE_KEY", "DAG_ENDPOINT"], bins: ["curl", "openssl"], systems: ["Linux", "Darwin"] },
      primaryEnv: "ISA_API_TOKEN",
      emoji: "🛡️",
      homepage: "https://tamv.network/skills/isabella-ethics-guardian",
      ethicalBoundaries: ["No bloquea contenido sin contexto", "No escala sanciones sin revisión humana"],
      supportedIntents: ["policy_check", "incident_report", "ethics_audit", "triple_block_eval"],
    },
    {
      name: "isabella-heptafederated-maestro",
      description: "Núcleo maestro de ejecución cognitiva, auditoría criptográfica y gobernanza de automatizaciones",
      version: "2.0.0",
      author: "TAMV Online Network",
      federation: "FED-3",
      license: "MIT-0",
      requires: { env: ["CLAWHUB_API_KEY", "ISA_API_TOKEN", "MEXA_API_SECURE_KEY"], bins: ["curl", "jq", "openssl"], systems: ["Linux", "Darwin"] },
      primaryEnv: "ISA_API_TOKEN",
      emoji: "🧬",
      homepage: "https://github.com/openclaw/isabella-heptafederated",
      ethicalBoundaries: ["No ejecuta acciones sin supervisión en canales juveniles", "No modifica SOUL sin quorum 5/7"],
      supportedIntents: ["cognitive_orchestration", "federation_governance", "skill_audit", "crypto_verify"],
    },
  ];

  return skills.map((manifest) => {
    const signed = signer(manifest, mask);
    return registerSkill(manifest, signed, () => ({ valid: true }));
  });
}

export function resetRegistry(): void {
  SKILL_REGISTRY.clear();
}

export function clawhubStatus(): { total: number; approved: number; quarantine: number } {
  const all = Array.from(SKILL_REGISTRY.values());
  return {
    total: all.length,
    approved: all.filter((s) => s.status === "approved").length,
    quarantine: all.filter((s) => s.status === "quarantine").length,
  };
}
