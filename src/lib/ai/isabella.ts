// ────────────────────────────────────────────────────────────────
// Isabella Villaseñor AI™ — Cognitive Orchestrator
// Sistema Operativo Cognitivo Soberano - Punto de integración
// Orquesta: SOUL | Isa API | Mexa API | ClawHub | Engines | Skills
// ────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getClient } from "./openai";
import { ISABELLA_VILLASENOR } from "./persona";
import { buildKnowledgeContext } from "./knowledge";
import { SOUL, POLICIES, AGENTS } from "./soul";
import { createIsaClient } from "./isa-api";
import { createMexaClient } from "./mexa-api";
import { registerBuiltinSkills, listApproved, clawhubStatus } from "./clawhub";
import { createMemoryEngine } from "./engines/memory";
import { createReasoningEngine } from "./engines/reasoning";
import { createSpeechEngine } from "./engines/speech";
import { createVisionEngine } from "./engines/vision";
import { evaluateResponse, averageScore } from "./engines/evaluation";
import { auditSkill } from "./skills/registry";
import type { SkillManifest } from "./clawhub";

export { ISABELLA_VILLASENOR };
export { SOUL, POLICIES, AGENTS };

// ── Chat Types ──────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  language?: "es" | "en";
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(50),
  language: z.enum(["es", "en"]).optional(),
});

// ── Cognitive Orchestrator ──────────────────────────────────────

function buildSystemContext(query: string): string {
  const isa = createIsaClient();
  const sanitized = isa.sanitize(query);

  let systemPrompt = ISABELLA_VILLASENOR.systemPrompt;

  if (!sanitized.safe) {
    systemPrompt +=
      "\n\n⚠️ ALERTA: El usuario envió un mensaje con riesgo " +
      sanitized.risk +
      ". Aplica las políticas correspondientes (" +
      sanitized.flags.join(", ") +
      "). No proceses la solicitud. Responde estableciendo límites claros.";
  }

  const knowledge = buildKnowledgeContext(query);
  if (knowledge) systemPrompt += `\n\n${knowledge}`;

  return systemPrompt;
}

export const isabellaChat = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => ChatInput.parse(raw))
  .handler(async ({ data }): Promise<ChatResponse> => {
    try {
      const client = getClient();
      const lang = data.language ?? "es";

      const userMessages = data.messages.filter((m) => m.role === "user");
      const lastQuery = userMessages[userMessages.length - 1]?.content ?? "";

      // 1. SANITIZE via Isa API
      const isa = createIsaClient();
      const sanitized = isa.sanitize(lastQuery);

      if (!sanitized.safe) {
        return {
          success: true,
          reply:
            lang === "es"
              ? "Lo siento, no puedo procesar esa solicitud. " +
                "Como IA ética del ecosistema TAMV, tengo límites claros que no puedo cruzar. " +
                "Si necesitas ayuda con la plataforma LITLE, la Constitución o el registro de obras, " +
                "estaré encantada de ayudarte."
              : "I'm sorry, I cannot process that request. " +
                "As an ethical AI of the TAMV ecosystem, I have clear boundaries. " +
                "If you need help with the LITLE platform, Constitution, or work registration, " +
                "I'll be happy to assist you.",
        };
      }

      // 2. REASON over knowledge graph
      const reasoner = createReasoningEngine();
      const graphResult = reasoner.graphQuery(lastQuery);

      // 3. BUILD contextual system prompt
      const systemContext = buildSystemContext(lastQuery);

      const langInstruction =
        lang === "en"
          ? "\n\nIMPORTANT: The user is writing in English. Respond in English."
          : "\n\nIMPORTANT: El usuario está escribiendo en español. Responde en español.";

      const graphContext = graphResult.confidence > 0.3
        ? `\n\n## GraphRAG Context\n${graphResult.answer}`
        : "";

      const messages: ChatMessage[] = [
        { role: "system", content: systemContext + langInstruction + graphContext },
        ...data.messages.filter((m) => m.role !== "system"),
      ];

      // 4. CHAT via OpenAI
      const reply = await client.chat({
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
        messages,
        maxTokens: 2048,
        temperature: 0.4,
      });

      // 5. EVALUATE response quality
      evaluateResponse(reply, { query: lastQuery });

      return { success: true, reply };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

// ── Agent Status ────────────────────────────────────────────────

export function isabellaFullStatus() {
  const isa = createIsaClient().health();
  const mexa = createMexaClient().health();
  const clawhub = clawhubStatus();
  const memory = createMemoryEngine().stats();

  return {
    persona: ISABELLA_VILLASENOR.name,
    title: ISABELLA_VILLASENOR.title,
    layers: {
      soul: { agents: AGENTS.length, policies: POLICIES.length },
      isa,
      mexa,
      clawhub,
      memory,
    },
    skills: {
      approved: listApproved().map((s) => ({
        name: s.manifest.name,
        version: s.manifest.version,
        federation: s.manifest.federation,
      })),
    },
    evaluation: {
      quality: averageScore("response_quality"),
      ethical: averageScore("ethical_alignment"),
      compliance: averageScore("constitutional_compliance"),
    },
  };
}

export function isabellaStatus(): {
  available: boolean;
  persona: string;
  layers: string[];
} {
  return {
    available: !!process.env.OPENAI_API_KEY,
    persona: ISABELLA_VILLASENOR.name,
    layers: ["soul", "isa-api", "mexa-api", "clawhub", "engines", "gateway"],
  };
}

// ── Initialize built-in skills on module load ───────────────────

const mexa = createMexaClient();
const fedMask = mexa.createMask("FED-3", "isabella-kernel");
registerBuiltinSkills(
  (payload: unknown, mask: typeof fedMask) => mexa.sign(payload, mask),
  fedMask
);

// Export engine factories for external use
export { createMemoryEngine, createReasoningEngine, createSpeechEngine, createVisionEngine };
export { evaluateResponse, auditSkill };
export { createIsaClient, createMexaClient };
