const REQUIRED_SERVER_VARS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "LITLE_AUTHOR_SECRET",
] as const;

const OPTIONAL_SERVER_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "OPENAI_ORG_ID",
  "GRAFANA_URL",
  "OTEL_EXPORTER_OTLP_ENDPOINT",
] as const;

const REQUIRED_CLIENT_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

export type EnvVar = (typeof REQUIRED_SERVER_VARS)[number] | (typeof OPTIONAL_SERVER_VARS)[number] | (typeof REQUIRED_CLIENT_VARS)[number];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateServerEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const v of REQUIRED_SERVER_VARS) {
    if (!process.env[v]) missing.push(v);
  }

  for (const v of OPTIONAL_SERVER_VARS) {
    if (!process.env[v]) warnings.push(`${v} (optional — set for ${v.toLowerCase().replace(/_/g, " ").replace(/api|otel|grafana|openai/g, (s) => s.toUpperCase())})`);
  }

  if (missing.length > 0) {
    console.error(`[LITLE Env] Missing required variables: ${missing.join(", ")}`);
  }
  if (warnings.length > 0) {
    console.warn(`[LITLE Env] Unset optional variables: ${warnings.join("; ")}`);
  }

  return { valid: missing.length === 0, missing, warnings };
}

export function validateClientEnv(): EnvValidationResult {
  const missing: string[] = [];
  for (const v of REQUIRED_CLIENT_VARS) {
    if (!import.meta.env[v]) missing.push(v);
  }
  return { valid: missing.length === 0, missing, warnings: [] };
}

export function getEnvVar(name: EnvVar): string {
  const val = typeof process !== "undefined"
    ? process.env[name]
    : (import.meta.env as Record<string, string>)[name];
  if (!val && (REQUIRED_SERVER_VARS as readonly string[]).includes(name)) {
    throw new Error(`[LITLE Env] Required variable ${name} is not set`);
  }
  return val ?? "";
}
