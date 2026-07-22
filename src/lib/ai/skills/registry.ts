// ────────────────────────────────────────────────────────────────
// Skill Registry — Isabella Skill Management System
// Registro, validación, cuarentena y despliegue de skills
// ────────────────────────────────────────────────────────────────

import type { SkillManifest, SkillEntry, SkillStatus, FederationMask, SignedPayload } from "../clawhub";
import { registerSkill, approveSkill, listSkills, getSkill, deprecateSkill } from "../clawhub";
import { createMexaClient } from "../mexa-api";

export type SkillOperation = "install" | "update" | "remove" | "audit";

export type SkillAuditResult = {
  skillName: string;
  version: string;
  passed: boolean;
  checks: {
    license: boolean;
    envVars: boolean;
    bins: boolean;
    systems: boolean;
    ethicalBoundaries: boolean;
    noObfuscation: boolean;
  };
  issues: string[];
};

const SKILL_HISTORY: { skill: string; operation: SkillOperation; timestamp: number; result: string }[] = [];

export function auditSkill(manifest: SkillManifest): SkillAuditResult {
  const issues: string[] = [];
  const checks = {
    license: false,
    envVars: false,
    bins: false,
    systems: false,
    ethicalBoundaries: false,
    noObfuscation: true,
  };

  if (["MIT-0", "MIT", "Apache-2.0", "GPL-3.0"].includes(manifest.license)) {
    checks.license = true;
  } else {
    issues.push(`License ${manifest.license} not in approved list`);
  }

  if (manifest.requires.env.length > 0 && manifest.primaryEnv) {
    checks.envVars = manifest.requires.env.includes(manifest.primaryEnv);
    if (!checks.envVars) issues.push(`primaryEnv ${manifest.primaryEnv} not declared in requires.env`);
  } else {
    checks.envVars = true;
  }

  checks.bins = manifest.requires.bins.every((b) => b.length > 0);
  checks.systems = manifest.requires.systems.length > 0;
  if (!checks.systems) issues.push("No target systems declared");

  checks.ethicalBoundaries = manifest.ethicalBoundaries.length > 0;
  if (!checks.ethicalBoundaries) issues.push("No ethical boundaries declared");

  const passed = Object.values(checks).every(Boolean);

  return {
    skillName: manifest.name,
    version: manifest.version,
    passed,
    checks,
    issues,
  };
}

export function installSkill(
  manifest: SkillManifest,
  fedMask: FederationMask
): { entry: SkillEntry; audit: SkillAuditResult } {
  const audit = auditSkill(manifest);
  const mexa = createMexaClient();
  const signed = mexa.sign(manifest, fedMask);

  const entry = registerSkill(manifest, signed, (s: SignedPayload) => mexa.verify(s));

  SKILL_HISTORY.push({
    skill: manifest.name,
    operation: "install",
    timestamp: Date.now(),
    result: audit.passed ? "quarantine" : "rejected",
  });

  return { entry, audit };
}

export function approveSkillForDeployment(name: string, fedMask: FederationMask): SkillEntry | null {
  const approved = approveSkill(name, fedMask);
  if (approved) {
    SKILL_HISTORY.push({ skill: name, operation: "install", timestamp: Date.now(), result: "approved" });
  }
  return approved;
}

export function removeSkill(name: string): boolean {
  const deprecated = deprecateSkill(name);
  if (deprecated) {
    SKILL_HISTORY.push({ skill: name, operation: "remove", timestamp: Date.now(), result: "deprecated" });
  }
  return !!deprecated;
}

export function getSkillHistory(skillName?: string): { skill: string; operation: SkillOperation; timestamp: number; result: string }[] {
  if (skillName) return SKILL_HISTORY.filter((h) => h.skill === skillName);
  return SKILL_HISTORY;
}

export function skillRegistryStatus(): { total: number; byStatus: Record<SkillStatus, number> } {
  const all = listSkills();
  const byStatus: Record<SkillStatus, number> = {
    registered: 0,
    quarantine: 0,
    approved: 0,
    rejected: 0,
    deprecated: 0,
  };
  for (const skill of all) byStatus[skill.status]++;
  return { total: all.length, byStatus };
}
