import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type OpenAIClient = {
  chat: (opts: { model?: string; messages: Array<{ role: "system" | "user" | "assistant"; content: string }>; maxTokens?: number; temperature?: number }) => Promise<string>;
  embed: (opts: { input: string; model?: string }) => Promise<number[]>;
};

let client: OpenAIClient | null = null;

function getClient(): OpenAIClient {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set. Add it to .env or skip AI features.");
  }

  const baseUrl = "https://api.openai.com/v1";
  const orgId = process.env.OPENAI_ORG_ID ?? "";

  client = {
    async chat(opts) {
      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(orgId ? { "OpenAI-Organization": orgId } : {}),
        },
        body: JSON.stringify({
          model: opts.model ?? process.env.OPENAI_MODEL ?? "gpt-4o",
          messages: opts.messages,
          max_tokens: opts.maxTokens ?? 1024,
          temperature: opts.temperature ?? 0.3,
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenAI chat error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return data.choices[0].message.content;
    },

    async embed(opts) {
      const resp = await fetch(`${baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(orgId ? { "OpenAI-Organization": orgId } : {}),
        },
        body: JSON.stringify({
          model: opts.model ?? process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
          input: opts.input,
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenAI embedding error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return data.data[0].embedding;
    },
  };

  return client;
}

const EpistemicScoringInput = z.object({
  title: z.string().min(1).max(500),
  abstract: z.string().min(1).max(10000),
  methodology: z.string().optional(),
});

export const aiScoreWork = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => EpistemicScoringInput.parse(raw))
  .handler(async ({ data }) => {
    try {
      const c = getClient();
      const prompt = `You are a LITLE epistemic scoring assistant. Score the following academic work across 9 dimensions (0-5 each). Return ONLY a JSON object with keys: methodological_rigor, reproducibility, citation_integrity, peer_review_status, data_transparency, ai_provenance, longevity_potential, epistemological_novelty, human_machine_readability.

Title: ${data.title}
Abstract: ${data.abstract}
${data.methodology ? `Methodology: ${data.methodology}` : ""}`;

      const result = await c.chat({
        messages: [
          { role: "system", content: "You are an expert academic reviewer. Respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        maxTokens: 512,
        temperature: 0.2,
      });

      const cleaned = result.replace(/```(json)?/g, "").trim();
      return { success: true as const, scores: JSON.parse(cleaned) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const aiEnhanceTriangulation = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => EpistemicScoringInput.parse(raw))
  .handler(async ({ data }) => {
    try {
      const c = getClient();
      const prompt = `Analyze this academic submission for potential duplicate publications or ethical concerns. Return a JSON object with: duplicate_probability (0-1), ethical_concerns (array of strings), recommended_action (index | flag | reject).

Title: ${data.title}
Abstract: ${data.abstract}`;

      const result = await c.chat({
        messages: [
          { role: "system", content: "You are a research integrity officer. Respond with JSON only." },
          { role: "user", content: prompt },
        ],
        maxTokens: 512,
        temperature: 0.1,
      });

      const cleaned = result.replace(/```(json)?/g, "").trim();
      return { success: true as const, analysis: JSON.parse(cleaned) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export function getClientStatus(): { configured: boolean; model: string } {
  return {
    configured: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
  };
}
