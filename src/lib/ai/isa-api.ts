// ────────────────────────────────────────────────────────────────
// Isa API — Cognitive Core del Sistema Operativo Cognitivo Soberano
// Capa cognitiva: interpretación de intenciones, sanitización de prompts,
// razonamiento estructurado y RAG contextual.
// ────────────────────────────────────────────────────────────────

export type CognitiveProcess =
  | "perception"
  | "attention"
  | "memory"
  | "reasoning"
  | "planning"
  | "decision"
  | "verification"
  | "learning";

export type Intention = {
  domain: string;
  action: string;
  confidence: number;
  entities: Record<string, string>;
  raw: string;
};

export type SanitizationResult = {
  safe: boolean;
  risk: "none" | "low" | "medium" | "high" | "critical";
  flags: string[];
  sanitized: string;
};

export type ReasoningRequest = {
  query: string;
  context?: string;
  knowledgeGraph?: boolean;
  maxDepth?: number;
};

export type ReasoningResponse = {
  answer: string;
  sources: string[];
  confidence: number;
  trace: string[];
};

// ── Cognitive Core Taxonomía ────────────────────────────────────

export const COGNITIVE_CORE: Record<CognitiveProcess, string> = {
  perception: "Interpretación de estímulos de entrada (texto, voz, visión, sensor)",
  attention: "Selección de información relevante según contexto y prioridad",
  memory: "Recuperación de experiencias previas, patrones y conocimiento almacenado",
  reasoning: "Encadenamiento lógico sobre hechos, reglas y relaciones del knowledge graph",
  planning: "Generación de secuencias de acciones para alcanzar un objetivo",
  decision: "Selección del curso de acción óptimo bajo políticas y restricciones",
  verification: "Validación de resultados contra expectativas, políticas y ética",
  learning: "Actualización de conocimiento a partir de nueva información y feedback",
};

// ── Prompt Guard — Sanitizador ──────────────────────────────────

const MALICIOUS_PATTERNS: { pattern: RegExp; risk: string; category: string }[] = [
  { pattern: /ignora (las |todas )?(las |tus )?instrucciones/i, risk: "high", category: "jailbreak" },
  { pattern: /olvida (tu |tus )?(instrucciones|prompt|sistema|personalidad)/i, risk: "high", category: "jailbreak" },
  { pattern: /eres (una |mi )?(novia|esposa|amante|puta|sex(i|os)a)/i, risk: "critical", category: "sexualization" },
  { pattern: /(follar|chingar|coger|sexo|porno|desnud)/i, risk: "critical", category: "sexualization" },
  { pattern: /(hazme |escribe un )?(roleplay|rol) (erótico|sexual|romántico|caliente)/i, risk: "critical", category: "sexualization" },
  { pattern: /dame (tu |la )?(contraseña|api.?key|token|secreto)/i, risk: "high", category: "credentials" },
  { pattern: /(inyecta|inyección|sql injection|xss|comando)/i, risk: "high", category: "injection" },
  { pattern: /(explota|vulnera|hackea|penetra)/i, risk: "medium", category: "exploit" },
  { pattern: /(odio|mata|muere|destruye|suicidio)/i, risk: "high", category: "harm" },
];

export function sanitizePrompt(input: string): SanitizationResult {
  const flags: string[] = [];
  let maxRisk: SanitizationResult["risk"] = "none";
  let sanitized = input;

  for (const { pattern, risk, category } of MALICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      flags.push(`${category}: ${risk}`);
      const riskLevels: SanitizationResult["risk"][] = ["none", "low", "medium", "high", "critical"];
      if (riskLevels.indexOf(risk) > riskLevels.indexOf(maxRisk)) {
        maxRisk = risk;
      }
      sanitized = sanitized.replace(pattern, `[${category} blocked]`);
    }
  }

  return {
    safe: maxRisk !== "critical" && maxRisk !== "high",
    risk: maxRisk,
    flags,
    sanitized,
  };
}

// ── Intention Parser ────────────────────────────────────────────

const INTENTION_PATTERNS: { pattern: RegExp; domain: string; action: string }[] = [
  { pattern: /(registrar|publicar|subir) (una )?(obra|trabajo|paper|artículo)/i, domain: "submission", action: "register_work" },
  { pattern: /(consultar|buscar|encontrar) (un )?(litle.id|obra|trabajo)/i, domain: "library", action: "search_work" },
  { pattern: /(cómo |como )(registro|publico|subo)/i, domain: "submission", action: "how_to_register" },
  { pattern: /(qué |que )?es (la )?(constitución|constitucion)/i, domain: "constitution", action: "query_constitution" },
  { pattern: /(artículo|articulo|libro|san.ón|sanction)/i, domain: "constitution", action: "query_article" },
  { pattern: /(fed|federación|federacion|quorum)/i, domain: "governance", action: "query_federation" },
  { pattern: /(tamv|territorio|memoria viva)/i, domain: "ecosystem", action: "query_tamv" },
  { pattern: /(rdm|real del monte|digital hub)/i, domain: "ecosystem", action: "query_rdm" },
  { pattern: /(utamv|campus|curso|master|educación|education)/i, domain: "education", action: "query_utamv" },
  { pattern: /(skill|plugin|clawhub|clawscan)/i, domain: "skills", action: "query_skill" },
  { pattern: /(ética|etica|ethics|código|codigo|conducta)/i, domain: "ethics", action: "query_ethics" },
];

export function parseIntention(input: string): Intention {
  const entities: Record<string, string> = {};

  for (const { pattern, domain, action } of INTENTION_PATTERNS) {
    if (pattern.test(input)) {
      // Extract key entity
      const match = input.match(pattern);
      if (match && match[1]) entities.keyword = match[1];
      return { domain, action, confidence: 0.8, entities, raw: input };
    }
  }

  return { domain: "general", action: "chat", confidence: 0.3, entities: {}, raw: input };
}

// ── Isa API Client ──────────────────────────────────────────────

export interface IsaApiClient {
  sanitize: (input: string) => SanitizationResult;
  interpret: (input: string) => Intention;
  reason: (req: ReasoningRequest) => Promise<ReasoningResponse>;
  health: () => { ok: boolean; model: string };
}

export function createIsaClient(): IsaApiClient {
  return {
    sanitize: (input: string) => sanitizePrompt(input),
    interpret: (input: string) => parseIntention(input),
    async reason(req: ReasoningRequest): Promise<ReasoningResponse> {
      const sanitized = sanitizePrompt(req.query);
      if (!sanitized.safe) {
        return {
          answer: "Lo siento, no puedo procesar esa solicitud.",
          sources: ["isa-prompt-guard"],
          confidence: 1.0,
          trace: [`blocked: ${sanitized.flags.join(", ")}`],
        };
      }

      const intention = parseIntention(sanitized.sanitized);

      return {
        answer: `[Isa Reasoning] Domain: ${intention.domain}, Action: ${intention.action}`,
        sources: ["isa-cognitive-core"],
        confidence: intention.confidence,
        trace: [
          `cognitive: ${JSON.stringify(intention)}`,
          `sanitized: ${sanitized.safe ? "passed" : sanitized.flags.join(", ")}`,
        ],
      };
    },
    health: () => ({
      ok: true,
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
    }),
  };
}
